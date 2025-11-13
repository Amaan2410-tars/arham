import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Minus, Trash2, Camera, X, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'
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
    try {
      setShowScanner(true)
      
      // Wait for video element to be ready
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (!videoRef.current) {
        alert('Video element not ready')
        setShowScanner(false)
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
      
      // Get available cameras
      const devices = await codeReader.current.listVideoInputDevices()
      
      if (devices.length === 0) {
        alert('No camera found. Please ensure your device has a camera and grant camera permissions.')
        setShowScanner(false)
        return
      }

      // Try to use back camera first (for mobile), fallback to first available
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )
      const deviceId = backCamera?.deviceId || devices[0].deviceId

      console.log('Starting scanner with device:', deviceId)

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

      // Start decoding from video device
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
            
            // Handle the scanned barcode
            handleBarcodeScanned(barcode)
            setShowScanner(false)
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
      setShowScanner(false)
    }
  }

  const stopScanning = () => {
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
    setShowScanner(false)
  }

  const handleBarcodeScanned = (barcode: string) => {
    console.log('Processing barcode:', barcode)
    const product = products.find(p => p.barcode === barcode)
    if (product) {
      addToCart(product)
      // Clear search query after successful scan
      setSearchQuery('')
    } else {
      alert(`Product with barcode "${barcode}" not found. Please add it to inventory first.`)
      // Optionally, you could set the search query to help user find/add the product
      setSearchQuery(barcode)
    }
  }

  // Handle manual barcode entry in search field (when user presses Enter)
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim()
      // Check if it looks like a barcode (numeric or alphanumeric)
      if (/^[0-9A-Za-z-]+$/.test(trimmedQuery) && trimmedQuery.length >= 3) {
        handleBarcodeScanned(trimmedQuery)
      }
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

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('You must be logged in to process sales. Please log in again.')
      return
    }

    try {
      console.log('Starting checkout process...')
      
      // Save POS sale
      console.log('Saving POS sale to database...')
      const { data: saleData, error: saleError } = await supabase
        .from('pos_sales')
        .insert({
          customer_name: customerName || 'Walk-in Customer',
          items: cart,
          total: total,
        })
        .select()
        .single()

      if (saleError) {
        console.error('Error saving POS sale:', saleError)
        throw new Error(`Failed to save sale: ${saleError.message}`)
      }

      if (!saleData) {
        throw new Error('Sale was not saved - no data returned')
      }

      console.log('POS sale saved successfully:', saleData.id)

      // Generate invoice
      const invoiceNo = `POS-${Date.now()}`
      console.log('Generating invoice PDF...')
      
      let pdfBlob: Blob
      try {
        pdfBlob = await generateInvoicePDF({
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
        console.log('Invoice PDF generated successfully')
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError)
        // Continue even if PDF generation fails
        pdfBlob = new Blob()
      }

      // Upload PDF (only if PDF was generated)
      // Note: For POS sales, we don't insert into invoices table (it references orders table)
      // We just upload the PDF for record keeping
      if (pdfBlob.size > 0) {
        try {
          // Use just the filename, not invoices/filename (bucket name is already specified)
          const fileName = `${invoiceNo}.pdf`
          console.log('Uploading invoice PDF to storage...')
          
          const { error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(fileName, pdfBlob, { 
              contentType: 'application/pdf',
              upsert: true // Overwrite if exists
            })

          if (uploadError) {
            console.error('Error uploading PDF:', uploadError)
            // Continue even if upload fails - sale is already saved
          } else {
            console.log('PDF uploaded successfully')
            // Get public URL for reference (optional)
            const { data: urlData } = supabase.storage
              .from('invoices')
              .getPublicUrl(fileName)
            console.log('Invoice PDF URL:', urlData.publicUrl)
          }
        } catch (uploadErr) {
          console.error('Exception during PDF upload:', uploadErr)
          // Continue - sale is already saved
        }
      }

      // Update stock
      console.log('Updating product stock...')
      for (const item of cart) {
        const newStock = item.stock - item.quantity
        if (newStock < 0) {
          console.warn(`Warning: Stock for ${item.name} would go negative. Setting to 0.`)
        }
        
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: Math.max(0, newStock) })
          .eq('id', item.id)

        if (stockError) {
          console.error(`Error updating stock for ${item.name}:`, stockError)
          // Continue with other items
        }
      }
      console.log('Stock updated successfully')

      // Show success
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Clear cart
      setCart([])
      setCustomerName('')
      fetchProducts()

      alert(`Sale completed successfully!\n\nSale ID: ${saleData.id}\nInvoice: ${invoiceNo}`)
      console.log('Checkout completed successfully')
    } catch (error: any) {
      console.error('Checkout error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      let errorMessage = 'Error processing sale'
      if (error.message) {
        errorMessage = error.message
      } else if (error.code === 'PGRST116' || error.message?.includes('permission')) {
        errorMessage = 'Permission denied. Make sure you are logged in as an admin user.\n\nCheck your Supabase RLS policies.'
      }
      
      alert(`${errorMessage}\n\nCheck browser console (F12) for more details.`)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode?.includes(searchQuery)
  )

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">POS System</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Products Panel */}
          <div className="lg:col-span-2">
            <div className="card mb-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search or scan barcode... (Press Enter to search)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
                  />
                </div>
                <button
                  onClick={showScanner ? stopScanning : startScanning}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium flex items-center space-x-2 text-sm sm:text-base touch-manipulation ${
                    showScanner
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-primary hover:bg-primary-dark text-white'
                  }`}
                  aria-label={showScanner ? 'Stop scanning' : 'Start scanning'}
                >
                  <Camera size={18} />
                  <span>{showScanner ? 'Stop' : 'Scan'}</span>
                </button>
              </div>

              {showScanner && (
                <div className="relative mb-4 bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                    autoPlay
                    playsInline
                    muted
                    id="scanner-video"
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-primary rounded-xl" style={{
                      boxShadow: 'inset 0 0 0 2px rgba(37, 99, 235, 0.5)'
                    }} />
                    {/* Scanning indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-48 h-1 bg-primary/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-pulse" style={{
                          width: '60%',
                          animation: 'scan 2s ease-in-out infinite'
                        }} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={stopScanning}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg touch-manipulation z-10"
                    aria-label="Stop scanning"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 text-center space-y-2">
                    <p className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                      Point camera at barcode - Keep steady and well-lit
                    </p>
                    <p className="bg-black/50 text-white/80 px-3 py-1 rounded text-xs">
                      Supported: EAN, UPC, Code128, Code39, QR Code
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {filteredProducts.map((product) => (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-left hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <h3 className="font-semibold mb-1 text-xs sm:text-sm truncate">{product.name}</h3>
                    <p className="text-primary font-bold text-sm sm:text-base">₹{product.price}</p>
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
            <div className="card sticky top-20 lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Cart</h2>

              <div className="mb-3 sm:mb-4">
                <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2 mb-3 sm:mb-4 max-h-[40vh] overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs sm:text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ₹{item.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center touch-manipulation"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center disabled:opacity-50 touch-manipulation"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 ml-1 p-1 touch-manipulation"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {cart.length > 0 && (
                <div className="border-t pt-3 sm:pt-4 space-y-2 mb-3 sm:mb-4 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg sm:text-xl font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <Save size={18} />
                <span>Complete Sale</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

