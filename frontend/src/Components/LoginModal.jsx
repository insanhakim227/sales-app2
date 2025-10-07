import React, { useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { shopContext } from '../Context/ShopContext';
import { toast } from 'react-toastify';

export default function LoginModal({ isOpen, onClose, onSuccess }){
  const { login } = useContext(AuthContext);
  const shop = useContext(shopContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Email dan Password wajib diisi');
      return;
    }
    setLoading(true);
    try{
      const user = await login(email, password);
      toast.success('Login berhasil');
      // Wait until token is persisted to localStorage / axios interceptor is set
      const waitForToken = async (timeout = 1000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
          const token = localStorage.getItem('token');
          if (token) return true;
          // small delay
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 80));
        }
        return false;
      };
      try{
        const ok = await waitForToken(1200);
        if (ok) {
          // ensure cart is fetched so bubble/count updates
          try{ await shop.fetchCart(); }catch(e){/* ignore */}
          // small retry if cart count still zero
          try{
            const cnt = shop.get_Cart_Count ? shop.get_Cart_Count() : 0;
            if (cnt === 0) {
              await new Promise(r=>setTimeout(r, 250));
              try{ await shop.fetchCart(); }catch(e){}
            }
          }catch(e){}

          // If admin/superadmin, always redirect to dashboard and DO NOT run queuedAdd
          if (user && user.role && user.role !== 'USER') {
            onSuccess && onSuccess(user);
            onClose();
            navigate('/dashboard');
            return;
          }

          // For normal USER, if there was a queued add, trigger confirm
          if (shop?.queuedAdd) {
            shop.addToCartAfterLogin();
            onSuccess && onSuccess(user);
            onClose();
            return;
          }
        }
      }catch(e){ console.error('Error waiting for token', e); }
      // no queued add — redirect by role (default to home)
      try{ onSuccess && onSuccess(user); onClose(); navigate('/'); }catch(e){}
    }catch(err){
      toast.error('Login gagal, cek email/password');
    }finally{ setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Login</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="modal-email" className="text-sm font-medium text-gray-700">Email</label>
            <input id="modal-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label htmlFor="modal-password" className="text-sm font-medium text-gray-700">Password</label>
            <input id="modal-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Batal</button>
            <button type="submit" disabled={loading} className="px-3 py-1 bg-indigo-600 text-white rounded">{loading ? 'Loading...' : 'Login'}</button>
          </div>
        </form>
        <div className="mt-3 text-sm text-center">
          Belum punya akun? <button onClick={()=>{ onClose(); navigate('/register'); }} className="text-indigo-600 underline">Register</button>
        </div>
      </div>
    </div>
  );
}