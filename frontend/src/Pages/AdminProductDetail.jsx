import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/getImageUrl';
import { toast } from 'react-toastify';
import ConfirmModal from '../Components/ConfirmModal';

export default function AdminProductDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', isActive: false });
  const [file, setFile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(()=>{
    fetchProduct();
  },[id]);

  const fetchProduct = async ()=>{
    try{
      const { data } = await api.get(`/products/admin/${id}`);
      setProduct(data);
      setForm({ name: data.name || '', price: data.price || '', stock: data.stock || '', description: data.description || '', isActive: data.isActive });
    }catch(err){
      console.error(err);
      toast.error('Gagal ambil produk');
      navigate('/dashboard/products');
    }finally{ setLoading(false); }
  }

  const handleUpdate = async (e)=>{
    e.preventDefault();
    try{
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description || '');
      formData.append('price', form.price || 0);
      formData.append('stock', form.stock || 0);
      formData.append('isActive', form.isActive ? 'true' : 'false');
      if (file) formData.append('image', file);
      const { data } = await api.patch(`/products/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Produk diperbarui');
      navigate('/dashboard/products');
  }catch(err){ console.error(err); toast.error('Gagal update produk'); }
  }

  const handleDelete = async ()=>{
    setConfirmOpen(true);
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
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <img src={getImageUrl(product.image_url) || '/image-product/3_1759572273959.jpeg'} alt={product.name} className='w-full h-64 object-cover' />
          </div>
          <form onSubmit={handleUpdate} className='md:col-span-2'>
            <div className='grid grid-cols-1 gap-3'>
              <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder='Name' className='input-field' />
              <input value={form.price} onChange={e=>setForm({...form, price: e.target.value})} placeholder='Price' className='input-field' />
              <input value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} placeholder='Stock' className='input-field' />
              <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} placeholder='Description' className='input-field' />
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
      <ConfirmModal isOpen={confirmOpen} title='Hapus Produk' message='Yakin ingin menghapus produk ini?' onCancel={()=>setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
