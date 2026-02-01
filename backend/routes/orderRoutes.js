import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToPaidAdmin,
  updateOrderToDelivered,
  getOrders,
  getOrderSummary,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/summary').get(protect, admin, getOrderSummary);
router.route('/mine').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/payadmin').put(protect, admin, updateOrderToPaidAdmin);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/cancel').put(protect, cancelOrder);

export default router;
