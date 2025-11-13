import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'

interface Backorder {
  id: string
  product_name: string
  category: string
  quantity_ordered: number
  supplier: string
  expected_date: string
  status: 'pending' | 'ordered' | 'received'
  notes: string
  created_at: string
  updated_at: string
}

export default function Backorders() {
  const [backorders, setBackorders] = useState<Backorder[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBackorder, setEditingBackorder] = useState<Backorder | null>(null)
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    quantity_ordered: '',
    supplier: '',
    expected_date: '',
    status: 'pending' as 'pending' | 'ordered' | 'received',
    notes: '',
  })

  useEffect(() => {
    fetchBackorders()
    checkLowStockProducts()
  }, [])

  // Check for products with 0 stock and auto-create backorders
  const checkLowStockProducts = async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('stock', 0)

      if (products && products.length > 0) {
        for (const product of products) {
          // Check if backorder already exists for this product
          const { data: existing } = await supabase
            .from('backorders')
            .select('*')
            .eq('product_name', product.name)
            .eq('status', 'pending')
            .single()

          if (!existing) {
            // Auto-create backorder for out-of-stock product
            await supabase.from('backorders').insert({
              product_name: product.name,
              category: product.category,
              quantity_ordered: 10, // Default quantity
              supplier: '',
              expected_date: '',
              status: 'pending',
              notes: 'Auto-created: Product out of stock',
            })
          }
        }
        fetchBackorders() // Refresh list
      }
    } catch (error) {
      console.error('Error checking low stock:', error)
    }
  }

  const fetchBackorders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('backorders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBackorders(data || [])
    } catch (error) {
      console.error('Error fetching backorders:', error)
      alert('Error loading backorders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_name.trim()) {
      alert('Please enter a product name')
      return
    }

    try {
      const backorderData = {
        product_name: formData.product_name.trim(),
        category: formData.category.trim(),
        quantity_ordered: parseInt(formData.quantity_ordered) || 0,
        supplier: formData.supplier.trim(),
        expected_date: formData.expected_date || null,
        status: formData.status,
        notes: formData.notes.trim() || null,
      }

      if (editingBackorder) {
        const { error } = await supabase
          .from('backorders')
          .update(backorderData)
          .eq('id', editingBackorder.id)

        if (error) throw error
        alert('Backorder updated successfully!')
      } else {
        const { error } = await supabase
          .from('backorders')
          .insert(backorderData)

        if (error) throw error
        alert('Backorder added successfully!')
      }

      setShowModal(false)
      setEditingBackorder(null)
      resetForm()
      fetchBackorders()
    } catch (error: any) {
      console.error('Error saving backorder:', error)
      alert(`Error saving backorder: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this backorder?')) return

    try {
      const { error } = await supabase
        .from('backorders')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Backorder deleted successfully')
      fetchBackorders()
    } catch (error: any) {
      console.error('Error deleting backorder:', error)
      alert(`Error deleting backorder: ${error.message || 'Unknown error'}`)
    }
  }

  const handleMarkReceived = async (backorder: Backorder) => {
    if (!confirm(`Mark "${backorder.product_name}" as received?\n\nThis will update the product inventory.`)) {
      return
    }

    try {
      // Update backorder status
      await supabase
        .from('backorders')
        .update({ status: 'received' })
        .eq('id', backorder.id)

      // Update product stock in inventory
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('name', backorder.product_name)
        .single()

      if (product) {
        await supabase
          .from('products')
          .update({ stock: (product.stock || 0) + backorder.quantity_ordered })
          .eq('id', product.id)
      }

      alert('Backorder marked as received and inventory updated!')
      fetchBackorders()
    } catch (error: any) {
      console.error('Error marking as received:', error)
      alert(`Error: ${error.message || 'Unknown error'}`)
    }
  }

  const handleEdit = (backorder: Backorder) => {
    setEditingBackorder(backorder)
    setFormData({
      product_name: backorder.product_name,
      category: backorder.category,
      quantity_ordered: backorder.quantity_ordered.toString(),
      supplier: backorder.supplier,
      expected_date: backorder.expected_date ? backorder.expected_date.split('T')[0] : '',
      status: backorder.status,
      notes: backorder.notes || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      product_name: '',
      category: '',
      quantity_ordered: '',
      supplier: '',
      expected_date: '',
      status: 'pending',
      notes: '',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'ordered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'received':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Backorders</h1>
        <button
          onClick={() => {
            resetForm()
            setEditingBackorder(null)
            setShowModal(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Backorder</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : backorders.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg mb-2">No backorders</p>
          <p className="text-gray-400 text-sm">Backorders are automatically created when products go out of stock</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {backorders.map((backorder) => (
            <motion.div
              key={backorder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{backorder.product_name}</h3>
                  <p className="text-sm text-gray-500">{backorder.category}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(backorder.status)}`}>
                  {backorder.status}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                  <span className="font-semibold">{backorder.quantity_ordered}</span>
                </div>
                {backorder.supplier && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Supplier:</span>
                    <span>{backorder.supplier}</span>
                  </div>
                )}
                {backorder.expected_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expected:</span>
                    <span>{new Date(backorder.expected_date).toLocaleDateString()}</span>
                  </div>
                )}
                {backorder.notes && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Notes: </span>
                    <span>{backorder.notes}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {backorder.status !== 'received' && (
                  <button
                    onClick={() => handleMarkReceived(backorder)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle size={16} />
                    <span>Mark Received</span>
                  </button>
                )}
                <button
                  onClick={() => handleEdit(backorder)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(backorder.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editingBackorder ? 'Edit Backorder' : 'Add Backorder'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Quantity to Order *</label>
                <input
                  type="number"
                  value={formData.quantity_ordered}
                  onChange={(e) => setFormData({ ...formData, quantity_ordered: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Expected Date</label>
                <input
                  type="date"
                  value={formData.expected_date}
                  onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="pending">Pending</option>
                  <option value="ordered">Ordered</option>
                  <option value="received">Received</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingBackorder(null)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBackorder ? 'Update' : 'Add'} Backorder
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

