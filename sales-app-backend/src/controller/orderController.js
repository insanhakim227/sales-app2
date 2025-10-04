const { Prisma } = require('@prisma/client');
const prisma = require('../prisma');


const createOrder = async (req, res) => {
  try {
    const { items, deliveryMethod, paymentType } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items tidak boleh kosong" });
    }

    // ambil data produk dari DB
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // mapping item dengan harga & subtotal dari DB
    const orderItems = items.map(i => {
      const product = products.find(p => p.id === i.productId);
      if (!product) throw new Error(`Produk dengan ID ${i.productId} tidak ditemukan`);

      const price = new Prisma.Decimal(product.price);
      const quantity = new Prisma.Decimal(i.quantity);
      const subtotal = price.mul(quantity);

      return {
        productId: i.productId,
        quantity: i.quantity,
        price,
        subtotal,
      };
    });

    // hitung totalAmount
    const totalAmount = orderItems.reduce(
      (acc, item) => acc.add(item.subtotal),
      new Prisma.Decimal(0)
    );

    const order = await prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        totalAmount,
        deliveryMethod,
        paymentType,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    res.json(order);
  } catch (err) {
    console.error("Error createOrder:", err);
    res.status(500).json({ error: "Gagal membuat order" });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error getOrders:", error);
    res.status(500).json({ error: "Gagal mengambil data orders", detail: error.message });
  }
};

// Admin: get all orders (with user info)
const listAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error('Error listAllOrders:', err);
    res.status(500).json({ error: 'Gagal mengambil orders' });
  }
};

const getOrderById = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true }
    });
    if (!order) return res.status(404).json({ error: 'Order tidak ditemukan' });
    res.json(order);
  } catch (err) {
    console.error('Error getOrderById:', err);
    res.status(500).json({ error: 'Gagal mengambil order' });
  }
};

const { sendOrderStatusEmail } = require('../services/emailService');

const updateOrderStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  try {
    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // send notification email to user if email exists
    const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
    if (order?.user?.email) {
      try {
        await sendOrderStatusEmail({ to: order.user.email, name: order.user.name, orderId: order.id, status });
      } catch (mailErr) {
        console.error('Failed to send order status email:', mailErr);
      }
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updateOrderStatus:', err);
    res.status(500).json({ error: 'Gagal mengupdate status order' });
  }
};

// exports consolidated at end of file

const createDummyOrder = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: "This endpoint is not available in production." });
  }
  // find an existing product to reference (avoid FK violation)
  const product = await prisma.product.findFirst();
  if (!product) {
    return res.status(400).json({ error: 'No products found in database. Please seed products first.' });
  }

  const qty = 1;
  const price = new Prisma.Decimal(product.price);
  const subtotal = price.mul(new Prisma.Decimal(qty));
  const totalAmount = subtotal;

  const dummyOrderData = {
    userId: req.user.id,
    status: "PENDING",
    totalAmount,
    deliveryMethod: "DUMMY_METHOD",
    paymentType: "DUMMY_PAYMENT",
    items: {
      create: [
        { productId: product.id, quantity: qty, price, subtotal }
      ],
    },
  };

  const order = await prisma.order.create({
    data: dummyOrderData,
    include: { items: true },
  });

  res.json(order);
};

module.exports = { createOrder, getOrders, listAllOrders, getOrderById, updateOrderStatus, createDummyOrder };
