import React, { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import formatRupiah from "../utils/formatRupiah";

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
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
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
        cartObj[item.productId][item.size || "default"] = item.quantity;
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

  const Add_Cart = (itemID, itemSize) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      // notify user and open login modal; store the attempted item so we can add it after login
      toast.info('anda harus login terlebih dahulu');
      setQueuedAdd({ itemID, itemSize });
      setLoginModalOpen(true);
      return;
    }
    // if itemSize not provided, use 'default'
    const size = itemSize || 'default';
    // persist to backend
    (async () => {
      try {
        const res = await api.post('/cart', { productId: parseInt(itemID), quantity: 1 });
        // reflect server state by refetch
        await fetchCart();
        toast.success('produk disimpan di keranjang');
      } catch (err) {
        console.error('Failed add to cart', err);
        toast.error('Gagal menyimpan produk ke keranjang');
      }
    })();
  };

  const addToCartAfterLogin = (itemID, itemSize) => {
    // When user logs in, show a confirmation modal before actually adding
    setLoginModalOpen(false);
    const queued = queuedAdd || (itemID ? { itemID, itemSize } : null);
    if (!queued) return;
    setConfirmQueuedOpen(true);
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
      await api.post('/cart', { productId: pid, quantity: 1 });
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

  const get_Cart_Count = () => {
    let count = 0;
    for (let items in cartItems)
      for (let item in cartItems[items]) count += cartItems[items][item] || 0;
    return count;
  };

  const updateQuantity = (itemID, itemSize, quantity) => {
    // persist update to backend
    (async () => {
      try {
        if (quantity <= 0) {
          await api.delete('/cart', { data: { productId: parseInt(itemID) } });
          toast.success('Produk dihapus dari keranjang');
        } else {
          await api.patch('/cart', { productId: parseInt(itemID), quantity });
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
        if (itemInfo) {
          Total += itemInfo.price * cartItems[items][item];
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
    search, setSearch,
    updateQuantity, get_Cart_Count, get_TotalCart,
    navigate,
    fetchCart,
    fetchOrders
  };

  return (
    <shopContext.Provider value={value}>
      {children}
    </shopContext.Provider>
  );
};

export default ShopContextProvider;
