import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import productService from '../services/productService'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const data = await productService.getProduct(id)
        setProduct(data.product)
      } catch (err) {
        setError('Failed to load product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const handleBuyNow = () => {
    addToCart(product, quantity)
    navigate('/cart')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setReviewLoading(true)
    try {
      await productService.addReview(id, reviewData)
      // Refresh product data
      const data = await productService.getProduct(id)
      setProduct(data.product)
      setShowReviewForm(false)
      setReviewData({ rating: 5, comment: '' })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add review')
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link to="/products" className="text-blue-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const displayPrice = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[selectedImage] || 'https://via.placeholder.com/500'}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              
              {/* Category & Brand */}
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {product.category?.name}
                </span>
                {product.brand && (
                  <span className="text-gray-600">Brand: {product.brand}</span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.floor(product.ratings) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  {product.ratings} ({product.numReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-gray-800">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              {product.stock > 0 ? (
                <p className="text-green-600 font-medium mb-4">
                  ✓ In Stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-red-600 font-medium mb-4">✗ Out of Stock</p>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isInCart(product._id)}
                  className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isInCart(product._id) ? '✓ In Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-gray-600">{key}</dt>
                        <dd className="text-gray-800">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
            {isAuthenticated && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review._id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{review.name}</p>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail