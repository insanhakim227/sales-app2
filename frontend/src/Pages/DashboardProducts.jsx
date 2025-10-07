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
  const SIZE_OPTIONS = ['XS','S','M','L','XL','XXL'];
  const [variantInputs, setVariantInputs] = useState(() => SIZE_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: { stock: 0, extra: 0 } }), {}));
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  useEffect(()=>{ fetchProducts(); },[])

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/products/categories');
        setCategories(data || []);
      } catch (e) { console.error('Failed fetch categories', e); }
    };
    fetchCats();
  }, []);

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
  // compute total stock from variants
  const totalStock = Object.values(variantInputs).reduce((s, v) => s + (Number(v.stock) || 0), 0);
  formData.append('stock', totalStock);
  if (file) formData.append('image', file);
  if (form.gender) formData.append('gender', form.gender);
  if (form.categoryId) formData.append('categoryId', form.categoryId);
    try{
      setLoading(true);
      const { data: product } = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      // create variants for sizes with stock > 0
      for (const s of SIZE_OPTIONS) {
        const v = variantInputs[s];
        if (v && Number(v.stock) > 0) {
          await api.post(`/products/admin/${product.id}/variants`, { size: s, stock: Number(v.stock), price: Number(form.price) + (Number(v.extra) || 0) });
        }
      }
  setForm({ name: '', price: '', stock: '', description: '' }); setFile(null);
  setVariantInputs(SIZE_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: { stock: 0, extra: 0 } }), {}));
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
            <div>
              <label htmlFor="product-name" className="text-sm font-medium text-gray-700">Nama Produk</label>
              <input id="product-name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder='Name' className='input-field block w-full border px-3 py-2 rounded' />
            </div>
            <div>
              <label htmlFor="product-price" className="text-sm font-medium text-gray-700">Harga</label>
              <input id="product-price" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} placeholder='Price' className='input-field block w-full border px-3 py-2 rounded' />
            </div>
            <div className='md:col-span-2'>
              <label className="text-sm font-medium text-gray-700">Stok per Size (kosongkan bila tidak ada)</label>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-2'>
                {SIZE_OPTIONS.map(s => (
                  <div key={s} className='border p-2 rounded'>
                    <div className='font-semibold'>{s}</div>
                    <input type='number' min={0} value={variantInputs[s].stock} onChange={e=>setVariantInputs(prev=>({ ...prev, [s]: { ...prev[s], stock: Number(e.target.value) } }))} className='w-full border px-2 py-1 rounded mt-1' placeholder='Stock' />
                    <input type='number' min={0} value={variantInputs[s].extra} onChange={e=>setVariantInputs(prev=>({ ...prev, [s]: { ...prev[s], extra: Number(e.target.value) } }))} className='w-full border px-2 py-1 rounded mt-1' placeholder='Extra price (Rp)' />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Gambar Produk</label>
              <div className='mt-2'>
                <input id="product-image" type='file' onChange={e=>setFile(e.target.files[0])} className='hidden' />
                <label htmlFor='product-image' className='w-40 h-40 border rounded-lg flex items-center justify-center cursor-pointer overflow-hidden'>
                  {file ? (
                    <img src={URL.createObjectURL(file)} alt='preview' className='w-full h-full object-cover' />
                  ) : (
                    <div className='text-center text-sm text-gray-500'>Click to upload image</div>
                  )}
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="product-gender" className="text-sm font-medium text-gray-700">Gender</label>
              <select id="product-gender" className="w-full border px-3 py-2 rounded" value={form.gender || ''} onChange={e=>setForm({...form, gender: e.target.value})}>
                <option value="">(none)</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="product-category" className="text-sm font-medium text-gray-700">Category</label>
              <select id="product-category" className="w-full border px-3 py-2 rounded" value={form.categoryId || ''} onChange={e=>setForm({...form, categoryId: e.target.value})}>
                <option value="">(no category)</option>
                {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div className='md:col-span-2'>
              <label htmlFor="product-desc" className="text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea id="product-desc" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} placeholder='Description' className='input-field col-span-2 block w-full border px-3 py-2 rounded' />
            </div>
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
