const express = require('express');
const { getSummary, getUserGrowth } = require('../controller/dashboardController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/summary', auth, getSummary);
router.get('/user-growth', auth, getUserGrowth);

module.exports = router;