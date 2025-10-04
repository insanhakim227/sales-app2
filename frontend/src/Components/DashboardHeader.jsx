import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { assets } from "../assets/assets";
import NameField from './NameField';
import { toast } from "react-toastify";

const DashboardHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";
  const profileImg = user?.profileImageUrl && user.profileImageUrl.trim() !== ""
    ? (user.profileImageUrl.startsWith("/image-user/") ? `${IMAGE_URL}${user.profileImageUrl}` : user.profileImageUrl)
    : null;

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout!");
    navigate('/login');
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={assets.logo} alt="Logo" className="w-10 h-10 object-cover rounded" />
            <div>
              <div className="font-bold text-indigo-700">Sales App</div>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm text-gray-700 hover:text-indigo-600">Home</Link>
          {user?.role === 'SUPERADMIN' && (
            <Link to="/dashboard/users" className="text-sm text-gray-700 hover:text-indigo-600">Users</Link>
          )}
          <Link to="/dashboard/orders" className="text-sm text-gray-700 hover:text-indigo-600">Orders</Link>
          <Link to="/dashboard/reports" className="text-sm text-gray-700 hover:text-indigo-600">Reports</Link>
          <Link to="/dashboard/settings" className="text-sm text-gray-700 hover:text-indigo-600">Settings</Link>
        </nav>

        <div className="relative">
          <button
            onClick={() => setShowMenu((s) => !s)}
            className="flex items-center gap-3 px-3 py-1 rounded hover:bg-indigo-50"
          >
            <img
              src={profileImg || assets.profile_icon}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden sm:flex flex-col text-left">
              <NameField title={user?.role || ''} value={user?.name || 'Admin'} />
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50">
              <Link to="/dashboard/profile" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setShowMenu(false)}>Profile</Link>
              <Link to="/dashboard/settings" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setShowMenu(false)}>Settings</Link>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => { setShowMenu(false); setShowLogoutConfirm(true); }}>Logout</button>
            </div>
          )}

          {/* Logout confirmation modal */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowLogoutConfirm(false)} />
              <div className="bg-white rounded shadow-lg p-6 z-10 w-80">
                <div className="text-lg font-semibold mb-2">Konfirmasi Logout</div>
                <div className="text-sm text-gray-600 mb-4">Apakah Anda yakin ingin logout?</div>
                <div className="flex justify-end gap-3">
                  <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setShowLogoutConfirm(false)}>Batal</button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
