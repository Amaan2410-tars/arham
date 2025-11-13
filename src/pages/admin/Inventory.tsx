import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Download, Search, Camera, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  barcode?: string
  description?: string
  image_url?: string
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    barcode: '',
    description: '',
    image_url: '',
  })

  useEffect(() => {
    fetchProducts()
    return () => {
      if (codeReader.current) {
        codeReader.current.reset()
      }
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (error) throw error
      if (data) setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        barcode: formData.barcode || null,
        description: formData.description || null,
        image_url: formData.image_url || null,
      }

      if (editingProduct) {
        await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
      } else {
        await supabase.from('products').insert(productData)
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await supabase.from('products').delete().eq('id', id)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      barcode: product.barcode || '',
      description: product.description || '',
      image_url: product.image_url || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      barcode: '',
      description: '',
      image_url: '',
    })
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Category', 'Price', 'Stock', 'Barcode'].join(','),
      ...products.map(p => [p.name, p.category, p.price, p.stock, p.barcode || ''].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
  }

  const startBarcodeScanning = async () => {
    try {
      setShowBarcodeScanner(true)
      
      // Wait for video element to be ready
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (!videoRef.current) {
        alert('Video element not ready')
        setShowBarcodeScanner(false)
        return
      }

      // Configure scanner with barcode format hints for better detection
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.ITF,
        BarcodeFormat.CODABAR,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)
      hints.set(DecodeHintType.ASSUME_GS1, false)
      
      codeReader.current = new BrowserMultiFormatReader(hints)
      const devices = await codeReader.current.listVideoInputDevices()
      
      if (devices.length === 0) {
        alert('No camera found. Please ensure your device has a camera and grant camera permissions.')
        setShowBarcodeScanner(false)
        return
      }

      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )
      const deviceId = backCamera?.deviceId || devices[0].deviceId

      console.log('Starting barcode scanner with device:', deviceId)

      // Get the video stream with better quality settings for barcode scanning
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      codeReader.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText()
            console.log('✅ Barcode scanned successfully:', barcode)
            
            // Stop scanning first
            if (codeReader.current) {
              codeReader.current.reset()
            }
            
            // Stop video stream
            stream.getTracks().forEach(track => track.stop())
            
            // Update form data with scanned barcode
            setFormData(prev => ({ ...prev, barcode }))
            setShowBarcodeScanner(false)
          }
          
          if (error) {
            // NotFoundError is normal - it means no barcode found yet, keep scanning
            if (error.name === 'NotFoundException') {
              // This is expected - no barcode detected yet, keep scanning
              return
            }
            
            // Log other errors but don't stop scanning
            if (error.message && !error.message.includes('No MultiFormat Readers')) {
              console.warn('Scan error:', error.name, error.message)
            }
          }
        }
      )
    } catch (error: any) {
      console.error('Error starting scanner:', error)
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No camera found. Please ensure your device has a camera.')
      } else {
        alert('Error accessing camera: ' + (error.message || 'Unknown error'))
      }
      setShowBarcodeScanner(false)
    }
  }

  const stopBarcodeScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset()
      codeReader.current = null
    }
    // Stop all video tracks
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setShowBarcodeScanner(false)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Inventory Management</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button onClick={handleExport} className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null)
              resetForm()
              setShowModal(true)
            }}
            className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 p-1 touch-manipulation"
                      aria-label="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 p-1 touch-manipulation"
                      aria-label="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-semibold ml-1">₹{product.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                    <span className={`font-semibold ml-1 ${product.stock < 10 ? 'text-red-600' : ''}`}>
                      {product.stock}
                    </span>
                  </div>
                  {product.barcode && (
                    <div className="col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">Barcode:</span>
                      <span className="ml-1">{product.barcode}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block card overflow-hidden p-0">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Category</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Price</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Stock</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase hidden lg:table-cell">Barcode</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 lg:px-6 py-4 font-medium text-sm">{product.name}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm">{product.category}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm">₹{product.price}</td>
                      <td className={`px-4 lg:px-6 py-4 text-sm ${product.stock < 10 ? 'text-red-600 font-bold' : ''}`}>
                        {product.stock}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm hidden lg:table-cell">{product.barcode || '-'}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 touch-manipulation"
                            aria-label="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 touch-manipulation"
                            aria-label="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Barcode</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="flex-1 px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
                      placeholder="Enter or scan barcode"
                    />
                    <button
                      type="button"
                      onClick={showBarcodeScanner ? stopBarcodeScanning : startBarcodeScanning}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-medium flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base touch-manipulation ${
                        showBarcodeScanner
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-primary hover:bg-primary-dark text-white'
                      }`}
                      aria-label={showBarcodeScanner ? 'Stop scanning' : 'Scan barcode'}
                    >
                      <Camera size={18} />
                      <span className="hidden sm:inline">{showBarcodeScanner ? 'Stop' : 'Scan'}</span>
                    </button>
                  </div>
                  {showBarcodeScanner && (
                    <div className="mt-3 relative bg-black rounded-xl overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                        autoPlay
                        playsInline
                        muted
                        id="barcode-scanner-video"
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 border-2 border-primary rounded-xl" style={{
                          boxShadow: 'inset 0 0 0 2px rgba(37, 99, 235, 0.5)'
                        }} />
                        {/* Scanning indicator */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-32 h-1 bg-primary/30 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-pulse" style={{
                              width: '60%',
                              animation: 'scan 2s ease-in-out infinite'
                            }} />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={stopBarcodeScanning}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg touch-manipulation z-10"
                        aria-label="Stop scanning"
                      >
                        <X size={18} />
                      </button>
                      <div className="absolute bottom-2 left-0 right-0 text-center space-y-1">
                        <p className="bg-black/70 text-white px-3 py-1 rounded-lg text-xs">
                          Point camera at barcode - Keep steady and well-lit
                        </p>
                        <p className="bg-black/50 text-white/80 px-2 py-0.5 rounded text-xs">
                          EAN, UPC, Code128, Code39, QR
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    stopBarcodeScanning()
                    setShowModal(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                  className="btn-secondary text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm sm:text-base">
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

