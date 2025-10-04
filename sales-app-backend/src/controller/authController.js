const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { sendVerificationEmail } = require("../services/emailService");

 const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { isVerified: true },
    });
    res.json({ message: "Email berhasil diverifikasi. Silakan login." });
  } catch (err) {
    res.status(400).json({ message: "Token verifikasi tidak valid atau kadaluarsa." });
  }
};

 const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'email, password and name are required' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, isVerified: false }
    });

    // Generate verification token
    const verifyToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

    // Kirim email verifikasi
    await sendVerificationEmail({ to: email, name, verifyUrl });

    res.status(201).json({ message: "Registrasi berhasil! Silakan cek email untuk verifikasi." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Tambahkan pengecekan isVerified
  if (!user.isVerified) {
    return res.status(403).json({ error: "Email belum diverifikasi. Silakan cek email Anda." });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  // Update lastLogin setelah login sukses
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  const accessToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({ 
    accessToken, refreshToken, 
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  });
};

// 🆕 Refresh token
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    // cek di DB
    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash: refreshToken, revoked: false }
    });
    if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });

    // verifikasi token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // generate access token baru
    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token diperlukan" });
    }

    // decode refreshToken untuk dapatkan userId
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Refresh token tidak valid" });
    }

    // cari semua refreshToken milik userId yang belum revoked
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: payload.userId, revoked: false }
    });

    // bandingkan hash
    let found = null;
    for (const t of tokens) {
      const match = await bcrypt.compare(refreshToken, t.tokenHash);
      if (match) {
        found = t;
        break;
      }
    }
    if (!found) {
      return res.status(404).json({ message: "Refresh token tidak ditemukan" });
    }

    await prisma.refreshToken.update({
      where: { id: found.id },
      data: { revoked: true }
    });

    return res.json({ message: "Logout berhasil, token sudah direvoke" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = { register, login, refresh, logout, verifyEmail };
