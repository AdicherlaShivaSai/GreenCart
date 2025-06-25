# 🛒 GreenCart – Full Stack E-Commerce Web Application

**Live Demo:** [GreenCart on Render](https://greencart-1-0zt6.onrender.com)

GreenCart is a fully functional MERN stack (MongoDB, Express.js, React.js, Node.js) e-commerce web application that enables users to browse products, manage a shopping cart, add delivery addresses, and complete secure purchases. Sellers can log in to manage product listings and view incoming orders. The app is built with a focus on clean UI, responsive design, RESTful API integration, and cloud deployment.

---

## 🚀 Tech Stack

- **Frontend:** React.js, React Router, Axios, Tailwind CSS (or CSS Modules)
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT, Cookie-based sessions
- **Payments:** Stripe API
- **Media Uploads:** Cloudinary
- **Deployment:** Render (Frontend & Backend)

---

## 🔑 Features

### 👥 User Features
- User registration and login (JWT + cookie-based auth)
- Browse categorized product listings
- View product details
- Add to cart and update quantity
- Add/manage delivery addresses
- Place orders with Stripe integration
- View order history

### 🛍️ Seller Features
- Seller authentication
- Add, update, delete products
- Upload product images via Cloudinary
- View and manage orders

### ⚙️ System Features
- RESTful API integration
- MongoDB-based schema design with Mongoose
- Responsive UI for mobile and desktop
- Git & GitHub version control
- Render deployment with CORS and environment variable configuration

---

## 📦 Deployment

- **Frontend & Backend** both hosted on [Render](https://render.com)
- Environment variables managed securely via Render dashboard
- MongoDB Atlas used for remote database
- CORS configured for client-server communication

---

## 📁 Folder Structure

```bash
client/         # React frontend
server/         # Node.js backend
.env            # Environment variables (not committed)
