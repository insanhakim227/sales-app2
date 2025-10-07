import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/getImageUrl';
import { toast } from 'react-toastify';
import formatRupiah from '../utils/formatRupiah';
import ConfirmModal from '../Components/ConfirmModal';

export default function AdminProductDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', isActive: false, gender: '', categoryId: '' });
  const [file, setFile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantForm, setVariantForm] = useState({ size: '', color: '', stock: 0, price: '' });

  useEffect(()=>{
    fetchProduct();
  },[id]);

  const fetchProduct = async ()=>{
    try{
      const { data } = await api.get(`/products/admin/${id}`);
      setProduct(data);
      setForm({ name: data.name || '', price: data.price || '', stock: data.stock || '', description: data.description || '', isActive: data.isActive, gender: data.gender || '', categoryId: data.categoryId || '' });
      setVariants(data.variants || []);
    }catch(err){
      console.error(err);
      toast.error('Gagal ambil produk');
      navigate('/dashboard/products');
    }finally{ setLoading(false); }
  }

  useEffect(() => {
    const fetchCats = async () => {
      try{
        const { data } = await api.get('/products/categories');
        setCategories(data || []);
      }catch(e){ console.error('Failed fetch categories', e); }
    };
    fetchCats();
  }, []);

  const handleUpdate = async (e)=>{
    e.preventDefault();
    try{
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description || '');
  formData.append('price', form.price || 0);
  formData.append('stock', form.stock || 0);
  formData.append('isActive', form.isActive ? 'true' : 'false');
  if (form.gender) formData.append('gender', form.gender);
  if (form.categoryId) formData.append('categoryId', form.categoryId);
  if (file) formData.append('image', file);
      const { data } = await api.patch(`/products/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Produk diperbarui');
      navigate('/dashboard/products');
  }catch(err){ console.error(err); toast.error('Gagal update produk'); }
  }

  const handleDelete = async ()=>{
    setConfirmOpen(true);
  }

  const handleAddVariant = async (e) => {
    e.preventDefault();
    try{
      const { data } = await api.post(`/products/admin/${id}/variants`, variantForm);
      toast.success('Variant ditambahkan');
      setVariants(prev => [...prev, data]);
      setVariantForm({ size: '', color: '', stock: 0, price: '' });
    }catch(e){ console.error('Failed add variant', e); toast.error('Gagal menambah variant'); }
  }

  const handleDeleteVariant = async (variantId) => {
    try{
      await api.delete(`/products/admin/variants/${variantId}`);
      setVariants(prev => prev.filter(v => v.id !== variantId));
      toast.success('Variant dihapus');
    }catch(e){ console.error('Failed delete variant', e); toast.error('Gagal hapus variant'); }
  }

  const confirmDelete = async ()=>{
    try{
      await api.delete(`/products/admin/${id}`);
      toast.success('Produk dihapus');
      navigate('/dashboard/products');
    }catch(err){ console.error(err); toast.error('Gagal hapus produk'); }
    finally{ setConfirmOpen(false); }
  }

  if (loading) return <div className='p-6'>Loading...</div>;
  if (!product) return <div className='p-6'>Product not found</div>;

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-4'>Detail Produk (Admin)</h2>
      <div className='bg-white p-4 rounded shadow'>
        <div className='gap-10 sm:flex p-5'>
          <div>
            <img src={getImageUrl(product.image_url) || '/image-product/3_1759572273959.jpeg'} alt={product.name} className='"w-full sm:max-w-md object-cover"' />
          </div>
          <form onSubmit={handleUpdate} className='md:col-span-2 space-y-3'>
            <div className='grid grid-cols-1 gap-3'>
              <div>
                <label htmlFor="admin-name" className="text-sm font-medium text-gray-700">Nama Produk</label>
                <input id="admin-name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder='Name' className='block w-full border px-3 py-2 rounded' />
              </div>
              <div>
                <label htmlFor="admin-price" className="text-sm font-medium text-gray-700">Harga</label>
                <input id="admin-price" type='number' value={form.price} onChange={e=>setForm({...form, price: e.target.value})} placeholder='Price' className='block w-full border px-3 py-2 rounded' />
                <div className='text-sm text-gray-500 mt-1'>Preview: {formatRupiah(form.price || 0)}</div>
              </div>
              <div>
                <label htmlFor="admin-stock" className="text-sm font-medium text-gray-700">Stok</label>
                <input id="admin-stock" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} placeholder='Stock' className='block w-full border px-3 py-2 rounded' />
              </div>
              <div>
                <label htmlFor="admin-desc" className="text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea id="admin-desc" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} placeholder='Description' className='block w-full border px-3 py-2 rounded' />
              </div>
              <div>
                <label htmlFor="admin-gender" className="text-sm font-medium text-gray-700">Gender</label>
                <select id="admin-gender" className="w-full border px-3 py-2 rounded" value={form.gender || ''} onChange={e=>setForm({...form, gender: e.target.value})}>
                  <option value="">(none)</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="admin-category" className="text-sm font-medium text-gray-700">Category</label>
                <select id="admin-category" className="w-full border px-3 py-2 rounded" value={form.categoryId || ''} onChange={e=>setForm({...form, categoryId: e.target.value})}>
                  <option value="">(no category)</option>
                  {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div className='flex items-center gap-3'>
                <input type='checkbox' checked={form.isActive} onChange={e=>setForm({...form, isActive: e.target.checked})} id='isActive' />
                <label htmlFor='isActive'>Active (visible di public)</label>
              </div>
              <div>
                <input type='file' onChange={e=>setFile(e.target.files[0])} />
              </div>
              <div className='flex gap-2'>
                <button className='px-3 py-1 bg-green-600 text-white rounded' type='submit'>Simpan Perubahan</button>
                <button type='button' onClick={handleDelete} className='px-3 py-1 bg-red-600 text-white rounded'>Hapus Produk</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className='bg-white p-4 rounded shadow mt-6'>
        <h3 className='font-semibold mb-3'>Variants (size / stock / price)</h3>
        <div className='space-y-2 mb-4'>
          {variants.map(v => (
            <div key={v.id} className='flex items-center justify-between border p-2 rounded'>
              <div>
                <div className='font-semibold'>{v.size} {v.color ? `- ${v.color}` : ''}</div>
                <div className='text-sm text-gray-600'>Stock: {v.stock} • Price: {formatRupiah(v.price)}</div>
              </div>
              <div className='flex gap-2'>
                <button onClick={() => handleDeleteVariant(v.id)} className='px-2 py-1 bg-red-600 text-white rounded'>Hapus</button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddVariant} className='grid grid-cols-1 md:grid-cols-4 gap-2'>
          <input placeholder='Size' value={variantForm.size} onChange={e=>setVariantForm({...variantForm, size: e.target.value})} className='border px-2 py-1 rounded' />
          <input placeholder='Color (opsional)' value={variantForm.color} onChange={e=>setVariantForm({...variantForm, color: e.target.value})} className='border px-2 py-1 rounded' />
          <input placeholder='Stock' type='number' value={variantForm.stock} onChange={e=>setVariantForm({...variantForm, stock: Number(e.target.value)})} className='border px-2 py-1 rounded' />
          <input placeholder='Price' type='number' value={variantForm.price} onChange={e=>setVariantForm({...variantForm, price: e.target.value})} className='border px-2 py-1 rounded' />
          <button className='px-3 py-1 bg-indigo-600 text-white rounded col-span-4 mt-2' type='submit'>Tambah Variant</button>
        </form>
      </div>
      <ConfirmModal isOpen={confirmOpen} title='Hapus Produk' message='Yakin ingin menghapus produk ini?' onCancel={()=>setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
