import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import orderService from '../services/orderService'
import { useAuth } from '../context/AuthContext'

const Orders = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders()
        setOrders(data.orders)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, navigate])

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
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Orders</h1>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Order ID: #{order._id}</p>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-4">
                    {order.orderItems.map((item) => (
                      <div key={item._id} className="flex gap-4">
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
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600">
                          Total: <span className="text-2xl font-bold text-gray-800">₹{order.totalPrice.toLocaleString()}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Payment: {order.paymentMethod} • {order.isPaid ? 'Paid' : 'Not Paid'}
                        </p>
                      </div>
                      <Link
                        to={`/orders/${order._id}`}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders