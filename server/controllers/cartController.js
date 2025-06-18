import User from "../models/User.js"


//Update User cartData: /api/cart/update


export const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;  // get from middleware
        const { cartItems } = req.body;

        await User.findByIdAndUpdate(userId, { cartItems });

        res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
