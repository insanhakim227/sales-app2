import React, { useContext, useState } from 'react'
import { shopContext } from '../Context/ShopContext'
import formatRupiah from '../utils/formatRupiah';
import ConfirmModal from './ConfirmModal';
import { useNavigate } from 'react-router-dom';

const CartProduct = ({ countProduct, Size1, Image1, Name1, Price1, ID, variantId, checked, onToggleChecked }) => {
    const { updateQuantity } = useContext(shopContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const sizeLabel = Size1 && Size1 !== 'default' ? Size1 : 'default';
    const priceToShow = Price1 || 0;
    const subtotal = priceToShow * countProduct;

    return (
        <div className='flex justify-between gap-6 mt-5 items-center py-3 border-b'>

                <div className='flex gap-4 items-start'>
                                        <input aria-label={`Pilih ${Name1}`} type='checkbox' checked={!!checked} onChange={() => onToggleChecked && onToggleChecked(ID, sizeLabel)} className='mt-2' />
                                        <button aria-label={`Lihat ${Name1}`} onClick={() => navigate(`/products/${ID}`, { state: { fromCart: true, variantId: variantId, itemSize: sizeLabel } })} className='p-0 border-0 bg-transparent'>
                                            <img className='w-20 h-20 object-cover rounded-lg' src={Image1} alt={Name1} />
                                        </button>

                <div className='flex flex-col gap-1'>
                    <p className='font-semibold'>{Name1}</p>
                    <div className='flex gap-4 items-center text-sm text-gray-600'>
                        <span className='font-bold'>{formatRupiah(priceToShow)}</span>
                        <span className='px-2 py-0.5 bg-gray-100 rounded text-xs'>{sizeLabel}</span>
                    </div>
                    <div className='text-sm text-gray-500'>Subtotal: {formatRupiah(subtotal)}</div>
                </div>
            </div>

            <div className='flex items-center gap-3'>
                <button
                    onClick={() => updateQuantity(ID, sizeLabel, Math.max(0, countProduct - 1))}
                    className={`px-3 py-1 rounded ${countProduct <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                    disabled={countProduct <= 1}
                    aria-label={`Kurangi jumlah ${Name1}`}
                >
                    -
                </button>
                <div className='px-4 py-1 border rounded'>{countProduct}</div>
                <button
                    onClick={() => updateQuantity(ID, sizeLabel, countProduct + 1)}
                    className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
                    aria-label={`Tambah jumlah ${Name1}`}
                >
                    +
                </button>

                <div className='cursor-pointer ml-4'>
                    <button aria-label={`Hapus ${Name1} dari keranjang`} onClick={() => setShowConfirm(true)} className='p-1 text-red-500'>
                        {/* lightweight trash icon fallback */}
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>
            </div>

            <ConfirmModal isOpen={showConfirm} title='Hapus Item' message='Yakin ingin menghapus produk ini dari keranjang?' onCancel={() => setShowConfirm(false)} onConfirm={() => { updateQuantity(ID, sizeLabel, 0); setShowConfirm(false); }} />

        </div>
    )
}

export default CartProduct
