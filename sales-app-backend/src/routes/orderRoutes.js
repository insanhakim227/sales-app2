const express = require('express');
const { createOrder, getOrders, listAllOrders, getOrderById, updateOrderStatus, createDummyOrder } = require('../controller/orderController');
const { auth, requireRole } = require('../middleware/auth');
const prisma = require('../prisma');

const router = express.Router();

router.post('/', auth, createOrder);
router.get('/', auth, getOrders);

// Admin routes
router.get('/all', auth, requireRole(['ADMIN', 'SUPERADMIN']), listAllOrders);
router.get('/:id', auth, requireRole(['ADMIN', 'SUPERADMIN']), getOrderById);
router.patch('/:id/status', auth, requireRole(['ADMIN', 'SUPERADMIN']), updateOrderStatus);
// Dev only: create dummy order for testing
router.post('/dummy', auth, requireRole(['ADMIN', 'SUPERADMIN']), createDummyOrder);

// Dev-only: create dummy product via POST /api/orders/product-dummy (protected)
// We attach here for convenience; in production you might move to product routes
router.post('/product-dummy', auth, requireRole(['ADMIN','SUPERADMIN']), async (req, res) => {
	if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Not available in production' });
	const { name, description, price, stock, imageUrl } = req.body;
	if (!name || !price) return res.status(400).json({ error: 'name and price required' });
	try {
		const product = await prisma.product.create({ data: { name, description, price: Number(price), stock: Number(stock || 0), imageUrl } });
		res.json(product);
	} catch (err) {
		console.error('create product dummy err', err);
		res.status(500).json({ error: 'failed create product' });
	}
});

module.exports = router;
