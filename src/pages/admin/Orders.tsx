import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, Search, CheckCircle, XCircle, CreditCard, AlertCircle, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Order {
  id: string
  customer_name: string
  phone: string
  address: string
  total: number
  items: any[]
  payment_mode: string
  payment_received?: boolean
  payment_status?: 'pending' | 'received' | 'due'
  payment_received_at?: string
  created_at: string
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaymentReceived = async (order: Order) => {
    if (!confirm(`Mark payment as RECEIVED (Online) for ${order.customer_name}?\n\nAmount: ₹${order.total.toFixed(2)}`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'received',
          payment_received: true,
          payment_received_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (error) throw error

      alert('Payment marked as received (Online)!')
      fetchOrders()
    } catch (error: any) {
      console.error('Error marking payment:', error)
      alert(`Error: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDeleteOrder = async (order: Order) => {
    if (order.payment_status !== 'received') {
      alert('Only orders marked as received can be deleted.')
      return
    }

    if (!confirm(`Delete order ${order.id.slice(0, 8)}...? This cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase.from('orders').delete().eq('id', order.id)
      if (error) throw error
      alert('Order deleted.')
      setSelectedOrder(prev => (prev?.id === order.id ? null : prev))
      fetchOrders()
    } catch (error: any) {
      console.error('Error deleting order:', error)
      alert(`Error deleting order: ${error.message || 'Unknown error'}`)
    }
  }

  const handleMarkPaymentDue = async (order: Order) => {
    if (!confirm(`Mark payment as DUE (Customer owes) for ${order.customer_name}?\n\nAmount: ₹${order.total.toFixed(2)}`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'due',
          payment_received: false,
          payment_received_at: null
        })
        .eq('id', order.id)

      if (error) throw error

      alert('Payment marked as due (Customer owes)!')
      fetchOrders()
    } catch (error: any) {
      console.error('Error marking payment as due:', error)
      alert(`Error: ${error.message || 'Unknown error'}`)
    }
  }

  const handleMarkPaymentPending = async (order: Order) => {
    if (!confirm(`Mark payment as PENDING for ${order.customer_name}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'pending',
          payment_received: false,
          payment_received_at: null
        })
        .eq('id', order.id)

      if (error) throw error

      alert('Payment marked as pending!')
      fetchOrders()
    } catch (error: any) {
      console.error('Error updating payment status:', error)
      alert(`Error: ${error.message || 'Unknown error'}`)
    }
  }

  const filteredOrders = orders.filter(order =>
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.phone.includes(searchQuery) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Orders</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Payment Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">₹{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                        {order.payment_mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.payment_status === 'received' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <CheckCircle size={12} />
                          Received
                        </span>
                      ) : order.payment_status === 'due' ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <AlertCircle size={12} />
                          Due
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <XCircle size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {order.payment_status !== 'received' && (
                          <button
                            onClick={() => handleMarkPaymentReceived(order)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Mark Payment Received (Online)"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {order.payment_status !== 'due' && (
                          <button
                            onClick={() => handleMarkPaymentDue(order)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Mark Payment Due (Customer Owes)"
                          >
                            <CreditCard size={18} />
                          </button>
                        )}
                        {order.payment_status !== 'pending' && (
                          <button
                            onClick={() => handleMarkPaymentPending(order)}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Mark Payment Pending"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {order.payment_status === 'received' && (
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete order (received only)"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Order Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p>Name: {selectedOrder.customer_name}</p>
                <p>Phone: {selectedOrder.phone}</p>
                <p>Address: {selectedOrder.address}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₹{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment Mode: <span className="font-medium">{selectedOrder.payment_mode}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status:</span>
                    {selectedOrder.payment_status === 'received' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle size={14} />
                        Received
                      </span>
                    ) : selectedOrder.payment_status === 'due' ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <AlertCircle size={14} />
                        Due
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <XCircle size={14} />
                        Pending
                      </span>
                    )}
                  </div>
                  {selectedOrder.payment_received_at && (
                    <p className="text-xs text-gray-500">
                      Received on: {new Date(selectedOrder.payment_received_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  <div className="flex flex-col gap-2 mt-4">
                    {selectedOrder.payment_status !== 'received' && (
                      <button
                        onClick={() => {
                          handleMarkPaymentReceived(selectedOrder)
                          setSelectedOrder(null)
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        <span>Mark Payment Received (Online)</span>
                      </button>
                    )}
                    {selectedOrder.payment_status !== 'due' && (
                      <button
                        onClick={() => {
                          handleMarkPaymentDue(selectedOrder)
                          setSelectedOrder(null)
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2"
                      >
                        <CreditCard size={18} />
                        <span>Mark Payment Due (Customer Owes)</span>
                      </button>
                    )}
                    {selectedOrder.payment_status !== 'pending' && (
                      <button
                        onClick={() => {
                          handleMarkPaymentPending(selectedOrder)
                          setSelectedOrder(null)
                        }}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        <span>Mark Payment Pending</span>
                      </button>
                    )}
                    {selectedOrder.payment_status === 'received' && (
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        <span>Delete Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="btn-secondary mt-6 w-full"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

