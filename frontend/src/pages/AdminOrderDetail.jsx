import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import orderService from '../services/orderService'
import { useAuth } from '../context/AuthContext'

const AdminOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
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
  }, [id, isAdmin, navigate])

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true)
    try {
      const data = await orderService.updateOrderStatus(id, newStatus)
      setOrder(data.order)
      alert('Order status updated successfully')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
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
          <Link to="/admin/orders" className="text-blue-600 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link to="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Order #{order._id}</h1>
              <p className="text-sm text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name:</p>
                  <p className="font-semibold text-gray-800">{order.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email:</p>
                  <p className="font-semibold text-gray-800">{order.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
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
                      <p className="font-semibold text-gray-800">{item.name}</p>
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Update Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Update Order Status</h2>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updatingStatus || order.status === 'Cancelled'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {updatingStatus && (
                <p className="text-sm text-blue-600 mt-2">Updating status...</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3">
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
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
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

            {/* Delivery Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Status</h2>
              {order.isDelivered ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✓ Delivered</p>
                  <p className="text-sm text-green-700">
                    {new Date(order.deliveredAt).toLocaleString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-semibold">📦 In Progress</p>
                  <p className="text-sm text-blue-700">Order is being processed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail