const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash('insan227', 10);

  const user = await prisma.user.create({
    data: { name: 'insan hakim', email: 'insanhakim@gmail.com', password: hashedPassword }
  });

  const product = await prisma.product.create({
    data: { name: 'Test Product', price: 100000, stock: 10 }
  });

  await prisma.cart.create({
    data: { userId: user.id, productId: product.id, quantity: 1 }
  });

  await prisma.wishlist.create({
    data: { userId: user.id, productId: product.id }
  });

  console.log('Seeding completed.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
