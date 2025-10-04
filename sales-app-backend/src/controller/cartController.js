const prisma = require('../prisma');

const getCart = async (req, res) => {
  const cart = await prisma.cart.findMany({
    where: { userId: req.user.id },
    include: { product: true }
  });
  res.json(cart);
};

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  // cek apakah product sudah ada di cart user
  let cartItem = await prisma.cart.findFirst({
    where: { userId, productId }
  });

  if (cartItem) {
    cartItem = await prisma.cart.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + quantity }
    });
  } else {
    cartItem = await prisma.cart.create({
      data: { userId, productId, quantity }
    });
  }

  res.json(cartItem);
};

const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  // find existing
  let cartItem = await prisma.cart.findFirst({ where: { userId, productId } });
  if (cartItem) {
    if (quantity <= 0) {
      await prisma.cart.delete({ where: { id: cartItem.id } });
      return res.json({ success: true, deleted: true });
    }
    cartItem = await prisma.cart.update({ where: { id: cartItem.id }, data: { quantity } });
    return res.json(cartItem);
  }

  // create if quantity > 0
  if (quantity > 0) {
    cartItem = await prisma.cart.create({ data: { userId, productId, quantity } });
    return res.json(cartItem);
  }

  return res.status(400).json({ error: 'Invalid quantity' });
};

const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;
  const cartItem = await prisma.cart.findFirst({ where: { userId, productId } });
  if (!cartItem) return res.json({ success: true, deleted: false });
  await prisma.cart.delete({ where: { id: cartItem.id } });
  return res.json({ success: true, deleted: true });
};

module.exports = { getCart, addToCart, updateCart, removeFromCart };
