const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPayment = async (req, res) => {
  try {
    const { orderId, method, amount } = req.body;

    // pastikan order ada
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    // update kolom pembayaran di tabel orders
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentType: method,
        paymentStatus: "PENDING", // default dulu
        totalAmount: amount,
      },
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error createPayment:", err);
    res.status(500).json({ error: "Gagal membuat payment" });
  }
};


const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const payment = await prisma.paymentInfo.update({
    where: { id },
    data: { status }
  });
  res.json(payment);
};

module.exports = { createPayment, updatePayment };
