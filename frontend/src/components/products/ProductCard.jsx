import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(product)
  }

  const displayPrice = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <Link to={`/products/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-200 h-64">
          <img
            src={product.images[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
            </div>
          )}
          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              ⭐ Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-sm text-gray-500 mb-1">{product.category?.name}</p>

          {/* Product Name */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(product.ratings) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({product.numReviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-gray-800">
                ₹{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          {product.stock > 0 ? (
            <p className="text-sm text-green-600 mb-3">
              ✓ In Stock ({product.stock} available)
            </p>
          ) : (
            <p className="text-sm text-red-600 mb-3">✗ Out of Stock</p>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isInCart(product._id)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isInCart(product._id) ? '✓ In Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard