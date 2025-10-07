import { useContext } from 'react'
import { shopContext } from '../Context/ShopContext'
import { Link } from 'react-router-dom';
import { formatRupiah } from '../utils/formatRupiah';

const ProductItem = ({ id, price, image, name, variants = [] }) => {
    // show small size badges (first 3 sizes)
    const sizes = (variants || []).slice(0,3).map(v => v.size).filter(Boolean);
    return (
        <Link to={`/products/${id}`} className=''>
            <div className='bg-white rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 duration-300'>
                <div className='w-full h-80 overflow-hidden'>
                    <img
                        className='w-full h-full object-cover transition-transform duration-300 hover:scale-110'
                        src={image}
                        alt={name}
                    />
                </div>
                <div className='p-4'>
                    <h3 className='text-lg font-semibold text-gray-800 truncate'>{name}</h3>
                    <p className='text-sm text-gray-500 mt-1'>{formatRupiah(price)}</p>
                    {sizes.length > 0 && (
                        <div className='flex gap-2 mt-2'>
                            {sizes.map(s => <span key={s} className='text-xs px-2 py-1 bg-gray-100 rounded'>{s}</span>)}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductItem