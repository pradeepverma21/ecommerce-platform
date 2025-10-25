import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-md p-12">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Link
                to="/products"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const tax = subtotal * 0.18 // 18% GST
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + tax + shipping

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const displayPrice = item.discountPrice || item.price
              return (
                <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link to={`/products/${item._id}`} className="flex-shrink-0">
                      <img
                        src={item.images[0] || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <Link to={`/products/${item._id}`}>
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 mb-2">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">{item.category?.name}</p>
                      <p className="text-xl font-bold text-gray-800 mb-4">
                        ₹{displayPrice.toLocaleString()}
                        {item.discountPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{item.price.toLocaleString()}
                          </span>
                        )}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity >= item.stock && (
                        <p className="text-sm text-orange-600 mt-2">
                          Maximum quantity reached
                        </p>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">
                        ₹{(displayPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {subtotal < 500 && (
                  <p className="text-sm text-green-600">
                    Add ₹{(500 - subtotal).toFixed(2)} more for FREE shipping!
                  </p>
                )}
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart