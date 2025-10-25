import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'

const AdminOrders = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(null)

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  })

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }

    fetchOrders()
  }, [isAdmin, navigate, pagination.page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getAllOrders({ page: pagination.page, limit: 10 })
      setOrders(data.orders)
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(orderId)
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      // Refresh orders
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingStatus(null)
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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Manage Orders</h1>
            <p className="text-gray-600 mt-2">Total Orders: {pagination.total}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-600">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="text-sm font-mono text-gray-800">
                          #{order._id.slice(-8)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-800">{order.user?.name}</p>
                          <p className="text-sm text-gray-600">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {order.orderItems.length} item(s)
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-800">
                          ₹{order.totalPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm text-gray-800">{order.paymentMethod}</p>
                          <span className={`text-xs ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                            {order.isPaid ? '✓ Paid' : '○ Not Paid'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingStatus === order._id || order.status === 'Cancelled'}
                          className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${getStatusColor(order.status)} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {updatingStatus === order._id && (
                          <p className="text-xs text-blue-600 mt-1">Updating...</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOrders