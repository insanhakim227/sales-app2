const express = require('express');
const { addReview, getReviews } = require('../controller/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, addReview);
router.get('/:productId', getReviews);

module.exports = router;
