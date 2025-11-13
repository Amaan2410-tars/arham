import { useState, useEffect } from 'react'
import { Trash2, Download, Search, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import { generateInvoicePDF } from '../../utils/invoice'

interface POSSale {
  id: string
  customer_name: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  total: number
  payment_received?: boolean
  payment_received_at?: string
  created_at: string
}

export default function Sales() {
  const [sales, setSales] = useState<POSSale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchSales()
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchSales()
    }
  }, [startDate, endDate])

  const fetchSales = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('pos_sales')
        .select('*')
        .order('created_at', { ascending: false })

      if (startDate && endDate) {
        query = query
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59')
      }

      const { data, error } = await query

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
      alert('Error loading sales. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, customerName: string, total: number) => {
    if (!confirm(`Are you sure you want to delete this sale?\n\nCustomer: ${customerName}\nTotal: ₹${total.toFixed(2)}\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('pos_sales')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('Sale deleted successfully')
      fetchSales()
    } catch (error: any) {
      console.error('Error deleting sale:', error)
      alert(`Error deleting sale: ${error.message || 'Unknown error'}`)
    }
  }

  const handleMarkPaymentReceived = async (sale: POSSale) => {
    if (!confirm(`Mark payment as received for ${sale.customer_name}?\n\nAmount: ₹${sale.total.toFixed(2)}`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('pos_sales')
        .update({
          payment_received: true,
          payment_received_at: new Date().toISOString()
        })
        .eq('id', sale.id)

      if (error) throw error

      alert('Payment marked as received!')
      fetchSales()
    } catch (error: any) {
      console.error('Error marking payment:', error)
      alert(`Error: ${error.message || 'Unknown error'}`)
    }
  }

  const handleMarkPaymentPending = async (sale: POSSale) => {
    if (!confirm(`Mark payment as pending for ${sale.customer_name}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('pos_sales')
        .update({
          payment_received: false,
          payment_received_at: null
        })
        .eq('id', sale.id)

      if (error) throw error

      alert('Payment marked as pending!')
      fetchSales()
    } catch (error: any) {
      console.error('Error updating payment status:', error)
      alert(`Error: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDownloadInvoice = (sale: POSSale) => {
    try {
      const invoiceNo = `POS-${new Date(sale.created_at).getTime()}`
      const subtotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const gst = subtotal * 0.18
      
      const pdfBlob = generateInvoicePDF({
        invoiceNo,
        orderId: sale.id,
        customerName: sale.customer_name,
        phone: '',
        address: '',
        items: sale.items,
        subtotal,
        gst,
        total: sale.total,
        paymentMode: 'Cash',
      })

      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNo}.pdf`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('Error generating invoice PDF')
    }
  }

  const filteredSales = sales.filter(sale =>
    sale.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">POS Sales</h1>
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-primary">
          <span>Total: ₹{totalSales.toFixed(2)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by customer or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No sales found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold">Items</th>
                  <th className="text-right py-3 px-4 font-semibold">Total</th>
                  <th className="text-center py-3 px-4 font-semibold">Payment</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <motion.tr
                    key={sale.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-sm">
                      {new Date(sale.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium">{sale.customer_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {sale.items.length} item(s)
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-primary">
                      ₹{sale.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        {sale.payment_received ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle size={14} />
                            Received
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                            <XCircle size={14} />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {!sale.payment_received ? (
                          <button
                            onClick={() => handleMarkPaymentReceived(sale)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Mark Payment Received"
                          >
                            <CheckCircle size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPaymentPending(sale)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Mark Payment Pending"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadInvoice(sale)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Download Invoice"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id, sale.customer_name, sale.total)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Sale"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredSales.map((sale) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{sale.customer_name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">₹{sale.total.toFixed(2)}</p>
                    {sale.payment_received ? (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                        <CheckCircle size={12} />
                        Paid
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                        <XCircle size={12} />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {sale.items.length} item(s)
                </p>
                {sale.payment_received_at && (
                  <p className="text-xs text-gray-500 mb-2">
                    Paid on: {new Date(sale.payment_received_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                <div className="flex gap-2">
                  {!sale.payment_received ? (
                    <button
                      onClick={() => handleMarkPaymentReceived(sale)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle size={16} />
                      <span>Mark Paid</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkPaymentPending(sale)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm"
                    >
                      <XCircle size={16} />
                      <span>Mark Pending</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadInvoice(sale)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <Download size={16} />
                    <span>Invoice</span>
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id, sale.customer_name, sale.total)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

