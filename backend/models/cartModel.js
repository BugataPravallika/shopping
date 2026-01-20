import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    default: 1,
  },
});

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true, // One cart per user
    },
    cartItems: [cartItemSchema],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    paymentMethod: {
      type: String,
      default: 'PayPal',
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster user cart lookup
cartSchema.index({ user: 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;

