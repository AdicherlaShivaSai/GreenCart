import { response } from "express";
import Order from "../models/Orders.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import stripe from 'stripe';
import User from "../models/User.js"

const FRONTEND_URL = 'https://greencart-1-0zt6.onrender.com';



// Place Order COD :/api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user.id; // string
    const { items, address } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    // Calculate amount using products
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Product not found");
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02); // Add 2% tax

    // ✅ Fix: Ensure userId is stored as ObjectId
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: 'Order Placed Successfully', order });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Place Order Stripe: /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { items, address } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    let amount = 0;
    let productData = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Product not found");

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });

      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // Add tax

    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      items,
      amount,
      address,
      paymentType: "Online",
    });

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: item.name },
        unit_amount: Math.floor(item.price * 100)
      },
      quantity: item.quantity
    }));

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${FRONTEND_URL}/my-orders`,
      cancel_url: `${FRONTEND_URL}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      }
    });

    return res.json({ success: true, url: session.url });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


//Stripe webhooks to verify payments action: /stripe
export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // ✅ Handle payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // ✅ You need to get the session using this payment intent
    const sessions = await stripeInstance.checkout.sessions.list({
      payment_intent: paymentIntent.id,
    });

    if (sessions.data.length > 0) {
      const session = sessions.data[0];
      const { orderId, userId } = session.metadata;

      try {
        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        await User.findByIdAndUpdate(userId, { cartItems: {} });
        console.log('✅ Order updated & cart cleared.');
      } catch (err) {
        console.error('DB update error:', err);
      }
    } else {
      console.error('No session found for payment_intent:', paymentIntent.id);
    }
  } else {
    console.log(`⚠️ Unhandled event type: ${event.type}`);
  }

  response.json({ received: true });
};



// Get Orders for current user
export const getUserOrders = async (req, res) => {
  try {
    let userId = req.user.id;

    // Ensure ObjectId type
    if (typeof userId === 'string') {
      userId = new mongoose.Types.ObjectId(userId);
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
    .populate('items.product')
    .populate('address')
    .sort({ createdAt: -1 });

    res.json({ success: true, orders });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// Get All Orders (admin / seller)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate('items.product').populate('address').sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
