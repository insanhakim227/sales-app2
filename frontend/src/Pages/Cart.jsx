import React, { useContext, useEffect, useState } from "react";
import { shopContext } from "../Context/ShopContext";
import { AuthContext } from "../Context/AuthContext";
import Title from "../Components/Title";
import CartProduct from "../Components/CartProduct";
import TotalCart from "../Components/TotalCart";

const Cart = () => {
  const { cartItems, products, navigate, fetchCart, updateQuantity } = useContext(shopContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    if (user) {
      fetchCart && fetchCart().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  // Ubah cartItems ke array
  const cartArray = [];
  for (const itemsID in cartItems) {
    for (const itemSize in cartItems[itemsID]) {
      const entry = cartItems[itemsID][itemSize];
      if (entry && entry.quantity > 0) {
        cartArray.push({
          id: itemsID,
            size: itemSize,
            quantity: entry.quantity,
          variantId: entry.variantId || null
        });
      }
    }
  }

  const toggleSelect = (id, size) => {
    const key = `${id}::${size}`;
    setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

    const toggleSelectAll = () => {
      const allSelected = cartArray.every(item => selectedItems[`${item.id}::${item.size}`]);
      const next = {};
      cartArray.forEach(item => {
        next[`${item.id}::${item.size}`] = !allSelected;
      });
      setSelectedItems(next);
    };

    const deleteSelected = async () => {
      for (const item of cartArray) {
        const key = `${item.id}::${item.size}`;
        if (selectedItems[key]) {
          try {
            // updateQuantity will call backend and refresh cart
            await updateQuantity(item.id, item.size, 0);
          } catch (e) {
            console.error('Failed delete selected', e);
          }
        }
      }
      setSelectedItems({});
    };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // prepare selected items
    const selected = cartArray.filter(item => selectedItems[`${item.id}::${item.size}`]);
    if (selected.length === 0) {
      // if nothing selected, behave like before and checkout all
      navigate("/Placeorder");
      return;
    }
    navigate("/Placeorder", { state: { selected } });
  };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <p className="mb-4">Anda harus login untuk melihat keranjang.</p>
        <button onClick={() => navigate("/login")}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-700">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="px-5">
      <Title text1={"Your "} text2={"Cart"} />
      {cartArray.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Keranjang kosong</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" aria-label="Select all" onChange={toggleSelectAll} checked={cartArray.length > 0 && cartArray.every(i => selectedItems[`${i.id}::${i.size}`])} />
              <span className="text-sm text-gray-600">Select all</span>
            </div>
            <div>
              {Object.values(selectedItems).some(Boolean) && (
                <button onClick={deleteSelected} className="text-red-600 hover:underline">Hapus yang dipilih</button>
              )}
            </div>
          </div>
          <div>
            {cartArray.map((item) => {
              const productData = products.find((product) => product.id == item.id);
              if (!productData) return null;
              return (
                <CartProduct
                  key={item.id + item.size}
                  Image1={productData.image}
                  Name1={productData.name}
                  Price1={ (item.variantId && cartItems[item.id] && cartItems[item.id][item.size] && cartItems[item.id][item.size].variantPrice) ? cartItems[item.id][item.size].variantPrice : productData.price }
                  Size1={item.size}
                  countProduct={item.quantity}
                  ID={item.id}
                  variantId={item.variantId}
                  checked={selectedItems[`${item.id}::${item.size}`]}
                  onToggleChecked={toggleSelect}
                />
              );
            })}
            <hr className="mt-5" />
          </div>
          <div className="flex justify-end">
            <TotalCart cartArray={cartArray} selectedItems={selectedItems} />
          </div>
          <div className="flex flex-col items-end ">
            <button
              onClick={handleCheckout}
              className="bg-black text-white w-40 h-10 text-xl mt-10 hover:bg-gray-700"
            >
              CheckOut
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
