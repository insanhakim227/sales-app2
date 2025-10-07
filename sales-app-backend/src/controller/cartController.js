const prisma = require('../prisma');

const getCart = async (req, res) => {
  const cart = await prisma.cart.findMany({
    where: { userId: req.user.id },
    include: { product: true, variant: true }
  });
  res.json(cart);
};

const addToCart = async (req, res) => {
  // ensure product exists
    let { productId, quantity, variantId, size } = req.body;
    const userId = req.user.id;

    console.debug('[cart][addToCart] incoming payload:', { productId, quantity, variantId, size, userId });

    // coerce productId to number if possible
    const pidNum = Number(productId);
    if (!isNaN(pidNum)) productId = pidNum;

    // If productId not provided but variantId is, derive productId from variant
    if (!productId && variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return res.status(400).json({ error: 'Variant not found' });
      productId = variant.productId;
    }

    if (!productId) return res.status(400).json({ error: 'productId is required' });
  let product = await prisma.product.findUnique({ where: { id: productId } });
  console.debug('[cart][addToCart] product lookup result:', { productId, found: !!product });
    // if product not found but variantId provided, try to derive productId from variant (fallback for older queued payloads)
    if (!product && variantId) {
      const fallbackVariant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      console.debug('[cart][addToCart] fallbackVariant lookup:', { variantId, found: !!fallbackVariant });
      if (fallbackVariant) {
        productId = fallbackVariant.productId;
        product = await prisma.product.findUnique({ where: { id: productId } });
        console.debug('[cart][addToCart] derived productId from variant:', { productId, found: !!product });
      }
    }
    if (!product) return res.status(400).json({ error: 'Product not found' });

  // cek apakah product sudah ada di cart user
  // when checking existing cart rows, explicitly match size even when it's null (so size=null matches DB NULL)
  let whereClause = { userId, productId };
  if (variantId) whereClause.variantId = variantId;
  if (typeof size !== 'undefined') whereClause.size = size === 'default' ? null : size;
  let cartItem = await prisma.cart.findFirst({ where: whereClause });

  // If variant specified, ensure stock exists
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) return res.status(400).json({ error: 'Variant not found' });
    // ensure the variant belongs to the requested product
    if (variant.productId !== productId) return res.status(400).json({ error: 'Variant does not belong to the product' });
    if (variant.stock < quantity) return res.status(400).json({ error: 'Not enough stock for selected variant' });
  }

  if (cartItem) {
    cartItem = await prisma.cart.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + quantity }
    });
  } else {
    cartItem = await prisma.cart.create({
      data: { userId, productId, quantity, variantId: variantId || null, size: size || null }
    });
  }

  res.json(cartItem);
};

const updateCart = async (req, res) => {
  let { productId, quantity, variantId, size } = req.body;
    const userId = req.user.id;

  console.debug('[cart][updateCart] incoming payload:', { productId, quantity, variantId, size, userId });

    const pidNum = Number(productId);
    if (!isNaN(pidNum)) productId = pidNum;
    if (!productId && variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return res.status(400).json({ error: 'Variant not found' });
      productId = variant.productId;
    }
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    let product = await prisma.product.findUnique({ where: { id: productId } });
    console.debug('[cart][updateCart] product lookup result:', { productId, found: !!product });
    if (!product && variantId) {
      const fallbackVariant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      console.debug('[cart][updateCart] fallbackVariant lookup:', { variantId, found: !!fallbackVariant });
      if (fallbackVariant) {
        productId = fallbackVariant.productId;
        product = await prisma.product.findUnique({ where: { id: productId } });
        console.debug('[cart][updateCart] derived productId from variant:', { productId, found: !!product });
      }
    }
    if (!product) return res.status(400).json({ error: 'Product not found' });

  // find existing
  let whereClause = { userId, productId };
  if (variantId) whereClause.variantId = variantId;
  if (typeof size !== 'undefined') whereClause.size = size === 'default' ? null : size;
  let cartItem = await prisma.cart.findFirst({ where: whereClause });
  if (cartItem) {
    if (quantity <= 0) {
      await prisma.cart.delete({ where: { id: cartItem.id } });
      return res.json({ success: true, deleted: true });
    }
    // If variant specified, check stock
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return res.status(400).json({ error: 'Variant not found' });
      if (variant.productId !== productId) return res.status(400).json({ error: 'Variant does not belong to the product' });
      if (variant.stock < quantity) return res.status(400).json({ error: 'Not enough stock for selected variant' });
    }
    cartItem = await prisma.cart.update({ where: { id: cartItem.id }, data: { quantity } });
    return res.json(cartItem);
  }

  // create if quantity > 0
  if (quantity > 0) {
    // If variant specified, check variant stock
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return res.status(400).json({ error: 'Variant not found' });
      if (variant.stock < quantity) return res.status(400).json({ error: 'Not enough stock for selected variant' });
    }
    cartItem = await prisma.cart.create({ data: { userId, productId, quantity, variantId: variantId || null, size: size || null } });
    return res.json(cartItem);
  }

  return res.status(400).json({ error: 'Invalid quantity' });
};

const removeFromCart = async (req, res) => {
  let { productId, variantId, size } = req.body;
  const userId = req.user.id;
  const pidNum = Number(productId);
  if (!isNaN(pidNum)) productId = pidNum;
  const whereClause = { userId, productId };
  if (variantId) whereClause.variantId = variantId;
  if (typeof size !== 'undefined') whereClause.size = size === 'default' ? null : size;
  const cartItem = await prisma.cart.findFirst({ where: whereClause });
  if (!cartItem) return res.json({ success: true, deleted: false });
  await prisma.cart.delete({ where: { id: cartItem.id } });
  return res.json({ success: true, deleted: true });
};

module.exports = { getCart, addToCart, updateCart, removeFromCart };
