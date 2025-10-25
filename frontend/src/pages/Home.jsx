import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import productService from '../services/productService'
import ProductCard from '../components/products/ProductCard'

const Home = () => {
  const { user, isAuthenticated } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getCategories()
        ])
        setFeaturedProducts(productsData.products)
        setCategories(categoriesData.categories)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to ShopHub
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Discover amazing products at unbeatable prices
            </p>
            {isAuthenticated ? (
              <div>
                <p className="text-2xl mb-6">Hello, {user?.name}! 👋</p>
                <Link
                  to="/products"
                  className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Shop by Category
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group"
                >
                  <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-all hover:scale-105">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={category.image || 'https://via.placeholder.com/150'}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-12">No featured products available</p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Get your orders delivered quickly to your doorstep with our express shipping
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Secure Payment
              </h3>
              <p className="text-gray-600">
                Safe and secure payment options for complete peace of mind
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Quality Products
              </h3>
              <p className="text-gray-600">
                Only the best products from trusted sellers and brands
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.5%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Browse our collection of amazing products and find exactly what you need
          </p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
          >
            View All Products
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home