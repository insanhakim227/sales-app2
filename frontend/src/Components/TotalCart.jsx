import React, { useContext } from 'react';
import Title from '../Components/Title';
import { shopContext } from '../Context/ShopContext';
import formatRupiah from '../utils/formatRupiah';

const TotalCart = ({ cartArray = [], selectedItems = {} }) => {

    const { get_TotalCart,delivery_fee, products } = useContext(shopContext);
        const { cartItems } = useContext(shopContext);

    // if selectedItems provided and at least one item is checked, compute subtotal only for those
    let subtotal = 0;
    const hasSelected = selectedItems && Object.values(selectedItems).some(v => v === true);
    if (cartArray && hasSelected) {
        cartArray.forEach(item => {
            const key = `${item.id}::${item.size}`;
            if (selectedItems[key]) {
                const prod = products.find(p => p.id == item.id);
                    const stored = cartItems[item.id] && cartItems[item.id][item.size];
                    const variantPrice = stored ? stored.variantPrice : null;
                    const price = (variantPrice !== null && typeof variantPrice !== 'undefined') ? Number(variantPrice) : (prod ? Number(prod.price || 0) : 0);
                    subtotal += price * (item.quantity || 0);
            }
        });
    } else {
        subtotal = get_TotalCart();
    }

    return (
        <div className='flex'>
            <div className='flex flex-col bg-white p-4 rounded shadow'>
                    <Title text1={'Total '} text2={'Cart'} />
                        <div className='flex justify-between py-1'>
                            <b>SubTotal</b>
                            <b>{formatRupiah(subtotal)}</b>
                        </div>

                        <div className='flex justify-between py-1'>
                            <p>Shipping Fee</p>
                            <b>{formatRupiah(delivery_fee)}</b>
                        </div>

                        <div className='flex justify-between py-1'>
                            <b>Total</b>
                            <b>{formatRupiah(subtotal+delivery_fee)}</b>
                        </div>

            </div>
        </div>
    )
}

export default TotalCart
