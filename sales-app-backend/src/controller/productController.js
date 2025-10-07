const prisma = require('../prisma');

// public listing: only active products
const listPublicProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, include: { variants: true } });
    // normalize image field for frontend compatibility and include minimal variant info
    const out = products.map(p => ({ ...p, image_url: p.imageUrl, variants: (p.variants || []).map(v => ({ id: v.id, size: v.size, stock: v.stock, price: v.price })) }));
    res.json(out);
  } catch (err) {
    console.error('listPublicProducts err', err);
    res.status(500).json({ error: 'Gagal mengambil produk' });
  }
};

// admin listing: all products
const listAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    const out = products.map(p => ({ ...p, image_url: p.imageUrl }));
    res.json(out);
  } catch (err) {
    console.error('listAllProducts err', err);
    res.status(500).json({ error: 'Gagal mengambil produk' });
  }
};

const createProduct = async (req, res) => {
  try {
    // expects fields: name, description, price, stock, and optional file uploaded as 'image'
    const { name, description, price, stock, categoryId, gender } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'name and price required' });

  const imageUrl = req.file ? `/image-product/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock || 0),
        imageUrl,
        categoryId: categoryId ? Number(categoryId) : null,
        gender: gender || null,
        isActive: false // default not active until approved
      }
    });

    // audit log (if user is present)
    try {
      const createAudit = require('../middleware/audit');
      const userId = req.user ? req.user.id : null;
      createAudit(userId, 'CREATE', 'Product', product.id, { name: product.name, price: product.price });
    } catch (e) { console.error('audit create failed', e); }

    // return with compatibility field name
    const out = { ...product, image_url: product.imageUrl };
    res.json(out);
  } catch (err) {
    console.error('createProduct err', err);
    res.status(500).json({ error: 'Gagal membuat produk' });
  }
};

const getProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
    const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // only return product if active (public). Admin should use /api/products/all to list and manage
    if (!product.isActive) return res.status(404).json({ error: 'Product not found' });
    // map variants price/stock and normalize image
    const out = {
      ...product,
      image_url: product.imageUrl,
      variants: (product.variants || []).map(v => ({ id: v.id, size: v.size, color: v.color, stock: v.stock, price: v.price }))
    };
    res.json(out);
  } catch (err) {
    console.error('getProduct err', err);
    res.status(500).json({ error: 'Gagal mengambil product' });
  }
};

const approveProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.update({ where: { id }, data: { isActive: true } });
    const out = { ...product, image_url: product.imageUrl };
    res.json(out);
  } catch (err) {
    console.error('approveProduct err', err);
    res.status(500).json({ error: 'Gagal approve product' });
  }
};

// Admin: get product regardless of isActive
const getProductAdmin = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
    const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const out = { ...product, image_url: product.imageUrl };
    res.json(out);
  } catch (err) {
    console.error('getProductAdmin err', err);
    res.status(500).json({ error: 'Gagal mengambil product' });
  }
};

// Admin: create a variant for a product
const createVariant = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { size, color, stock, price } = req.body;
    if (!productId || Number.isNaN(productId)) return res.status(400).json({ error: 'Invalid product id' });
    const variant = await prisma.productVariant.create({ data: { productId, size: size || null, color: color || null, stock: Number(stock || 0), price: price ? Number(price) : undefined } });
    res.json(variant);
  } catch (err) {
    console.error('createVariant err', err);
    res.status(500).json({ error: 'Gagal membuat variant' });
  }
};

// Admin: update variant
const updateVariant = async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);
    if (!variantId || Number.isNaN(variantId)) return res.status(400).json({ error: 'Invalid variant id' });
    const { size, color, stock, price } = req.body;
    const data = {};
    if (size !== undefined) data.size = size || null;
    if (color !== undefined) data.color = color || null;
    if (stock !== undefined) data.stock = Number(stock);
    if (price !== undefined) data.price = Number(price);
    const updated = await prisma.productVariant.update({ where: { id: variantId }, data });
    res.json(updated);
  } catch (err) {
    console.error('updateVariant err', err);
    res.status(500).json({ error: 'Gagal update variant' });
  }
};

// Admin: delete variant
const deleteVariant = async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);
    if (!variantId || Number.isNaN(variantId)) return res.status(400).json({ error: 'Invalid variant id' });
    await prisma.productVariant.delete({ where: { id: variantId } });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteVariant err', err);
    res.status(500).json({ error: 'Gagal hapus variant' });
  }
};

// Admin: update product (fields + optional image)
const updateProductAdmin = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
    const { name, description, price, stock, categoryId, isActive } = req.body;
    // fetch previous
    const prev = await prisma.product.findUnique({ where: { id } });
    if (!prev) return res.status(404).json({ error: 'Product not found' });

    let imageUrl = prev.imageUrl;
    if (req.file) {
      // delete previous image file if exists
      try {
        const fs = require('fs');
        const path = require('path');
        if (prev.imageUrl && prev.imageUrl.startsWith('/image-product/')) {
          const prevFilename = prev.imageUrl.replace('/image-product/', '');
          const prevPath = path.join(__dirname, '../../public/image-product', prevFilename);
          fs.unlink(prevPath, err => {});
        }
      } catch (e) {}
      imageUrl = `/image-product/${req.file.filename}`;
    }

    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (stock !== undefined) data.stock = Number(stock);
  if (categoryId !== undefined) data.categoryId = categoryId ? Number(categoryId) : null;
  if (req.body.gender !== undefined) data.gender = req.body.gender || null;
    if (isActive !== undefined) data.isActive = isActive === 'true' || isActive === true;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const product = await prisma.product.update({ where: { id }, data });
    const out = { ...product, image_url: product.imageUrl };
    res.json(out);
  } catch (err) {
    console.error('updateProductAdmin err', err);
    res.status(500).json({ error: 'Gagal update product' });
  }
};

// Related products for a given product id
const relatedProducts = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
    const mode = req.query.mode || 'category';
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let where = { isActive: true };
    if (mode === 'category' && product.categoryId) {
      where.categoryId = product.categoryId;
      where.id = { not: id };
    } else if (product.gender) {
      where.gender = product.gender;
      where.id = { not: id };
    } else {
      // fallback: latest active products excluding this
      where.id = { not: id };
    }

    const related = await prisma.product.findMany({ where, take: 10, orderBy: { createdAt: 'desc' } });
    const out = related.map(p => ({ ...p, image_url: p.imageUrl }));
    res.json(out);
  } catch (err) {
    console.error('relatedProducts err', err);
    res.status(500).json({ error: 'Gagal mengambil related products' });
  }
};

// List categories (simple list)
const listCategories = async (req, res) => {
  try {
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(cats);
  } catch (err) {
    console.error('listCategories err', err);
    res.status(500).json({ error: 'Gagal mengambil categories' });
  }
};

// Admin: delete product
const deleteProductAdmin = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
    const prev = await prisma.product.findUnique({ where: { id } });
    if (!prev) return res.status(404).json({ error: 'Product not found' });
    // delete image file
    try {
      const fs = require('fs');
      const path = require('path');
      if (prev.imageUrl && prev.imageUrl.startsWith('/image-product/')) {
        const prevFilename = prev.imageUrl.replace('/image-product/', '');
        const prevPath = path.join(__dirname, '../../public/image-product', prevFilename);
        fs.unlink(prevPath, err => {});
      }
    } catch (e) {}

    await prisma.product.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteProductAdmin err', err);
    res.status(500).json({ error: 'Gagal hapus product' });
  }
};

module.exports = { 
  listPublicProducts, listAllProducts, createProduct,
   getProduct, approveProduct, getProductAdmin, 
   updateProductAdmin, deleteProductAdmin, 
   relatedProducts, listCategories, createVariant,
   updateVariant, deleteVariant 
};
