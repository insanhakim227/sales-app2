const express = require('express');
const { getWishlist, addToWishlist } = require('../controller/wishlistController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getWishlist);
router.post('/', auth, addToWishlist);

module.exports = router;
