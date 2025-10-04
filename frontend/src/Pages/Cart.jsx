import React, { useContext, useEffect, useState } from "react";
import { shopContext } from "../Context/ShopContext";
import { AuthContext } from "../Context/AuthContext";
import Title from "../Components/Title";
import CartProduct from "../Components/CartProduct";
import TotalCart from "../Components/TotalCart";

const Cart = () => {
  const { cartItems, products, navigate, fetchCart } = useContext(shopContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

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
      if (cartItems[itemsID][itemSize] > 0) {
        cartArray.push({
          id: itemsID,
          size: itemSize,
          quantitty: cartItems[itemsID][itemSize],
        });
      }
    }
  }

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/Placeorder");
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
          <div>
            {cartArray.map((item) => {
              const productData = products.find((product) => product.id == item.id);
              if (!productData) return null;
              return (
                <CartProduct
                  key={item.id + item.size}
                  Image1={productData.image}
                  Name1={productData.name}
                  Price1={productData.price}
                  Size1={item.size}
                  countProduct={item.quantitty}
                  ID={item.id}
                />
              );
            })}
            <hr className="mt-5" />
          </div>
          <div className="flex justify-end">
            <TotalCart />
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
