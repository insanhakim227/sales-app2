import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { shopContext } from "../Context/ShopContext";
import RelatedProducts from "../Components/RelatedProducts";
import { assets } from "../assets/assets.js";
import api from "../api/axios";
import { getImageUrl } from "../utils/getImageUrl";
import { formatRupiah } from "../utils/formatRupiah";
import { useNavigate, useLocation } from 'react-router-dom';

const Product = () => {
  const { Add_Cart, addToCartDirect } = useContext(shopContext);
  const { id } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const product = {
        ...res.data,
        image: getImageUrl(res.data.image_url) // generate full url
      };
      setSelectedProduct(product);
      // default select first variant if exists
      if (product.variants && product.variants.length > 0) {
        // if navigation state provided (from cart), try to preselect provided variantId or itemSize
        const state = location.state || {};
        const preferredVariantId = state.variantId || null;
        const preferredSize = state.itemSize || null;
        if (preferredVariantId) {
          const found = product.variants.find(v => String(v.id) === String(preferredVariantId));
          if (found) setSelectedSize(found.id);
          else setSelectedSize(product.variants[0].id);
        } else if (preferredSize) {
          const found2 = product.variants.find(v => v.size === preferredSize);
          if (found2) setSelectedSize(found2.id);
          else setSelectedSize(product.variants[0].id);
        } else {
          setSelectedSize(product.variants[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch product", err);
    } finally {
      setLoading(false);
    }
  };
  fetchProduct();
}, [id]);


  if (loading) return <div className="text-center py-20">Loading product details...</div>;
  if (!selectedProduct) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="mt-11">
      <div className="gap-10 sm:flex p-5">
        <img
          src={selectedProduct.image}
          alt={selectedProduct.name}
          className="w-full sm:max-w-md object-cover"
        />

        <div className="flex flex-col gap-4 mt-6 sm:mt-0">
          {location.state && location.state.fromCart && (
            <button onClick={() => navigate(-1)} className="text-sm text-gray-600 mb-2">← Back</button>
          )}
          <h1 className="text-3xl font-bold">{selectedProduct.name}</h1>

          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(4)].map((_, i) => (
                <img key={i} src={assets.star_icon} alt="star rating" className="w-5 h-5" />
              ))}
              <img src={assets.star_dull_icon} alt="star rating" className="w-5 h-5" />
            </div>
            <span className="text-gray-600">(121 reviews)</span>
          </div>

            <p className="text-2xl font-bold">{formatRupiah((selectedProduct.variants && selectedProduct.variants.find(v => v.id === selectedSize)?.price) || selectedProduct.price)}</p>

          <p className="text-gray-700 max-w-prose">{selectedProduct.description}</p>

          {/* Size selector (from variants) */}
          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium">Size</label>
              <div className="flex gap-2 mt-2">
                {selectedProduct.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.id)}
                    disabled={v.stock <= 0}
                    className={`px-3 py-1 border rounded ${selectedSize === v.id ? 'bg-indigo-600 text-white' : ''} ${v.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {v.size} ({v.stock})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium">Jumlah</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 bg-gray-200 rounded">-</button>
              <div className="px-4 py-1 border rounded">{quantity}</div>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-1 bg-gray-200 rounded">+</button>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Catatan</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full mt-2 p-2 border rounded" placeholder="Catatan untuk penjual (opsional)" />
          </div>

          <div className="mt-4">
            <div className="font-semibold">Subtotal: {formatRupiah(((selectedProduct.variants && selectedProduct.variants.find(v => v.id === selectedSize)?.price) || selectedProduct.price) * quantity)}</div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={async () => {
                // Add to cart (use selected variant if any)
                const variant = selectedProduct.variants && selectedProduct.variants.find(v => v.id === selectedSize);
                try {
                  await Add_Cart(selectedProduct.id, { variantId: variant ? variant.id : null, itemSize: variant ? variant.size : 'default', quantity, note });
                } catch (e) {
                  // if not authenticated, Add_Cart already opened login modal
                }
              }}
              className="bg-black text-white w-48 h-12 rounded-md hover:bg-gray-800 transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={async () => {
                const variant = selectedProduct.variants && selectedProduct.variants.find(v => v.id === selectedSize);
                try {
                  // add then redirect to placeorder
                  await addToCartDirect({ productId: selectedProduct.id, variantId: variant ? variant.id : null, itemSize: variant ? variant.size : 'default', quantity, note }, true);
                } catch (e) {}
              }}
              className="bg-indigo-600 text-white w-48 h-12 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Checkout
            </button>
          </div>

          <div className="mt-8 space-y-2 text-sm text-gray-600">
            <p>✓ 100% Egyptian Cotton</p>
            <p>✓ 100% Original Quality</p>
          </div>
        </div>
      </div>

      <hr />

      {/* Description and rates */}
      <div className="flex flex-col gap-3 px-5 mt-10">
        <div className="flex gap-3">
          <b>Description</b>
          <p>(121) Review</p>
        </div>
        <p>{selectedProduct.description || "No detailed description provided."}</p>
      </div>

      {/* Related Products */}
      {/* Related Products */}
    <RelatedProducts productId={selectedProduct.id} />
    </div>
  );
};

export default Product;
