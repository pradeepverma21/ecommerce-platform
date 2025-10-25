import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'

const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })

  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

  // Redirect if cart is empty (but not if order was just placed)
  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart')
    return null
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-8">
              You need to be logged in to complete your purchase. Please login or create a new account to continue.
            </p>
            
            {/* Cart Summary */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Your cart has:</p>
              <p className="text-2xl font-bold text-gray-800 mb-1">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xl font-semibold text-blue-600">
                Total: ₹{getCartTotal().toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Don't worry, your cart items are saved!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                state={{ from: '/checkout' }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Login to Continue
              </Link>
              <Link
                to="/register"
                state={{ from: '/checkout' }}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-6">
              <Link
                to="/cart"
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to Cart
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

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Prepare order data
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          image: item.images[0],
          price: item.discountPrice || item.price
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total
      }

      const data = await orderService.createOrder(orderData)

      // Mark order as placed before clearing cart
      setOrderPlaced(true)
      
      // Clear cart
      clearCart()
      
      // Redirect to order detail page
      navigate(`/orders/${data.order._id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Address</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      required
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="House no., Street, Area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Indore"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Madhya Pradesh"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={shippingAddress.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="452001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-800">Cash on Delivery</span>
                      <p className="text-sm text-gray-600">Pay when you receive the product</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={paymentMethod === 'Card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-800">Credit/Debit Card</span>
                      <p className="text-sm text-gray-600">Pay securely with your card</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-800">UPI</span>
                      <p className="text-sm text-gray-600">Pay via Google Pay, PhonePe, Paytm</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-800">
                        ₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
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
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout