const prisma = require('../prisma');

const addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const review = await prisma.review.create({
    data: { userId: req.user.id, productId, rating, comment }
  });
  res.json(review);
};

const getReviews = async (req, res) => {
  const { productId } = req.params;
  const reviews = await prisma.review.findMany({ where: { productId } });
  res.json(reviews);
};

module.exports = { addReview, getReviews };
