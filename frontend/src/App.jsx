import { Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Home from './pages/Home'
import Products from './pages/Products'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import ProductDetail from './pages/ProductDetail'
import Categories from './pages/Categories'
import Footer from './components/common/Footer'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import AdminDashboard from './pages/AdminDashboard'
import AdminOrders from './pages/AdminOrders'
import AdminOrderDetail from './pages/AdminOrderDetail'
import AdminProducts from './pages/AdminProducts'
import AdminProductForm from './pages/AdminProductForm'
import Profile from './pages/Profile'
import AdminCategories from './pages/AdminCategories'

   
// function App() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <main>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/products" element={<Products />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/products/:id" element={<ProductDetail />} />
//           <Route path="/categories" element={<Categories />} />
//           {/* More routes will be added later */}
//         </Routes>
//       </main>
//     </div>
//   )
// }

function App() {
     return (
       <div className="min-h-screen bg-gray-50 flex flex-col">
         <Header />
         <main className="flex-grow">
           <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/add" element={<AdminProductForm />} />
            <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/profile" element={<Profile />} />




            {/* More routes will be added later */}
           </Routes>
         </main>
         <Footer />
       </div>
     )
   }

export default App