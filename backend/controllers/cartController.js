import asyncHandler from '../middleware/asyncHandler.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import { calcPrices } from '../utils/calcPrices.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'cartItems.product',
    'name image price countInStock'
  );

  if (!cart) {
    // Create empty cart if doesn't exist
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [],
    });
  }

  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check stock availability
  if (product.countInStock < qty) {
    res.status(400);
    throw new Error(`Only ${product.countInStock} items available in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [],
    });
  }

  // Check if item already exists in cart
  const existingItem = cart.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    // Update quantity
    existingItem.qty = qty;
  } else {
    // Add new item
    cart.cartItems.push({
      product: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      qty,
    });
  }

  // Calculate prices
  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(
    cart.cartItems
  );

  // Convert string prices to numbers for database storage
  cart.itemsPrice = Number(itemsPrice);
  cart.taxPrice = Number(taxPrice);
  cart.shippingPrice = Number(shippingPrice);
  cart.totalPrice = Number(totalPrice);

  await cart.save();

  // Populate product details
  await cart.populate('cartItems.product', 'name image price countInStock');

  res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.cartItems = cart.cartItems.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  // Recalculate prices
  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(
    cart.cartItems
  );

  cart.itemsPrice = itemsPrice;
  cart.taxPrice = taxPrice;
  cart.shippingPrice = shippingPrice;
  cart.totalPrice = totalPrice;

  await cart.save();

  await cart.populate('cartItems.product', 'name image price countInStock');

  res.json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.cartItems.find(
    (item) => item.product.toString() === req.params.productId
  );

  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  // Check stock availability
  const product = await Product.findById(req.params.productId);
  if (product.countInStock < qty) {
    res.status(400);
    throw new Error(`Only ${product.countInStock} items available in stock`);
  }

  item.qty = qty;

  // Recalculate prices
  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(
    cart.cartItems
  );

  cart.itemsPrice = itemsPrice;
  cart.taxPrice = taxPrice;
  cart.shippingPrice = shippingPrice;
  cart.totalPrice = totalPrice;

  await cart.save();

  await cart.populate('cartItems.product', 'name image price countInStock');

  res.json(cart);
});

// @desc    Save shipping address to cart
// @route   PUT /api/cart/shipping
// @access  Private
const saveShippingAddress = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.shippingAddress = req.body;
  await cart.save();

  res.json(cart);
});

// @desc    Save payment method to cart
// @route   PUT /api/cart/payment
// @access  Private
const savePaymentMethod = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.paymentMethod = req.body.paymentMethod;
  await cart.save();

  res.json(cart);
});

// @desc    Clear cart (after order placement)
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.cartItems = [];
    cart.itemsPrice = 0;
    cart.taxPrice = 0;
    cart.shippingPrice = 0;
    cart.totalPrice = 0;
    cart.shippingAddress = {};
    cart.paymentMethod = 'PayPal';
    await cart.save();
  }

  res.json({ message: 'Cart cleared' });
});

// @desc    Sync cart from localStorage (on login)
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    // If no items to sync, just return current cart
    return getCart(req, res);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [],
    });
  }

  // Merge localStorage cart with MongoDB cart
  for (const item of cartItems) {
    const product = await Product.findById(item._id);
    if (!product) continue;

    const existingItem = cart.cartItems.find(
      (cartItem) => cartItem.product.toString() === item._id
    );

    if (existingItem) {
      // Use the higher quantity
      existingItem.qty = Math.max(existingItem.qty, item.qty || 1);
    } else {
      cart.cartItems.push({
        product: item._id,
        name: product.name,
        image: product.image,
        price: product.price,
        qty: item.qty || 1,
      });
    }
  }

  // Recalculate prices
  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(
    cart.cartItems
  );

  cart.itemsPrice = itemsPrice;
  cart.taxPrice = taxPrice;
  cart.shippingPrice = shippingPrice;
  cart.totalPrice = totalPrice;

  await cart.save();

  await cart.populate('cartItems.product', 'name image price countInStock');

  res.json(cart);
});

export {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  syncCart,
};

