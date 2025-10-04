const prisma = require("../prisma");

const getSummary = async (req, res) => {
  const [userCount, orderCount, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
  ]);
  res.json({
    userCount: Number(userCount),
    orderCount: Number(orderCount),
    totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
  });
};

// Statistik untuk chart
const getUserGrowth = async (req, res) => {
  const result = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "created_at") AS month, COUNT(*) AS count
    FROM "users"
    GROUP BY month
    ORDER BY month
  `;
  // Konversi BigInt ke Number
  const safeResult = result.map(row => ({
    ...row,
    count: Number(row.count),
  }));
  res.json(safeResult);
};

module.exports = { getUserGrowth, getSummary };