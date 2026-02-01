import asyncHandler from '../middleware/asyncHandler.js';
import Coupon from '../models/couponModel.js';

// @desc    Get coupon by code
// @route   GET /api/coupons/:code
// @access  Private
const getCouponByCode = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true });

    if (coupon) {
        if (coupon.expiryDate < new Date()) {
            res.status(400);
            throw new Error('Coupon has expired');
        }
        res.json(coupon);
    } else {
        res.status(404);
        throw new Error('Invalid coupon code');
    }
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({});
    res.json(coupons);
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
    const { code, discount, isPercentage, expiryDate } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
        res.status(400);
        throw new Error('Coupon already exists');
    }

    const coupon = await Coupon.create({
        code,
        discount,
        isPercentage,
        expiryDate,
    });

    if (coupon) {
        res.status(201).json(coupon);
    } else {
        res.status(400);
        throw new Error('Invalid coupon data');
    }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        await Coupon.deleteOne({ _id: coupon._id });
        res.json({ message: 'Coupon removed' });
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

export { getCouponByCode, getCoupons, createCoupon, deleteCoupon };
