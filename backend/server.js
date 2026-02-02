import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cors = require('cors');
dotenv.config();
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import users from './data/users.js';
import products from './data/products.js';
import coupons from './data/coupons.js';
import Coupon from './models/couponModel.js';
import Order from './models/orderModel.js';

const port = process.env.PORT || 5000;

// Seed database in production if no users exist
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const couponCount = await Coupon.countDocuments();
    const forceSeed = process.env.FORCE_SEED === 'true';

    if (userCount === 0 || productCount === 0 || forceSeed) {
      console.log('🔄 Seeding database (Products & Users)...'.yellow);
      await Order.deleteMany();
      await User.deleteMany();
      await Product.deleteMany();

      const createdUsers = await User.insertMany(users);
      const adminUser = createdUsers[0]._id;

      const sampleProducts = products.map((product) => {
        return { ...product, user: adminUser };
      });

      await Product.insertMany(sampleProducts);
      console.log('✅ Products & Users seeded successfully!'.green);
    }

    if (couponCount === 0 || forceSeed) {
      console.log('🎟️ Seeding database (Coupons)...'.yellow);
      await Coupon.deleteMany();
      await Coupon.insertMany(coupons);
      console.log('✅ Coupons seeded successfully!'.green);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    const pCount = await Product.countDocuments();
    const uCount = await User.countDocuments();
    console.log(`>>> DB Connected. Products: ${pCount}, Users: ${uCount}`);

    // Check and seed database if empty (safe for production cold starts)
    await seedDatabase();

    const app = express();

    // Configure CORS - Allow all origins for debugging during deployment
    app.use(cors({
      origin: true, // Allow all origins
      credentials: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use('/api/products', productRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/wishlist', wishlistRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/coupons', couponRoutes);

    app.get('/api/config/paypal', (req, res) =>
      res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
    );

    if (process.env.NODE_ENV === 'production') {
      const __dirname = path.resolve();
      app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
      app.use(express.static(path.join(__dirname, '/frontend/build')));

      app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
      );
    } else {
      const __dirname = path.resolve();
      app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
      app.get('/', (req, res) => {
        res.send('API is running...');
      });
    }

    app.use(notFound);
    app.use(errorHandler);

    app.listen(port, () =>
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
    );
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
