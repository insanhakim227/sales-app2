const express = require('express');
const { register, verifyEmail, login, refresh, logout } = require('../controller/authController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/refresh', refresh);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);

// Endpoint untuk auth check
router.get('/check', auth, (req, res) => {
	res.json({ user: req.user });
});

module.exports = router;
