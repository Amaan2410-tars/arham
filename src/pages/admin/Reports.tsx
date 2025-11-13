import { useState, useEffect } from 'react'
import { Download, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Reports() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      generateReport()
    }
  }, [startDate, endDate])

  const generateReport = async () => {
    try {
      // Fetch both orders and POS sales
      const [ordersResult, posSalesResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59')
          .order('created_at', { ascending: false }),
        supabase
          .from('pos_sales')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59')
          .order('created_at', { ascending: false })
      ])

      if (ordersResult.error) throw ordersResult.error
      if (posSalesResult.error) throw posSalesResult.error

      const orders = ordersResult.data || []
      const posSales = posSalesResult.data || []

      // Combine sales data
      const allSales = [
        ...orders.map((o: any) => ({ ...o, type: 'Online', payment_mode: o.payment_mode || 'COD' })),
        ...posSales.map((p: any) => ({ ...p, type: 'POS', payment_mode: 'Cash' }))
      ]

      const totalSales = allSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
      const totalOrders = allSales.length
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

      // Group by payment mode
      const paymentBreakdown: Record<string, number> = {}
      allSales.forEach(sale => {
        const mode = sale.payment_mode || 'Unknown'
        paymentBreakdown[mode] = (paymentBreakdown[mode] || 0) + 1
      })

      // Group by type (Online vs POS)
      const typeBreakdown: Record<string, number> = {}
      allSales.forEach(sale => {
        const type = sale.type || 'Unknown'
        typeBreakdown[type] = (typeBreakdown[type] || 0) + 1
      })

      setReportData({
        totalSales,
        totalOrders,
        avgOrderValue,
        paymentBreakdown,
        typeBreakdown,
        orders: allSales,
      })
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    }
  }

  const handleExport = () => {
    if (!reportData) return

    const csv = [
      ['Type', 'Sale ID', 'Customer', 'Phone', 'Total', 'Payment Mode', 'Date'].join(','),
      ...reportData.orders.map((sale: any) => [
        sale.type || 'Online',
        sale.id.substring(0, 8),
        sale.customer_name,
        sale.phone || 'N/A',
        sale.total,
        sale.payment_mode || 'Cash',
        new Date(sale.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${startDate}-to-${endDate}.csv`
    a.click()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Reports</h1>
        {reportData && (
          <button onClick={handleExport} className="btn-primary flex items-center space-x-2">
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-6">Date Range</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-gray-600 dark:text-gray-400 mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-primary">₹{reportData.totalSales.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-600 dark:text-gray-400 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-primary">{reportData.totalOrders}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-600 dark:text-gray-400 mb-2">Average Order Value</h3>
            <p className="text-3xl font-bold text-primary">₹{reportData.avgOrderValue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {reportData && (
        <>
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-6">Sales Type Breakdown</h2>
            <div className="space-y-2">
              {Object.entries(reportData.typeBreakdown || {}).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">{type}</span>
                  <span className="text-primary font-bold">{count} sales</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Payment Mode Breakdown</h2>
            <div className="space-y-2">
              {Object.entries(reportData.paymentBreakdown).map(([mode, count]: [string, any]) => (
                <div key={mode} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">{mode}</span>
                  <span className="text-primary font-bold">{count} orders</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

