import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  LogOut,
  TrendingUp,
  AlertCircle,
  CreditCard
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
      // Total Sales
      const { data: salesData } = await supabase
        .from('orders')
        .select('total')
      const totalSales = salesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      // Orders Today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Low Stock
      const { data: products } = await supabase
        .from('products')
        .select('stock')
      const lowStockCount = products?.filter(p => (p.stock || 0) < 10).length || 0

      setStats({
        totalSales,
        ordersToday: ordersCount || 0,
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
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 glass border-r border-white/20 dark:border-gray-700/20 z-40">
        <div className="p-6">
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
      <div className="ml-64 p-8">
        <Routes>
          <Route
            path="dashboard"
            element={
              <div>
                <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Total Sales</p>
                        <p className="text-3xl font-bold text-primary">₹{stats.totalSales.toFixed(2)}</p>
                      </div>
                      <div className="p-4 bg-primary/10 rounded-full">
                        <TrendingUp className="text-primary" size={32} />
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
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Orders Today</p>
                        <p className="text-3xl font-bold text-primary">{stats.ordersToday}</p>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded-full">
                        <ShoppingCart className="text-blue-500" size={32} />
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
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Low Stock Alerts</p>
                        <p className="text-3xl font-bold text-red-600">{stats.lowStockCount}</p>
                      </div>
                      <div className="p-4 bg-red-500/10 rounded-full">
                        <AlertCircle className="text-red-500" size={32} />
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

