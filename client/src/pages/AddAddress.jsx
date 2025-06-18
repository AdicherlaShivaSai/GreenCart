import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'


//input for adding a new address
const InputField = ({type, placeholder, name, handleChange, address})=>(
    <input className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
        type={type} 
        placeholder={placeholder}
        name={name}
        onChange={handleChange}
        value={address[name] || ''}
        required
        autoComplete='off'
    />
)


const AddAddress = () => {

    const {axios, navigate, user} = useAppContext()

    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        phone: '',
        email: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value,
        }));
    }

    const onSubmitHandler = async(e) => {
        e.preventDefault();

        if (!address) {
            toast.error("Address cannot be empty");
            return;
        }

        try {
            const { data } = await axios.post('/api/address/add', { address });
            toast.success(data.message);
            navigate('/cart');
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Something went wrong");
        }
    }

    useEffect(() => {
        if (user === null) {
            navigate('/cart');
        }
    }, [user]);


return (
    <div className='mt-16 pb-16'>
      <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping <span
      className='font-semibold text-primary'>Address</span></p>
      <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
            <div className='flex-1 max-w-md'>
                <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>

                    <div className='grid grid-cols-2 gap-2'>
                        <InputField handleChange={handleChange} address={address} 
                            name='firstName' type='text' placeholder='First Name' 
                        />
                        <InputField handleChange={handleChange} address={address} 
                            name='lastName' type='text' placeholder='Last Name' 
                        />
                    </div>
                    <InputField handleChange={handleChange} address={address} 
                        name='email' type='email' placeholder='Email Address'/>
                    <InputField handleChange={handleChange} address={address} 
                        name='street' type='text' placeholder='Street Address'/>

                    <div className='grid grid-cols-2 gap-4'>
                        <InputField handleChange={handleChange} address={address} 
                            name='city' type='text' placeholder='City'/>
                        <InputField handleChange={handleChange} address={address} 
                            name='state' type='text' placeholder='State'/>
                    </div>
                    
                    <div className='grid grid-cols-2 gap-4'>
                        <InputField handleChange={handleChange} address={address} 
                            name='zipcode' type='number' placeholder='ZipCode'/>
                        <InputField handleChange={handleChange} address={address} 
                            name='country' type='text' placeholder='Country'/>
                    </div>

                    <InputField handleChange={handleChange} address={address}
                        name='phone' type='tel' placeholder='Phone Number'/>

                    <button className='w-full mt-6 bg-primary hover:bg-primary-dull transition text-white py-3 rounded cursor-pointer uppercase font-medium'>
                        Save Address
                    </button>

                </form>
            </div>
            <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt="Add Address" />
      </div>
    </div>
  )

}
export default AddAddress;
