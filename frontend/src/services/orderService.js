import api from './api';

const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order to paid
  updateOrderToPaid: async (id, paymentResult) => {
    const response = await api.put(`/orders/${id}/pay`, paymentResult);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Admin: Get all orders
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders?${queryString}`);
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  }
};

export default orderService;