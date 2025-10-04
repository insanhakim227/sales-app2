const prisma = require('../prisma');

const getWishlist = async (req, res) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } }
  });
  res.json(wishlist);
};

const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  let wishlist = await prisma.wishlist.upsert({
    where: { userId: req.user.id },
    update: {},
    create: { userId: req.user.id }
  });
  await prisma.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId }
  });
  res.json(await prisma.wishlist.findUnique({ where: { id: wishlist.id }, include: { items: true } }));
};

module.exports = { getWishlist, addToWishlist };
