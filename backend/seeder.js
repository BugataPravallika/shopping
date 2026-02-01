import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import Coupon from './models/couponModel.js';
import connectDB from './config/db.js';

dotenv.config();

// connectDB(); // Removed top-level call


const importData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();

    // Seed Coupons
    const coupons = [
      {
        code: 'SDE2026',
        discount: 500,
        isPercentage: false,
        expiryDate: new Date('2026-12-31'),
      },
      {
        code: 'WELCOME10',
        discount: 10,
        isPercentage: true,
        expiryDate: new Date('2026-12-31'),
      },
      {
        code: 'ANTIGRAVITY',
        discount: 99,
        isPercentage: true,
        expiryDate: new Date('2026-12-31'),
      },
    ];
    await Coupon.insertMany(coupons);
    console.log('Coupons Imported!'.blue.inverse);

    const createdUsers = await User.insertMany(users);

    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    // Insert products one by one to avoid Mongoose parallelLimit issues
    for (const product of sampleProducts) {
      if (!product.name) console.log('Invalid product:', product);
      await Product.create(product);
    }

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
