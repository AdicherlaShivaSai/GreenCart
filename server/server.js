import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config'; // Load environment variables from .env file
import userRouter from './routes/userRoute.js'; // Import user routes
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';


const app = express();
const PORT = process.env.PORT || 4000;

await connectDB(); // Connect to MongoDB
await connectCloudinary();

// Define allowed origins for CORS
const allowedOrigins = ['https://greencart-1-0zt6.onrender.com'];

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)


// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/user', userRouter); // Use the user router for user-related routes
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});