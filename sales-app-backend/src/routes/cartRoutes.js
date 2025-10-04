const express = require('express');
const { getCart, addToCart, updateCart, removeFromCart } = require('../controller/cartController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getCart);
router.post('/', auth, addToCart);
router.patch('/', auth, updateCart);
router.delete('/', auth, removeFromCart);

module.exports = router;
