import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  syncCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);
router.post('/sync', protect, syncCart);
router.put('/shipping', protect, saveShippingAddress);
router.put('/payment', protect, savePaymentMethod);
router
  .route('/:productId')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

export default router;

