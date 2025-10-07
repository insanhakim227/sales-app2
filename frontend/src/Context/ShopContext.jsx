import React, { createContext, useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import formatRupiah from "../utils/formatRupiah";
import { AuthContext } from "./AuthContext";

export const shopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "Rp";
  const delivery_fee = 10;
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  // Size is removed — use 'default' internally for carts
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [queuedAdd, setQueuedAdd] = useState(null);
  const [confirmQueuedOpen, setConfirmQueuedOpen] = useState(false);
  const [confirmCheckoutOpen, setConfirmCheckoutOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  // On mount, if there's a token (user likely logged in), fetch cart so count/bubble stays in sync
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // don't block render
      fetchCart().catch(() => {});
    }
  }, []);

  // Clear cart when auth token gets removed (logout) — works in same tab via AuthContext and across tabs via storage event
  const { token: authToken } = useContext(AuthContext);
  useEffect(() => {
    if (!authToken) {
      setCartItems({});
      setQueuedAdd(null);
    }
  }, [authToken]);

  // storage fallback (other tabs)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' && !e.newValue) {
        setCartItems({});
        setQueuedAdd(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Restore queued add from sessionStorage (so it survives a page reload while user logs in)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('queuedAdd');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && !queuedAdd) setQueuedAdd(parsed);
      }
    } catch (e) {
      console.error('Failed restore queuedAdd', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist queuedAdd to sessionStorage so it survives reloads while user logs in
  useEffect(() => {
    try {
      if (queuedAdd) sessionStorage.setItem('queuedAdd', JSON.stringify(queuedAdd));
      else sessionStorage.removeItem('queuedAdd');
    } catch (e) {
      console.error('Failed persist queuedAdd', e);
    }
  }, [queuedAdd]);
  // fetch produk dari backend, hanya jika bukan di dashboard
  useEffect(() => {
    if (!location.pathname.startsWith("/dashboard")) {
      const fetchData = async () => {
        try {
          const res = await api.get("/products");
          const productsWithId = res.data.map(item => ({
            ...item,
            id: item.id || item._id,
            image: getImageUrl(item.image_url)
          }));
          setProducts(productsWithId);
        } catch (err) {
          console.error(err);
          toast.error("Gagal ambil data produk");
        }
      };
      fetchData();
    }
  }, [location.pathname]);

  // Fetch cart dari backend
  const fetchCart = async () => {
    try {
      const { data } = await api.get("/cart");
      // data berupa array, mapping ke objek agar FE tetap bisa baca
      const cartObj = {};
      data.forEach(item => {
        if (!cartObj[item.productId]) cartObj[item.productId] = {};
        // prefer explicit cart size, fallback to variant size (if variant relation provided), else 'default'
        const sizeKey = item.size || (item.variant && item.variant.size) || 'default';
        cartObj[item.productId][sizeKey] = {
          quantity: item.quantity,
          variantId: item.variantId || null,
          rawSize: item.size || null,
          variantPrice: item.variant ? item.variant.price : null
        };
      });
      setCartItems(cartObj);
      return cartObj;
    } catch (err) {
      console.error("Gagal fetch cart:", err);
      setCartItems({});
      return {};
    }
  };

  // Fetch orders dari backend
  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      return data;
    } catch (err) {
      console.error("Gagal fetch orders:", err);
      return [];
    }
  };

  // itemID: productId or variantId depending on usage
  // Accepts options: { variantId, productId, quantity, note }
  const Add_Cart = (itemID, itemSizeOrOpts) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    // normalize options
    let opts = {};
    if (itemSizeOrOpts && typeof itemSizeOrOpts === 'object') opts = itemSizeOrOpts;
    else opts = { itemSize: itemSizeOrOpts };

    if (!user) {
      // notify user and open login modal; store the attempted item so we can add it after login
      toast.info('anda harus login terlebih dahulu');
      setQueuedAdd({ itemID, ...opts });
      setLoginModalOpen(true);
      return Promise.reject(new Error('NOT_AUTHENTICATED'));
    }

    const quantity = opts.quantity || 1;
    const variantId = opts.variantId || null; // prefer variantId when provided

    // return a promise so callers (Product page) can await and then navigate
    return (async () => {
      try {
          // send productId always as the actual product id; include variantId separately when provided
          const pidNum = Number(itemID);
          const sendProductId = !isNaN(pidNum) ? pidNum : itemID;
          const payload = { productId: sendProductId, quantity };
          if (variantId) payload.variantId = variantId;
          // normalize size: treat 'default' as null so DB stores NULL (and matches queries)
          if (opts.itemSize && opts.itemSize !== 'default') payload.size = opts.itemSize;
          if (opts.note) payload.note = opts.note;
          const res = await api.post('/cart', payload);
        await fetchCart();
        toast.success('produk disimpan di keranjang');
        return res.data;
      } catch (err) {
        console.error('Failed add to cart', err);
        toast.error('Gagal menyimpan produk ke keranjang');
        throw err;
      }
    })();
  };

  // helper for product page: add then navigate to placeorder with state
  const addToCartDirect = async ({ productId, variantId, quantity = 1, note }, navigateToCheckout = false) => {
    const payload = { variantId, productId, quantity, note };
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      setQueuedAdd({ mode: 'checkout', itemID: productId, variantId, quantity, note });
      setLoginModalOpen(true);
      return null;
    }
    const result = await Add_Cart(productId, { variantId, quantity, note });
    if (navigateToCheckout) {
      // navigate to placeorder — caller should navigate with current cart state
      navigate('/Placeorder');
    }
    return result;
  };

  const addToCartAfterLogin = (itemID, itemSize) => {
    // When user logs in, show a confirmation modal before actually adding
    setLoginModalOpen(false);
    const queued = queuedAdd || (itemID ? { itemID, itemSize } : null);
    if (!queued) return;
    if (queued.mode === 'checkout') setConfirmCheckoutOpen(true);
    else setConfirmQueuedOpen(true);
  };

  const performQueuedAdd = async () => {
    const queued = queuedAdd;
    if (!queued) {
      setConfirmQueuedOpen(false);
      return;
    }
    try {
      const pidNum = Number(queued.itemID);
      const pid = !isNaN(pidNum) ? pidNum : queued.itemID;
      const payload = { productId: pid, quantity: queued.quantity || 1 };
      if (queued.variantId) payload.variantId = queued.variantId;
      if (queued.size && queued.size !== 'default') payload.size = queued.size;
      await api.post('/cart', payload);
      await fetchCart();
      toast.success('produk disimpan di keranjang');
    } catch (err) {
      console.error('Failed add queued to cart', err);
      toast.error('Gagal menyimpan produk ke keranjang');
    } finally {
      setQueuedAdd(null);
      setConfirmQueuedOpen(false);
    }
  };

  const performQueuedCheckout = async () => {
    const queued = queuedAdd;
    if (!queued) {
      setConfirmCheckoutOpen(false);
      return;
    }
    try {
      const pidNum = Number(queued.itemID);
      const pid = !isNaN(pidNum) ? pidNum : queued.itemID;
      const payload = { productId: pid, quantity: queued.quantity || 1 };
      if (queued.variantId) payload.variantId = queued.variantId;
      if (queued.itemSize && queued.itemSize !== 'default') payload.size = queued.itemSize;
      await api.post('/cart', payload);
      await fetchCart();
      toast.success('produk disimpan di keranjang');
      // navigate to placeorder with the selected item so Placeorder can show the expected subtotal
  navigate('/Placeorder', { state: { selected: [{ id: pid, size: queued.itemSize || 'default', quantity: queued.quantity || 1, variantId: queued.variantId || null }] } });
    } catch (err) {
      console.error('Failed perform queued checkout', err);
      toast.error('Gagal proses checkout');
    } finally {
      setQueuedAdd(null);
      setConfirmCheckoutOpen(false);
    }
  };

  const get_Cart_Count = () => {
    let count = 0;
    for (let items in cartItems)
      for (let item in cartItems[items]) count += (cartItems[items][item]?.quantity || 0);
    return count;
  };

  const updateQuantity = (itemID, itemSize, quantity) => {
    // persist update to backend
    (async () => {
      try {
        // identify variantId if stored
        const sizeKey = itemSize || 'default';
        const stored = (cartItems[itemID] || {})[sizeKey];
        const variantId = stored ? stored.variantId : null;
        // normalize size for payload: send null (omit) when default so it matches DB NULL
        const normalizedSize = (itemSize && itemSize !== 'default') ? itemSize : null;
        if (quantity <= 0) {
          await api.delete('/cart', { data: { productId: parseInt(itemID), variantId, size: normalizedSize } });
          toast.success('Produk dihapus dari keranjang');
        } else {
          await api.patch('/cart', { productId: parseInt(itemID), variantId, size: normalizedSize, quantity });
        }
        await fetchCart();
      } catch (err) {
        console.error('Failed update cart', err);
        toast.error('Gagal memperbarui keranjang');
      }
    })();
  };

  const get_TotalCart = () => {
    let Total = 0;
    for (let items in cartItems) {
      for (let item in cartItems[items]) {
        const itemInfo = products.find((p) => p.id === parseInt(items));
        const qty = cartItems[items][item]?.quantity || 0;
        const variantPrice = cartItems[items][item]?.variantPrice;
        if (itemInfo) {
          const price = (variantPrice !== null && typeof variantPrice !== 'undefined') ? Number(variantPrice) : Number(itemInfo.price || 0);
          Total += price * qty;
        }
      }
    }
    return Total;
  };

  const value = {
    products, currency, delivery_fee,
    formatRupiah,
  cartItems, Add_Cart,
  loginModalOpen, setLoginModalOpen, addToCartAfterLogin, queuedAdd, setQueuedAdd, confirmQueuedOpen, setConfirmQueuedOpen, performQueuedAdd,
    confirmCheckoutOpen, setConfirmCheckoutOpen, performQueuedCheckout,
    search, setSearch,
    updateQuantity, get_Cart_Count, get_TotalCart,
    navigate,
    fetchCart,
    fetchOrders,
    addToCartDirect
  };

  return (
    <shopContext.Provider value={value}>
      {children}
    </shopContext.Provider>
  );
};

export default ShopContextProvider;
