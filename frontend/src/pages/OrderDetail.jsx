import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import orderService from '../services/orderService'
import { useAuth } from '../context/AuthContext'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id)
        setOrder(data.order)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id, isAuthenticated, navigate])

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    setCancelling(true)
    try {
      const data = await orderService.cancelOrder(id)
      setOrder(data.order)
      alert('Order cancelled successfully')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-purple-100 text-purple-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link to="/orders" className="text-blue-600 hover:underline">
            View My Orders
          </Link>
        </div>
      </div>
    )
  }

  const canCancel = order.status !== 'Delivered' && order.status !== 'Cancelled'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Success Message for new orders */}
        {new Date() - new Date(order.createdAt) < 60000 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg">Order Placed Successfully!</h3>
                <p className="text-sm">Thank you for your order. We'll send you updates via email.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Details</h1>
            <p className="text-gray-600">Order ID: #{order._id}</p>
            <p className="text-sm text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <Link
                        to={`/products/${item.product}`}
                        className="font-semibold text-gray-800 hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
              <div className="text-gray-700">
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p className="mt-2">{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                    {order.isPaid ? 'Paid' : 'Not Paid'}
                  </span>
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid At:</span>
                    <span className="text-gray-800">
                      {new Date(order.paidAt).toLocaleString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items Price:</span>
                  <span>₹{order.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>₹{order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total:</span>
                  <span>₹{order.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Status */}
              {order.isDelivered ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-semibold">✓ Delivered</p>
                  <p className="text-sm text-green-700">
                    {new Date(order.deliveredAt).toLocaleString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
              ) : order.status === 'Cancelled' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold">✗ Order Cancelled</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-semibold">📦 In Progress</p>
                  <p className="text-sm text-blue-700">Your order is being processed</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View All Orders
                </Link>
                
                {canCancel && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-semibold hover:bg-red-200 transition disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}

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
    </div>
  )
}

export default OrderDetail