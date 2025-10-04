import React, { useContext } from 'react';
import Title from '../Components/Title';
import { shopContext } from '../Context/ShopContext';
import formatRupiah from '../utils/formatRupiah';

const TotalCart = () => {

    const { currency ,get_TotalCart,delivery_fee} = useContext(shopContext);
    return (
        <div className='flex'>
            <div className='flex flex-col'>
                    <Title text1={'Total '} text2={'Cart'} />
                        <div className='flex justify-between'>
                            <b>SubTotal</b>
                            <b>{currency} {formatRupiah(get_TotalCart())}</b>
                        </div>

                        <div className='flex justify-between'>
                            <p>Shipping Fee</p>
                            <b>{currency} {formatRupiah(delivery_fee)}</b>
                        </div>

                        <div className='flex justify-between'>
                            <b>Total</b>
                            <b>{currency} {formatRupiah(get_TotalCart()+delivery_fee)}</b>
                        </div>

            </div>
        </div>
    )
}

export default TotalCart
