import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import ConfirmModal from "../Components/ConfirmModal";
import formatRupiah from "../utils/formatRupiah";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => toast.error(err.response?.data?.error || err.message || 'Gagal memuat order'))
      .finally(() => setLoading(false));
  }, [id]);

  const statuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

  const handleChangeStatus = async (newStatus) => {
    if (!order) return;
    setPendingStatus(newStatus);
    setPendingMessage(`Ubah status order #${order.id} menjadi ${newStatus}?`);
    setConfirmOpen(true);
  };

  const confirmChangeStatus = async () => {
    if (!order || !pendingStatus) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/orders/${order.id}/status`, { status: pendingStatus });
      setOrder(prev => ({ ...prev, status: res.data.status }));
      toast.success('Status order diperbarui');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Gagal memperbarui status');
    } finally {
      setUpdating(false);
      setConfirmOpen(false);
      setPendingStatus(null);
      setPendingMessage('');
    }
  };

  if (loading) return <div className="p-6">Memuat...</div>;
  if (!order) return <div className="p-6">Order tidak ditemukan</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-bold">Detail Order #{order.id}</div>
        <div>
          <button className="px-3 py-1 bg-gray-100 rounded mr-2" onClick={() => navigate(-1)}>Kembali</button>
      <ConfirmModal isOpen={confirmOpen} title='Konfirmasi' message={pendingMessage} onCancel={()=>setConfirmOpen(false)} onConfirm={confirmChangeStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <div className="font-semibold">Informasi Pelanggan</div>
          <div className="mt-2">
            <div className="text-xs text-gray-500">Nama</div>
            <div className="font-semibold">{order.user?.name}</div>
          </div>
          <div className="text-sm">Email: {order.user?.email}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="font-semibold">Ringkasan Order</div>
          <div className="text-sm mt-2">Total: Rp {formatRupiah(order.totalAmount)}</div>
          <div className="text-sm">Metode Bayar: {order.paymentType}</div>
          <div className="text-sm">Delivery: {order.deliveryMethod}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="font-semibold mb-2">Status</div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-gray-100 rounded">{order.status}</div>
            <div className="flex gap-2">
              {statuses.map(s => (
                <button key={s} className="px-2 py-1 border rounded text-sm" disabled={updating || s===order.status} onClick={() => handleChangeStatus(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <div className="font-semibold mb-2">Items</div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Produk</th>
              <th className="px-4 py-2 text-left">Qty</th>
              <th className="px-4 py-2 text-left">Harga</th>
              <th className="px-4 py-2 text-left">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, idx) => (
              <tr key={it.id} className={idx%2===0? 'bg-gray-50':''}>
                <td className="px-4 py-2">{idx+1}</td>
                <td className="px-4 py-2">{it.product?.name || it.productId}</td>
                <td className="px-4 py-2">{it.quantity}</td>
                <td className="px-4 py-2">{formatRupiah(it.price)}</td>
                <td className="px-4 py-2">{formatRupiah(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
