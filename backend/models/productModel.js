import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      unique: true, // Prevent actual duplicates
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      enum: ['New', 'Trending', 'Limited Stock', 'None'],
      default: 'None',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
// Text index for product name search
productSchema.index({ name: 'text' });
// Indexes for filtering and sorting
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 }); // Descending for top-rated products
productSchema.index({ numReviews: -1 }); // For popularity sorting
// Compound index for category + price queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isFeatured: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
