import React, { useContext, useEffect, useState } from "react";
import Title from "../Components/Title";
import { shopContext } from "../Context/ShopContext";
import { AuthContext } from "../Context/AuthContext";

const Orders = () => {
  const { fetchOrders, products, currency } = useContext(shopContext);
  const { user, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useContext(shopContext).navigate;

  useEffect(() => {
    if (user) {
      fetchOrders && fetchOrders().then(data => {
        setOrders(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (authLoading || loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <p className="mb-4">Anda harus login untuk melihat pesanan.</p>
        <button onClick={() => navigate("/login")}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-700">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Title text1={'My '} text2={'Orders'} />
      <div className="mt-8 space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Tidak ada order</div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                {/* Product Info */}
                <div className="flex flex-1 gap-6">
                  {/* Tampilkan produk pertama dari order */}
                  {order.items && order.items[0] && (
                    <img
                      className="w-24 h-24 object-contain rounded-lg bg-gray-50 p-2 border"
                      src={(() => {
                        const prod = products.find(p => p.id === order.items[0].productId);
                        return prod ? prod.image : "";
                      })()}
                      alt={(() => {
                        const prod = products.find(p => p.id === order.items[0].productId);
                        return prod ? prod.name : "";
                      })()}
                    />
                  )}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.items && order.items[0] && (() => {
                        const prod = products.find(p => p.id === order.items[0].productId);
                        return prod ? prod.name : "";
                      })()}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <p>{currency}{order.totalAmount}</p>
                      <p>Quantity: {order.items && order.items[0] ? order.items[0].quantity : 0}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Ordered on: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "-"}
                    </p>
                  </div>
                </div>
                {/* Status and Action */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">{order.status || "Ready To Ship"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;