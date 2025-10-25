import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import productService from '../services/productService'

const AdminProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const isEditMode = Boolean(id)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: '',
    stock: '',
    images: [''],
    isFeatured: false,
    tags: ''
  })

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }

    fetchCategories()

    if (isEditMode) {
      fetchProduct()
    }
  }, [isAdmin, navigate, id, isEditMode])

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories()
      setCategories(data.categories)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const data = await productService.getProduct(id)
      const product = data.product
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || '',
        category: product.category._id,
        brand: product.brand || '',
        stock: product.stock,
        images: product.images.length > 0 ? product.images : [''],
        isFeatured: product.isFeatured,
        tags: product.tags?.join(', ') || ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const removeImageField = (index) => {
    if (formData.images.length === 1) return
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Prepare data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img.trim() !== ''),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      }

      if (isEditMode) {
        await productService.updateProduct(id, productData)
        alert('Product updated successfully!')
      } else {
        await productService.createProduct(productData)
        alert('Product created successfully!')
      }

      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/products" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>

            {/* Price & Discount */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Price (₹)
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  min="0"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Category & Brand */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (URLs) *
              </label>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      required={index === 0}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  + Add Another Image
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Use image URLs from Unsplash, or other image hosting services
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="wireless, bluetooth, audio"
              />
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700">
                Mark as Featured Product
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
              </button>
              <Link
                to="/admin/products"
                className="flex-1 bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProductForm