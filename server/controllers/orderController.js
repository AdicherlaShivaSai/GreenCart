import { response } from "express";
import Order from "../models/Orders.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import stripe from 'stripe';
import User from "../models/User.js"

const FRONTEND_URL = 'https://green-cart-sandy.vercel.app/';



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
    const userId = req.user.id; // string
    const { items, address } = req.body;

    const {origin} = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    let productData = [];

    // Calculate amount using products
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      })
      // if (!product) throw new Error("Product not found");
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02); // Add 2% tax

    // ✅ Fix: Ensure userId is stored as ObjectId
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      items,
      amount,
      address,
      paymentType: "Online",
    });

    //Stripe gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    //create Line items for stripe

    const line_items = productData.map((item)=>{
      return {
        price_data:{
          currency: 'inr',
          product_data:{
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100
        },
        quantity: item.quantity,
      }
    })

    //create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${FRONTEND_URL}/loader?next=my-orders`,
      cancel_url: `${FRONTEND_URL}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      }
    })

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


//Stripe webhooks to verify payments action: /stripe
export const stripeWebhooks = async (request, response)=>{
  //Stripe gateway
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers['stripe-signature']
  let event;
  try{
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  }catch(error){
    response.status(400).send(`Webhook Error: ${error.message}`)
  }
  //handle the event
  switch(event.type){
    case "payment_intent.succeeded":{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      //getting sessiom metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntent,

      })

      const {orderId, userId} = session.data[0].metadata;

      //Mark Payment as paid
      await Order.findByIdAndUpdate(orderId, {isPaid: true})

      //Clear user cart
      await User.findByIdAndUpdate(userId,{cartItems: {}})
      break;
    }
    case "payment_intent.failed":{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      //getting sessiom metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntent,

      })

      const {orderId} = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default:
      console.error(`Unhandled event type ${event.type}`)
      break;
  }
  response.json({received: true});
}


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
