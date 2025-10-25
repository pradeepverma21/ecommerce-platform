const Product = require('../models/Product');

/**
 * @desc    Get all products with filters, search, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search by name, description, or tags
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Featured products filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Sort options
    let sortOption = {};
    switch (req.query.sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { ratings: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      images,
      brand,
      stock,
      specifications,
      tags,
      isFeatured
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      category,
      images,
      brand,
      stock,
      specifications,
      tags,
      isFeatured
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

/**
 * @desc    Add product review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);

    // Calculate new rating
    product.calculateRating();

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      product
    });
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Featured Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getFeaturedProducts
};