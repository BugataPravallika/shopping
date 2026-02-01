import express from 'express';
const router = express.Router();
import {
    getCouponByCode,
    getCoupons,
    createCoupon,
    deleteCoupon,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/:code').get(protect, getCouponByCode);
router.route('/id/:id').delete(protect, admin, deleteCoupon);

export default router;
