import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../Context/AuthContext";
import { Bar, Line, Pie } from "react-chartjs-2";
import { UserCircleIcon } from "@heroicons/react/24/solid";

export default function DashboardAdmin() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({});
  const [salesPerProduct, setSalesPerProduct] = useState([
    { product: "Produk A", sales: 120 },
    { product: "Produk B", sales: 80 },
    { product: "Produk C", sales: 60 },
  ]);
  const [categoryDistribution, setCategoryDistribution] = useState([
    { category: "Elektronik", value: 40 },
    { category: "Fashion", value: 30 },
    { category: "Makanan", value: 30 },
  ]);

  useEffect(() => {
    api.get("/dashboard/summary").then(res => setSummary(res.data));
    // TODO: fetch salesPerProduct dan categoryDistribution dari backend jika sudah ada
  }, []);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";
  const profileImg = user?.profileImageUrl && user.profileImageUrl.trim() !== "" ? (user.profileImageUrl.startsWith("/image-user/") ? `${IMAGE_URL}${user.profileImageUrl}` : user.profileImageUrl) : null;
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-bold">Dashboard Admin</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Total Order</div>
          <div className="text-2xl font-bold">{summary.orderCount}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Pendapatan</div>
          <div className="text-2xl font-bold">Rp {summary.totalRevenue?.toLocaleString()}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-gray-500">Notifikasi Baru</div>
          <div className="text-2xl font-bold">{summary.notifCount}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <div className="font-semibold mb-2">Penjualan per Produk</div>
          <Bar
            data={{
              labels: salesPerProduct.map(d => d.product),
              datasets: [{
                label: "Penjualan",
                data: salesPerProduct.map(d => d.sales),
                backgroundColor: ["#6366f1", "#f59e42", "#10b981"],
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } }
            }}
          />
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="font-semibold mb-2">Distribusi Kategori Produk</div>
          <Pie
            data={{
              labels: categoryDistribution.map(d => d.category),
              datasets: [{
                data: categoryDistribution.map(d => d.value),
                backgroundColor: ["#6366f1", "#f59e42", "#10b981"],
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: true, position: "bottom" } }
            }}
          />
        </div>
      </div>
      {/* Activity Log, dsb bisa ditambah di sini */}
    </div>
  );
}
