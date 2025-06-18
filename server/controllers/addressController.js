
import Address from "../models/Address.js"

// Add Address:/api/address/add


export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;  // ✅ get from auth middleware
        const newAddress = new Address({
            ...req.body.address,
            userId: userId
        });

        await newAddress.save();

        res.json({ success: true, message: 'Address added successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}



//Get address: /api/address/get
export const getAddress = async(req, res)=>{
    try{
        const userId = req.user.id  // ✅ use id from auth middleware
        const addresses = await Address.find({userId})
        res.json({success:true, addresses})
    }catch(error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}
