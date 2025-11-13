import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  LogOut,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Menu,
  X
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Inventory from './Inventory'
import Orders from './Orders'
import Reports from './Reports'
import POS from './POS'
import Invoices from './Invoices'

export default function AdminDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersToday: 0,
    lowStockCount: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Total Sales - include both orders and POS sales
      const [ordersData, posSalesData] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('pos_sales').select('total')
      ])
      
      const ordersTotal = ordersData.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
      const posSalesTotal = posSalesData.data?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
      const totalSales = ordersTotal + posSalesTotal

      // Orders Today - include both orders and POS sales
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const [ordersCount, posSalesCount] = await Promise.all([
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
        supabase
          .from('pos_sales')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
      ])
      
      const ordersToday = (ordersCount.count || 0) + (posSalesCount.count || 0)

      // Low Stock
      const { data: products } = await supabase
        .from('products')
        .select('stock')
      const lowStockCount = products?.filter(p => (p.stock || 0) < 10).length || 0

      setStats({
        totalSales,
        ordersToday,
        lowStockCount,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/inventory', label: 'Inventory', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/pos', label: 'POS System', icon: CreditCard },
    { path: '/admin/invoices', label: 'Invoices', icon: FileText },
    { path: '/admin/reports', label: 'Reports', icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg glass"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
              />
            )}
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 glass border-r border-white/20 dark:border-gray-700/20 z-40 lg:static lg:translate-x-0"
            >
              <div className="p-4 sm:p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    Admin Panel
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
                <button
                  onClick={handleLogout}
                  className="mt-6 sm:mt-8 w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm sm:text-base"
                >
                  <LogOut size={18} className="flex-shrink-0" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (always visible on large screens) */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 glass border-r border-white/20 dark:border-gray-700/20 z-40">
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-8">
            Admin Panel
          </h2>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <Routes>
          <Route
            path="dashboard"
            element={
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm sm:text-base">Total Sales</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary truncate">₹{stats.totalSales.toFixed(2)}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-primary/10 rounded-full flex-shrink-0 ml-2">
                        <TrendingUp className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm sm:text-base">Orders Today</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">{stats.ordersToday}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-blue-500/10 rounded-full flex-shrink-0 ml-2">
                        <ShoppingCart className="text-blue-500 w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm sm:text-base">Low Stock Alerts</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{stats.lowStockCount}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-red-500/10 rounded-full flex-shrink-0 ml-2">
                        <AlertCircle className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            }
          />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="pos" element={<POS />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  )
}

