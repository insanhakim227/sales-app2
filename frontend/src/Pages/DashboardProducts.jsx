import { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { getImageUrl } from '../utils/getImageUrl';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import ConfirmModal from '../Components/ConfirmModal';

export default function DashboardProducts(){
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('add'); // add | list | pending

  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '' });
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  useEffect(()=>{ fetchProducts(); },[])

  const fetchProducts = async ()=>{
    try{
      const { data } = await api.get('/products/all');
      setProducts(data);
    }catch(err){ console.error(err); }
  }

  const handleCreate = async (e)=>{
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    if (file) formData.append('image', file);
    try{
      setLoading(true);
      await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  setForm({ name: '', price: '', stock: '', description: '' }); setFile(null);
  fetchProducts();
  toast.success('Product created (awaiting approval)');
  setTab('pending');
  }catch(err){ console.error(err); toast.error('Failed to create product'); }
    finally{ setLoading(false); }
  }

  const handleApprove = async (id)=>{
  try{ await api.patch(`/products/${id}/approve`); fetchProducts(); toast.success('Product approved'); }
  catch(err){ console.error(err); toast.error('Failed to approve'); }
  }

  const handleDelete = async (id)=>{
    setToDeleteId(id);
    setConfirmOpen(true);
  }

  const confirmDelete = async ()=>{
    if (!toDeleteId) return;
    try{ await api.delete(`/products/admin/${toDeleteId}`); fetchProducts(); toast.success('Produk dihapus'); }
    catch(err){ console.error(err); toast.error('Gagal hapus produk'); }
    finally{ setConfirmOpen(false); setToDeleteId(null); }
  }

  if(!user) return <div className='p-6'>Please login</div>;

  // derived lists
  const pending = products.filter(p => !p.isActive);
  const active = products.filter(p => p.isActive);

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-2xl font-bold'>Products</h2>
        <div className='flex items-center gap-2'>
          <select value={tab} onChange={e=>setTab(e.target.value)} className='border px-2 py-1 rounded'>
            <option value='add'>Add Product</option>
            <option value='list'>List Product</option>
            <option value='pending'>Pending Product</option>
          </select>
        </div>
      </div>

      {tab === 'add' && (
        <form onSubmit={handleCreate} className='bg-white p-4 rounded shadow mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder='Name' className='input-field' />
            <input value={form.price} onChange={e=>setForm({...form, price: e.target.value})} placeholder='Price' className='input-field' />
            <input value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} placeholder='Stock' className='input-field' />
            <input type='file' onChange={e=>setFile(e.target.files[0])} />
            <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} placeholder='Description' className='input-field col-span-2' />
          </div>
          <div className='mt-3'>
            <button disabled={loading} className='px-4 py-2 bg-indigo-600 text-white rounded'>Create Product</button>
          </div>
        </form>
      )}

      {tab === 'list' && (
        <div>
          <h3 className='text-xl font-semibold mb-2'>All Products</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {active.map(p => (
              <div key={p.id} className='bg-white p-3 rounded shadow'>
                <Link to={`/dashboard/products/${p.id}`}>
                  <img src={getImageUrl(p.image_url) || '/image-product/3_1759572273959.jpeg'} className='w-full h-40 object-cover mb-2' alt={p.name} />
                </Link>
                <div className='font-semibold'>{p.name}</div>
                <div className='text-sm text-gray-600'>Rp {p.price}</div>
                <div className='flex gap-2 mt-2'>
                  <Link to={`/dashboard/products/${p.id}`} className='px-3 py-1 bg-gray-200 rounded'>Detail / Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pending' && (
        <div>
          <h3 className='text-xl font-semibold mb-2'>Pending products</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {pending.map(p=> (
              <div key={p.id} className='bg-white p-3 rounded shadow'>
                <Link to={`/dashboard/products/${p.id}`}>
                  <img src={getImageUrl(p.image_url) || '/image-product/3_1759572273959.jpeg'} className='w-full h-40 object-cover mb-2' alt={p.name} />
                </Link>
                <div className='font-semibold'>{p.name}</div>
                <div className='text-sm text-gray-600'>Rp {p.price}</div>
                <div className='flex gap-2 mt-2'>
                  <button onClick={()=>handleApprove(p.id)} className='px-3 py-1 bg-green-600 text-white rounded'>Approve</button>
                  <Link to={`/dashboard/products/${p.id}`} className='px-3 py-1 bg-gray-200 rounded'>Detail</Link>
                  <button onClick={()=>handleDelete(p.id)} className='px-3 py-1 bg-red-600 text-white rounded'>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmModal isOpen={confirmOpen} title='Hapus Produk' message='Yakin ingin menghapus produk ini?' onCancel={()=>setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  )
}
