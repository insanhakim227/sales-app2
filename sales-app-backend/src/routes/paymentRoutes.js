const express = require('express');
const { createPayment, updatePayment } = require('../controller/paymentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createPayment);
router.put('/:id', auth, updatePayment);

module.exports = router;
