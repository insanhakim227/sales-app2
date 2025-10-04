import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../Context/AuthContext";
import formatRupiah from "../utils/formatRupiah";

export default function ListOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // For admin, fetch all orders
    const path = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' ? '/orders/all' : '/orders';
    api.get(path)
      .then(res => setOrders(res.data))
      .catch(err => setError(err.response?.data?.error || err.message || 'Gagal memuat order'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-bold">Daftar Orders</div>
      </div>

      {loading && <div>Memuat...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="bg-white shadow rounded">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Items</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{o.id}</td>
                  <td className="px-4 py-2">{o.user?.name || o.userEmail || '—'}</td>
                  <td className="px-4 py-2">Rp {formatRupiah(o.totalAmount ?? o.total)}</td>
                    <td className="px-4 py-2">{o.status}</td>
                    <td className="px-4 py-2">{o.items?.length ?? 0}</td>
                    <td className="px-4 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <a href={`/dashboard/orders/${o.id}`} className="text-indigo-600 hover:underline mr-3">Detail</a>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
