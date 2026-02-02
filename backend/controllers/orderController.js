import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Coupon from '../models/couponModel.js';
import { calcPrices } from '../utils/calcPrices.js';
import { verifyPayPalPayment, checkIfNewTransaction } from '../utils/paypal.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, coupon } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // get the ordered items from our database
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    // Validate stock availability and map order items
    const dbOrderItems = [];
    for (const itemFromClient of orderItems) {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );

      if (!matchingItemFromDB) {
        res.status(404);
        throw new Error(`Product ${itemFromClient._id} not found`);
      }

      // Check stock availability
      if (matchingItemFromDB.countInStock < itemFromClient.qty) {
        res.status(400);
        throw new Error(
          `Insufficient stock for ${matchingItemFromDB.name}. Only ${matchingItemFromDB.countInStock} available.`
        );
      }

      dbOrderItems.push({
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        _id: undefined,
      });
    }

    // SERVER-SIDE COUPON VALIDATION
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (coupon) {
      const dbCoupon = await Coupon.findOne({
        code: coupon.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (dbCoupon) {
        const subtotal = dbOrderItems.reduce(
          (acc, item) => acc + (item.price * 100 * item.qty) / 100,
          0
        );

        if (dbCoupon.isPercentage) {
          discountAmount = (subtotal * dbCoupon.discount) / 100;
        } else {
          discountAmount = dbCoupon.discount;
        }
        appliedCouponCode = dbCoupon.code;
        console.log(`🎟️ Coupon Applied: ${appliedCouponCode} | Discount: ${discountAmount} | Subtotal: ${subtotal}`);
      } else {
        console.log(`❌ Invalid or Expired Coupon: ${coupon}`);
      }
    }

    // calculate prices with server-calculated discount
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems, discountAmount);

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      coupon: appliedCouponCode,
      discount: discountAmount,
    });

    const createdOrder = await order.save();

    // Reduce stock for each product
    for (const item of dbOrderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        await product.save();
      }
    }

    // For COD orders, mark as paid immediately (payment on delivery)
    if (paymentMethod === 'Cash on Delivery' || paymentMethod === 'COD') {
      createdOrder.isPaid = true;
      createdOrder.paidAt = Date.now();
      await createdOrder.save();
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // If payment method is COD, it's already marked as paid during order creation
  if (order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'COD') {
    return res.json(order);
  }

  // For PayPal payments, verify the payment
  // NOTE: here we need to verify the payment was made to PayPal before marking
  // the order as paid
  const { verified, value } = await verifyPayPalPayment(req.body.id);
  if (!verified) throw new Error('Payment not verified');

  // check if this transaction has been used before
  const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
  if (!isNewTransaction) throw new Error('Transaction has been used before');

  // check the correct amount was paid
  const paidCorrectAmount = order.totalPrice.toString() === value;
  if (!paidCorrectAmount) throw new Error('Incorrect amount paid');

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address,
  };

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// @desc    Update order to paid (Admin manual)
// @route   PUT /api/orders/:id/payadmin
// @access  Private/Admin
const updateOrderToPaidAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: 'MANUAL_' + Date.now(),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: order.user?.email || 'admin@example.com',
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Cancel an order (and restore stock)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.isDelivered) {
      res.status(400);
      throw new Error('Cannot cancel a delivered order');
    }

    // Restore stock for each product
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock += item.qty;
        await product.save();
      }
    }

    order.isCancelled = true; // Note: Need to add this to model if not exists
    await order.save();
    res.json({ message: 'Order cancelled and stock restored' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get order summary (Analytics)
// @route   GET /api/orders/summary
// @access  Private/Admin
const getOrderSummary = asyncHandler(async (req, res) => {
  // Aggregate 1: Total Sales, Revenue, Average Order Value
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        numOrders: { $sum: 1 },
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);

  // Aggregate 2: Sales by Month (last 30 days daily)
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Aggregate 3: Sales by Category
  const categorySales = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $group: {
        _id: '$productDetails.category',
        sales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
      },
    },
  ]);

  res.send({
    orders: orders[0] || { numOrders: 0, totalSales: 0 },
    dailySales,
    categorySales,
  });
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToPaidAdmin,
  updateOrderToDelivered,
  getOrders,
  getOrderSummary,
  cancelOrder,
};
