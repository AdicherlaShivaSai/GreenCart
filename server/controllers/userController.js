import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Register a new user :api/user/register
export const register = async (req, res) => {
    try{
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Create a new user
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        // Optionally, you can send a cookie or token back to the client
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token,{
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: true, // Use secure cookies in production
            sameSite: 'None', // Helps prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration time (7 days)
        })

        return res.status(201).json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
            },
        })
        
    }catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Login user : /api/user/login

export const login = async(req, res)=>{
    try{
        const {email, password} = req.body;

        if(!email || !password)
            return res.json({
                success: false,
                message: 'Email and password are required'
            })
        
        const user = await User.findOne({email})

        if(!user){
            return res.json({
                success: false,
                message: 'Invalid Email or password'
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({
                success: false,
                message: "Invalid Email or password"
            })
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token,{
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: true, // Use secure cookies in production
            sameSite: 'None', // Helps prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration time (7 days)
        })

        return res.status(201).json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
            },
        })

    }catch(error){
        console.log(error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Chech Auth : /api/user/is-auth

export const isAuth = async (req, res) =>{
    try{
        // const {userId} = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId).select("-password")
        return res.json({success:true, user})
        
    }catch(error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//Logout User: /api/user/logout

export const logout = async(req, res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure: true,
            sameSite: 'None',
        })
        return res.json({success: true, message: "Logged Out"})
    }catch(error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}
