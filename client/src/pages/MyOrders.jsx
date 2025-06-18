import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const MyOrders = () => {
  const { axios, user } = useAppContext();
  const [myOrders, setMyOrders] = useState([]);
  const currency = '₹';

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('https://greencart-mk3l.onrender.com/api/order/user');
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  return (
    <div className='mt-16 pb-16'>
      <div className='flex flex-col items-end w-max mb-8'>
        <p className='text-2xl font-medium uppercase'>My Orders</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>

      {myOrders.length === 0 && (
        <p className='text-center text-gray-400'>No orders found.</p>
      )}

      {myOrders.map((order, index) => (
        <div className='border border-gray-300 rounded-lg p-4 py-5 mb-10 max-w-4xl' key={index}>
          <p className='flex justify-baseline md:items-center text-gray-400 md:font-medium max-md:flex-col'>
            <span>OrderID: {order._id}</span>
            <span>Payment: {order.paymentType}</span>
            <span>Total Amount: {currency}{order.amount}</span>
          </p>

          {order.items.map((item, itemIndex) => {
            const product = item.product;
            return (
              <div
                className={`relative bg-white text-gray-500/70 ${
                  order.items.length !== itemIndex + 1 && 'border-b'
                } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}
                key={itemIndex}
              >
                <div className='flex items-center mb-4 md:mb-0'>
                  <div className='bg-primary/10 p-4 rounded-lg'>
                    <img
                      src={product?.image?.[0] || '/placeholder.png'}
                      alt={product?.name || 'Product Image'}
                      className='w-16 h-16 object-cover'
                    />
                  </div>
                  <div className='ml-4'>
                    <h2 className='text-xl font-medium text-gray-800'>
                      {product?.name || 'Unknown Product'}
                    </h2>
                    <p>Category: {product?.category || 'N/A'}</p>
                  </div>
                </div>

                <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                  <p>Quantity: {item.quantity || '1'}</p>
                  <p>Status: {order.status}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <p className='text-primary font-medium text-lg'>
                  Amount: {currency}
                  {product ? product.offerPrice * (item.quantity || 1) : 0}
                </p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
