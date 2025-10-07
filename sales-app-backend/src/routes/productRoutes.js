const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const { auth, requireRole } = require('../middleware/auth');
const { listPublicProducts, listAllProducts, createProduct, getProduct, 
    approveProduct, getProductAdmin, updateProductAdmin, 
    deleteProductAdmin, listCategories, relatedProducts,
    createVariant, updateVariant, deleteVariant} = require('../controller/productController');

// Public: only active products
router.get('/', listPublicProducts);
// expose categories under products for simplicity
router.get('/categories', listCategories);
// related products endpoint (must be before dynamic id)
router.get('/:id/related', relatedProducts);
// Admin route should be defined before dynamic :id to avoid collision
router.get('/all', auth, requireRole(['ADMIN','SUPERADMIN']), listAllProducts);
router.get('/:id', getProduct);

// Admin: get/update/delete specific product (admin-only)
router.get('/admin/:id', auth, requireRole(['ADMIN','SUPERADMIN']), getProductAdmin);
router.patch('/admin/:id', auth, requireRole(['ADMIN','SUPERADMIN']), upload.single('image'), updateProductAdmin);
router.delete('/admin/:id', auth, requireRole(['ADMIN','SUPERADMIN']), deleteProductAdmin);

// Admin variant management
router.post('/admin/:id/variants', auth, requireRole(['ADMIN','SUPERADMIN']), createVariant);
router.patch('/admin/variants/:variantId', auth, requireRole(['ADMIN','SUPERADMIN']), updateVariant);
router.delete('/admin/variants/:variantId', auth, requireRole(['ADMIN','SUPERADMIN']), deleteVariant);

// Admin: create
router.post('/', auth, upload.single('image'), createProduct); // auth required to create (seller/admin)
router.patch('/:id/approve', auth, requireRole(['ADMIN','SUPERADMIN']), approveProduct);

module.exports = router;
