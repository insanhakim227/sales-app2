import { useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const NAV_CONFIG = {
  SUPERADMIN: [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Users", path: "/dashboard/users", icon: <UsersIcon className="w-5 h-5" /> },
    { label: "Products", path: "/dashboard/products", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Orders", path: "/dashboard/orders", icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
    { label: "Settings", path: "/dashboard/settings", icon: <Cog6ToothIcon className="w-5 h-5" /> },
    { label: "Profile", path: "/dashboard/profile", icon: <UserCircleIcon className="w-5 h-5" /> },
  ],
  ADMIN: [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Products", path: "/dashboard/products", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Orders", path: "/dashboard/orders", icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
    { label: "Reports", path: "/dashboard/reports", icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
    { label: "Settings", path: "/dashboard/settings", icon: <Cog6ToothIcon className="w-5 h-5" /> },
    { label: "Profile", path: "/dashboard/profile", icon: <UserCircleIcon className="w-5 h-5" /> },
  ],
  RESELLER: [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Products", path: "/dashboard/products", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Orders", path: "/dashboard/orders", icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
    { label: "Settings", path: "/dashboard/settings", icon: <Cog6ToothIcon className="w-5 h-5" /> },
    { label: "Profile", path: "/dashboard/profile", icon: <UserCircleIcon className="w-5 h-5" /> },
  ],
  KURIR: [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Orders", path: "/dashboard/orders", icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
    { label: "Reports", path: "/dashboard/reports", icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
    { label: "Settings", path: "/dashboard/settings", icon: <Cog6ToothIcon className="w-5 h-5" /> },
    { label: "Profile", path: "/dashboard/profile", icon: <UserCircleIcon className="w-5 h-5" /> },
  ],
};

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  const navItems = NAV_CONFIG[user.role] || [];

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout!");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Modal konfirmasi logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center animate-fadeIn">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Logout</h3>
            <p className="mb-6">Apakah Anda yakin ingin logout?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowLogoutModal(false)}
              >Batal</button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogout}
              >Ya, Logout</button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 text-xl font-bold text-indigo-700">Dashboard</div>
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                className={`flex items-center w-full px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 transition ${
                  location.pathname === item.path ? "bg-indigo-100 font-semibold" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <button
        onClick={() => setShowLogoutModal(true)}
        className="flex items-center px-4 py-3 m-4 rounded-lg text-red-600 hover:bg-red-50 transition"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        <span className="ml-3">Logout</span>
      </button>
    </aside>
  );
};

export default Navigation;