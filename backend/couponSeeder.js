import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import Coupon from './models/couponModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedCoupons = async () => {
    try {
        await Coupon.deleteMany();

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

        console.log('Coupons Seeded!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

seedCoupons();
