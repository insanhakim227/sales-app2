const prisma = require('../prisma');

const getProfile = async (req, res) => {
  res.json(req.user);
};

const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

// List semua user (khusus super admin)
const listUsers = async (req, res) => {
  if (req.user.role !== "SUPERADMIN") return res.status(403).json({ message: "Forbidden" });
  const users = await prisma.user.findMany({
    where: { isVerified: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      mobile: true,
      gender: true,
      profileImageUrl: true,
      lastLogin: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  res.json(users);
};

// Detail user by id (khusus super admin)
const userDetail = async (req, res) => {
  if (req.user.role !== "SUPERADMIN") return res.status(403).json({ message: "Forbidden" });
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      mobile: true,
      gender: true,
      province: true,   // pastikan ada
      regency: true,    // pastikan ada
      district: true,   // pastikan ada
      village: true,    // pastikan ada
      profileImageUrl: true,
      lastLogin: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// Update profile (boleh untuk semua user, hanya dirinya sendiri)
const updateProfile = async (req, res) => {
  const { name, email, password, gender, address, mobile, province, regency, district, village } = req.body;
  const data = { name, email, address, mobile, province, regency, district, village };
  if (["MALE", "FEMALE", "OTHER"].includes(gender)) {
    data.gender = gender;
  }
  const fs = require('fs');
  const path = require('path');
  // Get previous user data
  const prevUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { profileImageUrl: true } });
  if (req.file) {
    // Delete previous image if exists and is in /image-user/
    if (prevUser && prevUser.profileImageUrl && prevUser.profileImageUrl.startsWith('/image-user/')) {
      const prevFilename = prevUser.profileImageUrl.replace('/image-user/', '');
      const prevImagePath = path.join(__dirname, '../../public/image-user', prevFilename);
      fs.unlink(prevImagePath, err => {}); // ignore error if file not found
    }
    data.profileImageUrl = `/image-user/${req.file.filename}`;
  } else if (req.body.profileImageUrl) {
    data.profileImageUrl = req.body.profileImageUrl;
  }
  if (password) {
    const bcrypt = require("bcrypt");
    data.password = await bcrypt.hash(password, 10);
  }
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      gender: true,
      address: true,
      mobile: true,
      province: true, 
      regency: true,  
      district: true, 
      village: true,  
      profileImageUrl: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  res.json(user);
};

module.exports = { getProfile, getAllUsers, listUsers, userDetail, updateProfile };
