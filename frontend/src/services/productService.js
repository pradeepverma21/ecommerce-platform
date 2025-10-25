import api from './api';

const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${queryString}`);
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // Admin: Create product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Admin: Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Admin: Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }
};

export default productService;