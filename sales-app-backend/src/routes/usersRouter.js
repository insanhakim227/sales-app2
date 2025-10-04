const express = require('express');
const { getProfile, getAllUsers, listUsers, userDetail, updateProfile } = require('../controller/userController');
const upload = require('../middleware/upload');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/me', auth, getProfile);
// router.get('/', auth, requireRole(['ADMIN','SUPERADMIN']), getAllUsers);
router.get("/", auth, listUsers); // GET /api/users
router.get("/:id", auth, userDetail); // GET /api/users/:id
router.put("/profile", auth, upload.single('profileImage'), updateProfile); // PUT /api/users/profile

module.exports = router;
