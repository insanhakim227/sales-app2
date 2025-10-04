  const genderLabel = {
    MALE: "Laki-laki",
    FEMALE: "Perempuan",
    OTHER: "Lainnya"
  };
import { useEffect, useState, useContext } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function DetailUser() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "SUPERADMIN") return;
    api.get(`/users/${id}`).then(res => setDetail(res.data));
  }, [id, user]);

  if (user?.role !== "SUPERADMIN") return <div>Forbidden</div>;
  if (!detail) return <div>Loading...</div>;

  return (
    <Fragment>
      <div className="p-6 min-h-[60vh]">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full">
          <button
            className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            <span className="text-sm font-medium">Kembali</span>
          </button>
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center">Detail User</h2>
          <div className="flex flex-col items-center mb-6">
            {detail.profileImageUrl ? (
              <img
                src={detail.profileImageUrl ? (detail.profileImageUrl.startsWith("/image-user/") ? `${import.meta.env.VITE_IMAGE_URL || ""}${detail.profileImageUrl}` : detail.profileImageUrl) : "/assets/profile_icon.png"}
                alt={detail.name}
                className="w-24 h-24 rounded-full object-cover shadow cursor-pointer"
                onClick={() => setShowImageModal(true)}
                title="Lihat foto penuh"
              />
            ) : (
              <span className="w-24 h-24 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-3xl">-</span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {/* ...existing code... */}
            <div>
              <span className="font-semibold text-gray-600 block">Nama</span>
              <span className="text-gray-800 block break-words">{detail.name}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block">Email</span>
              <span className="text-gray-800 block break-words">{detail.email}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block">Mobile</span>
              <span className="text-gray-800 block break-words">{detail.mobile || '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block">Gender</span>
              <span className="text-gray-800 block break-words">{genderLabel[detail.gender] || '-'}</span>
            </div>
            <div>
  <span className="font-semibold text-gray-600 block">Provinsi</span>
  <span className="text-gray-800 block break-words">{detail.province || '-'}</span>
</div>
<div>
  <span className="font-semibold text-gray-600 block">Kabupaten/Kota</span>
  <span className="text-gray-800 block break-words">{detail.regency || '-'}</span>
</div>
<div>
  <span className="font-semibold text-gray-600 block">Kecamatan</span>
  <span className="text-gray-800 block break-words">{detail.district || '-'}</span>
</div>
<div>
  <span className="font-semibold text-gray-600 block">Desa/Kelurahan</span>
  <span className="text-gray-800 block break-words">{detail.village || '-'}</span>
</div>

            <div>
              <span className="font-semibold text-gray-600 block">Alamat</span>
              <span className="text-gray-800 block break-words">{detail.address || '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block">Role</span>
              <span className={`px-2 py-1 rounded text-xs font-bold block w-fit ${detail.role === "SUPERADMIN" ? "bg-red-100 text-red-700" : detail.role === "ADMIN" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{detail.role}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block">Verified</span>
              <span className="block">
                {detail.isVerified ? <FaCheckCircle className="text-green-500 inline" /> : <FaTimesCircle className="text-red-500 inline" />} {detail.isVerified ? "Ya" : "Tidak"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block">Last Login</span>
              <span className="text-gray-800 block break-words">{detail.lastLogin ? new Date(detail.lastLogin).toLocaleString() : '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block">Dibuat</span>
              <span className="text-gray-800 block break-words">{new Date(detail.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block">Diupdate</span>
              <span className="text-gray-800 block break-words">{new Date(detail.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for full image */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setShowImageModal(false)}>
          <div className="relative">
            <img
              src={detail.profileImageUrl ? (detail.profileImageUrl.startsWith("/image-user/") ? `${import.meta.env.VITE_IMAGE_URL || ""}${detail.profileImageUrl}` : detail.profileImageUrl) : "/assets/profile_icon.png"}
              alt={detail.name}
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg border-4 border-white"
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-200"
              onClick={e => { e.stopPropagation(); setShowImageModal(false); }}
              title="Tutup"
            >
              <FaTimesCircle className="text-xl text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </Fragment>
  );
}