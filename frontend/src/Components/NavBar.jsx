import { useContext, useState } from "react";
import { Link, NavLink } from 'react-router-dom';
import { shopContext } from "../Context/ShopContext";
import { AuthContext } from "../Context/AuthContext"; // 🔹 import AuthContext
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";
import Logo from '../assets/My_assets/logo.jpg';
import { assets } from "../assets/assets";
import { FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";

const NavBar = () => {
  const [menuVisible, setmenuVisible] = useState(false);
  const { showSeach, setShowSearch, CartCount, get_Cart_Count } = useContext(shopContext);
  const { user, logout } = useContext(AuthContext); // 🔹 akses user & logout
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    toast.success("Berhasil logout!");
  };

  return (
    <div className="flex items-center justify-between font-medium">
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

      <NavLink to='/'><img className="w-40 cursor-pointer" src={Logo} alt="NavBar" /></NavLink>

      {/* Menu utama */}
      <ul className="hidden sm:flex gap-5 ">
        <NavLink to='/' className="flex flex-col items-center gap-1">
          <p>Home</p>
        </NavLink>
        <NavLink to='/Collections' className="flex flex-col items-center gap-1">
          <p>Collections</p>
        </NavLink>
        <NavLink to='/About' className="flex flex-col items-center gap-1">
          <p>About</p>
        </NavLink>
        <NavLink to='/Contact' className="flex flex-col items-center gap-1">
          <p>Contact</p>
        </NavLink>
      </ul>

      {/* Bagian kanan: orders, cart, profile, logout */}
      <div className="flex items-center gap-4">
        <img onClick={() => setShowSearch(!showSeach)} className="w-4 cursor-pointer" src={assets.search_icon} alt="Search_icon" />

        {/* Orders icon pakai react-icons FaBoxOpen */}
        <Link to={'/Orders'} className="relative flex items-center gap-1">
          <FaBoxOpen className="w-6 h-6" />
        </Link>

        <Link to={'/Cart'} className="relative flex items-center gap-1">
          <img className="w-5 min-w-5" src={assets.cart_icon} alt="cart_NavBar" />
          <p className={`absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 ${CartCount == 0 ? '' : 'bg-black'} text-white aspect-square rounded-full text-[9px]`}>{get_Cart_Count()}</p>
        </Link>

        {user ? (
          <div className="relative">
            <button
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-indigo-50"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            >
              <img src={user.profileImageUrl && user.profileImageUrl.trim() !== "" ? (user.profileImageUrl.startsWith("/image-user/") ? `${IMAGE_URL}${user.profileImageUrl}` : user.profileImageUrl) : "/assets/profile_icon.png"} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
              <span className="hidden md:inline text-sm font-semibold">{user.name || 'Profil'}</span>
            </button>
            {/* Dropdown menu, muncul saat showProfileMenu true */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-50 transition-all duration-200 ease-in-out opacity-100 scale-100"
                style={{ transform: showProfileMenu ? 'scale(1)' : 'scale(0.95)', opacity: showProfileMenu ? 1 : 0 }}
                onClick={e => e.stopPropagation()}
              >
                <NavLink
                  to={user.role === "USER" ? "/profile" : "/dashboard/profile"}
                  className="block px-4 py-2 hover:bg-indigo-50"
                  onClick={() => setShowProfileMenu(false)}
                >Profile</NavLink>
                <NavLink
                  to="/settings"
                  className="block px-4 py-2 hover:bg-indigo-50"
                  onClick={() => setTimeout(() => setShowProfileMenu(false), 100)}
                >Settings</NavLink>
                <button
                  onClick={() => { setShowLogoutModal(true); setShowProfileMenu(false); }}
                  className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
                >Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to='/login' className="px-3 py-1 rounded hover:bg-indigo-50">Login</NavLink>
            <NavLink to='/register' className="px-3 py-1 rounded hover:bg-indigo-50">Register</NavLink>
          </>
        )}

        <img onClick={() => { setmenuVisible(true) }} className="pr-3 w-7 sm:hidden cursor-pointer" src={assets.menu_icon} alt="SideMenu" />
      </div>

      {/* Mobile menu */}
      <div className={`absolute right-0 bottom-0 top-0 overflow-hidden bg-white transition-all ${menuVisible ? 'w-full' : 'w-0'}`} style={{ zIndex: 999 }}>
        <div>
          <div onClick={() => { setmenuVisible(false) }} className="flex gap-2 mt-3 items-center cursor-pointer py-2 pl-6">
            <img className="w-3" src={assets.dropdown_icon} alt="arraw back" />
            <p>Back</p>
          </div>
          <div className="flex flex-col gap-5 m-6">
            <NavLink onClick={() => { setmenuVisible(false) }} className='py-2 pl-6 border' to='/'>Home</NavLink>
            <NavLink onClick={() => { setmenuVisible(false) }} className='py-2 pl-6 border' to='/Collections'>Collections</NavLink>
            <NavLink onClick={() => { setmenuVisible(false) }} className='py-2 pl-6 border' to='/About'>About</NavLink>
            <NavLink onClick={() => { setmenuVisible(false) }} className='py-2 pl-6 border' to='/Contact'>Contact</NavLink>

            <Link onClick={() => setmenuVisible(false)} className='py-2 pl-6 border flex items-center gap-2' to='/Orders'>
              <img src={assets.orders_icon || assets.cart_icon} alt="orders" className="w-5 h-5" />
              <span>Orders</span>
            </Link>
            <Link onClick={() => setmenuVisible(false)} className='py-2 pl-6 border flex items-center gap-2' to='/Cart'>
              <img src={assets.cart_icon} alt="cart_NavBar" className="w-5 h-5" />
              <span>Cart</span>
            </Link>

            {user ? (
              <>
                <NavLink onClick={() => setmenuVisible(false)} className='py-2 pl-6 border flex items-center gap-2' to={user.role === "USER" ? "/profile" : "/dashboard/profile"}>
                  <img src={user.profileImageUrl && user.profileImageUrl.trim() !== "" ? (user.profileImageUrl.startsWith("/image-user/") ? `${IMAGE_URL}${user.profileImageUrl}` : user.profileImageUrl) : "/assets/profile_icon.png"} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                  <span>Profile</span>
                </NavLink>
                <NavLink onClick={() => setmenuVisible(false)} className='py-2 pl-6 border flex items-center gap-2' to="/settings">
                  <span>Settings</span>
                </NavLink>
                <button onClick={() => { logout(); setmenuVisible(false); }} className='py-2 pl-6 border text-left'>Logout</button>
              </>
            ) : (
              <>
                <NavLink onClick={() => setmenuVisible(false)} className='py-2 pl-6 border' to='/login'>Login</NavLink>
                <NavLink onClick={() => setmenuVisible(false)} className='py-2 pl-6 border' to='/register'>Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
