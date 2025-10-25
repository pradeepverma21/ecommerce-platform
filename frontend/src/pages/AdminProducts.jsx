import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import productService from '../services/productService'

const AdminProducts = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'newest'
  })

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

    fetchCategories()
  }, [isAdmin, navigate])

  useEffect(() => {
    fetchProducts()
  }, [filters, pagination.page])

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories()
      setCategories(data.categories)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: 12,
        ...filters
      }
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key]
      })

      const data = await productService.getProducts(params)
      setProducts(data.products)
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    setDeleting(id)
    try {
      await productService.deleteProduct(id)
      fetchProducts()
      alert('Product deleted successfully')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
            <h1 className="text-4xl font-bold text-gray-800">Manage Products</h1>
            <p className="text-gray-600 mt-2">Total Products: {pagination.total}</p>
          </div>
          <Link
            to="/admin/products/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Product
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-600 mb-4">No products found</p>
            <Link
              to="/admin/products/add"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isFeatured && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        ⭐ Featured
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">{product.category?.name}</p>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-gray-800">
                          ₹{(product.discountPrice || product.price).toLocaleString()}
                        </span>
                        {product.discountPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        disabled={deleting === product._id}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
                      >
                        {deleting === product._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
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
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminProducts