const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [200, 'Product name cannot be more than 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative']
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: null
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category']
    },
    images: [
      {
        type: String
      }
    ],
    brand: {
      type: String,
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'Sold quantity cannot be negative']
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
      type: Number,
      default: 0
    },
    reviews: [reviewSchema],
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    specifications: {
      type: Map,
      of: String
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Create index for search optimization
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isFeatured: 1, createdAt: -1 });

// Generate slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate average rating
productSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.ratings = 0;
    this.numReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings = (totalRating / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);