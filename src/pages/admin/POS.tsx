import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Minus, Trash2, Camera, X, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { BrowserMultiFormatReader } from '@zxing/library'
import confetti from 'canvas-confetti'
import { generateInvoicePDF } from '../../utils/invoice'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  stock: number
}

export default function POS() {
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)

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
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('name')
      if (data) setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const startScanning = async () => {
    if (!videoRef.current) return

    setShowScanner(true)

    try {
      codeReader.current = new BrowserMultiFormatReader()
      const devices = await codeReader.current.listVideoInputDevices()
      
      if (devices.length === 0) {
        alert('No camera found')
        setShowScanner(false)
        return
      }

      await codeReader.current.decodeFromVideoDevice(
        devices[0].deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleBarcodeScanned(result.getText())
            stopScanning()
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Scan error:', error)
          }
        }
      )
    } catch (error) {
      console.error('Error starting scanner:', error)
      alert('Error accessing camera')
      setShowScanner(false)
    }
  }

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset()
    }
    setShowScanner(false)
  }

  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode)
    if (product) {
      addToCart(product)
    } else {
      alert('Product not found')
    }
  }

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id))
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    )
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const gst = subtotal * 0.18
  const total = subtotal + gst

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }

    try {
      // Save POS sale
      const { data: saleData, error: saleError } = await supabase
        .from('pos_sales')
        .insert({
          customer_name: customerName || 'Walk-in Customer',
          items: cart,
          total: total,
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Generate invoice
      const invoiceNo = `POS-${Date.now()}`
      const pdfBlob = await generateInvoicePDF({
        invoiceNo,
        orderId: saleData.id,
        customerName: customerName || 'Walk-in Customer',
        phone: '',
        address: '',
        items: cart,
        subtotal,
        gst,
        total,
        paymentMode: 'Cash',
      })

      // Upload PDF
      const fileName = `invoices/${invoiceNo}.pdf`
      await supabase.storage
        .from('invoices')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf' })

      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(fileName)

      await supabase.from('invoices').insert({
        order_id: saleData.id,
        invoice_no: invoiceNo,
        pdf_url: urlData.publicUrl,
      })

      // Update stock
      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id)
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Clear cart
      setCart([])
      setCustomerName('')
      fetchProducts()

      alert('Sale completed successfully!')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error processing sale')
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode?.includes(searchQuery)
  )

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">POS System</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Panel */}
          <div className="lg:col-span-2">
            <div className="card mb-4">
              <div className="flex space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search or scan barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg"
                  />
                </div>
                <button
                  onClick={showScanner ? stopScanning : startScanning}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 ${
                    showScanner
                      ? 'bg-red-500 text-white'
                      : 'bg-primary text-white'
                  }`}
                >
                  <Camera size={20} />
                  <span>{showScanner ? 'Stop' : 'Scan'}</span>
                </button>
              </div>

              {showScanner && (
                <div className="relative mb-4">
                  <video
                    ref={videoRef}
                    className="w-full rounded-xl"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                  />
                  <button
                    onClick={stopScanning}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-left hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <h3 className="font-semibold mb-1 text-sm">{product.name}</h3>
                    <p className="text-primary font-bold">₹{product.price}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {product.stock}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-2xl font-bold mb-4">Cart</h2>

              <div className="mb-4">
                <label className="block font-medium mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ₹{item.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {cart.length > 0 && (
                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Save size={20} />
                <span>Complete Sale</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

