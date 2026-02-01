import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discount: {
            type: Number,
            required: true,
            default: 0,
        },
        isPercentage: {
            type: Boolean,
            required: true,
            default: false,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
