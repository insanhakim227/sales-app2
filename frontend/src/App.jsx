import { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthContext } from "./Context/AuthContext";
import UserAreaGuard from './Components/UserAreaGuard';
import Home from './Pages/Home';
import About from './Pages/About';
import Product from './Pages/Product';
import Collections from './Pages/Collections';
import Contact from './Pages/Contact';
import Orders from './Pages/Orders';
import Placeorder from './Pages/Placeorder';
import Cart from './Pages/Cart';
import NavBar from "./Components/NavBar";
import Footer from "./Components/Footer";
import SearchBar from "./Components/SearchBar";
import { ToastContainer } from 'react-toastify';
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import GuestRoute from "./Components/GuestRoute";
import VerifyEmail from "./Pages/VerifyEmail";
import Profile from "./Pages/Profile";
import ListUsers from "./Pages/ListUser";
import DetailUsers from "./Pages/DetailUser";
import Settings from "./Pages/Settings";
import DashboardLayout from "./Pages/DashboardLayout";
import ListOrders from "./Pages/ListOrders";
import OrderDetail from "./Pages/OrderDetail";
import DashboardProducts from "./Pages/DashboardProducts";
import AdminProductDetail from "./Pages/AdminProductDetail";
import LoginModal from './Components/LoginModal';
import { shopContext } from './Context/ShopContext';
import ConfirmModal from './Components/ConfirmModal';

function AppRoutes() {
  const { loading } = useContext(AuthContext);
  const location = useLocation();
  const shop = useContext(shopContext);

  if (loading) return <div>Loading...</div>;
  const hideNav = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!hideNav && <NavBar />}
      {!hideNav && <SearchBar />}
      <ToastContainer />
  <LoginModal isOpen={shop?.loginModalOpen} onClose={() => shop?.setLoginModalOpen(false)} onSuccess={(user)=>{ /* no-op: LoginModal triggers queued flow after token persisted */ }} />
  {/* Show product preview inside confirm modal when confirming queued add */}
  <ConfirmModal
    isOpen={shop?.confirmQueuedOpen}
    title='Tambah ke Keranjang'
    onCancel={()=>shop?.setConfirmQueuedOpen(false)}
    onConfirm={()=>shop?.performQueuedAdd()}
    confirmLabel='Tambah'
  >
    {(() => {
      const queued = shop?.queuedAdd;
      if (!queued) return <p className="text-sm text-gray-700">Anda yakin ingin menambahkan produk ini ke keranjang?</p>;
      const pid = Number(queued.itemID);
      const idToFind = isNaN(pid) ? queued.itemID : pid;
      const prod = shop?.products?.find(p => p.id === idToFind || p.id === String(idToFind));
      if (!prod) return <p className="text-sm text-gray-700">Anda yakin ingin menambahkan produk ini ke keranjang?</p>;
      return (
        <div className="flex items-center gap-3">
          <img src={prod.image || prod.image_url} alt={prod.name || prod.title || 'product'} className="w-16 h-16 object-cover rounded" />
          <div>
            <div className="font-semibold">{prod.name || prod.title}</div>
            <div className="text-sm text-gray-600">{prod.price}</div>
          </div>
        </div>
      );
    })()}
  </ConfirmModal>
  <ConfirmModal
    isOpen={shop?.confirmCheckoutOpen}
    title='Konfirmasi Checkout'
    onCancel={()=>shop?.setConfirmCheckoutOpen(false)}
    onConfirm={()=>shop?.performQueuedCheckout()}
    confirmLabel='Checkout'
  >
    {(() => {
      const queued = shop?.queuedAdd;
      if (!queued) return <p className="text-sm text-gray-700">Anda yakin ingin checkout produk ini?</p>;
      const pid = Number(queued.itemID);
      const idToFind = isNaN(pid) ? queued.itemID : pid;
      const prod = shop?.products?.find(p => p.id === idToFind || p.id === String(idToFind));
      if (!prod) return <p className="text-sm text-gray-700">Anda yakin ingin checkout produk ini?</p>;
      const variant = prod.variants && prod.variants.find(v => String(v.id) === String(queued.variantId));
      const price = (variant && variant.price) ? variant.price : prod.price || 0;
      const qty = queued.quantity || 1;
      return (
        <div className="flex items-center gap-3">
          <img src={prod.image || prod.image_url} alt={prod.name || prod.title || 'product'} className="w-16 h-16 object-cover rounded" />
          <div>
            <div className="font-semibold">{prod.name || prod.title}</div>
            <div className="text-sm text-gray-600">Size: {queued.itemSize || 'default'}</div>
            <div className="text-sm text-gray-600">Qty: {qty}</div>
            <div className="text-sm text-gray-800 font-semibold">Subtotal: {shop?.formatRupiah ? shop.formatRupiah(price * qty) : (price * qty)}</div>
          </div>
        </div>
      );
    })()}
  </ConfirmModal>
      <Routes>
        <Route path="/" element={<UserAreaGuard> <Home /> </UserAreaGuard>} />
        <Route path="/Collections" element={<UserAreaGuard> <Collections /> </UserAreaGuard>} />
        <Route path="/About" element={<UserAreaGuard> <About /> </UserAreaGuard>} />
        <Route path="/products/:id" element={<UserAreaGuard> <Product /> </UserAreaGuard>} />
        <Route path="/Cart" element={<UserAreaGuard> <Cart /> </UserAreaGuard>} />
        <Route path="/Orders" element={<UserAreaGuard> <Orders /> </UserAreaGuard>} />
        <Route path="/Placeorder" element={<UserAreaGuard> <Placeorder /></UserAreaGuard>} />
        <Route path="/Contact" element={<UserAreaGuard> <Contact /> </UserAreaGuard>} />
        <Route path="/verify-email" element={<UserAreaGuard> <VerifyEmail /> </UserAreaGuard>} />
        <Route path="/profile" element={<UserAreaGuard> <Profile /> </UserAreaGuard>} />
         <Route path="/settings" element={<UserAreaGuard> <Settings /> </UserAreaGuard>} />

        <Route path="/login" element={ <GuestRoute> <Login /> </GuestRoute>} />
        <Route path="/register" element={<GuestRoute> <Register /></GuestRoute>} />

        <Route element={<ProtectedRoute roles={["ADMIN", "SUPERADMIN", "RESELLER", "KURIR"]} />}>
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
          <Route
            path="/dashboard/orders"
            element={
              <DashboardLayout>
                <ListOrders />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/products"
            element={
              <DashboardLayout>
                <DashboardProducts />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/products/:id"
            element={
              <DashboardLayout>
                <AdminProductDetail />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/orders/:id"
            element={
              <DashboardLayout>
                <OrderDetail />
              </DashboardLayout>
            }
          />
      </Route>
      <Route element={<ProtectedRoute roles={["SUPERADMIN"]} />}>
        <Route
          path="/dashboard/users"
          element={
            <DashboardLayout>
              <ListUsers />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/users/:id"
          element={
            <DashboardLayout>
              <DetailUsers />
            </DashboardLayout>
          }
        />
      </Route>
      <Route element={<ProtectedRoute roles={["ADMIN", "SUPERADMIN", "RESELLER", "KURIR"]} />}>
        <Route
          path="/dashboard/profile"
          element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          }
        />
        <Route
          path="dashboard/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />
      </Route>

        <Route path="/unauthorized" element={<div className="p-4">Unauthorized</div>} />
        <Route path="*" element={<div className="p-4">Not Found</div>} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return <AppRoutes />;
}
