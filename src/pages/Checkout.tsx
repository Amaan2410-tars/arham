import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'
import confetti from 'canvas-confetti'
import { generateInvoicePDF } from '../utils/invoice'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMode: 'COD',
  })
  const [loading, setLoading] = useState(false)

  const gst = total * 0.18
  const finalTotal = total + gst

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Save order to Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          total: finalTotal,
          items: items,
          payment_mode: formData.paymentMode,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Generate invoice
      const invoiceNo = `INV-${Date.now()}`
      const pdfBlob = await generateInvoicePDF({
        invoiceNo,
        orderId: orderData.id,
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        items,
        subtotal: total,
        gst,
        total: finalTotal,
        paymentMode: formData.paymentMode,
      })

      // Upload PDF to Supabase Storage
      const fileName = `invoices/${invoiceNo}.pdf`
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(fileName)

      // Save invoice record
      await supabase.from('invoices').insert({
        order_id: orderData.id,
        invoice_no: invoiceNo,
        pdf_url: urlData.publicUrl,
      })

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      clearCart()
      
      // Show success and redirect
      setTimeout(() => {
        navigate('/products', { state: { orderSuccess: true, invoiceNo } })
      }, 2000)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error processing order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Shop Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="card">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shipping Information</h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Delivery Address *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Payment Method</h2>
              <div className="space-y-2 sm:space-y-3">
                {['COD', 'UPI', 'Razorpay'].map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center space-x-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors touch-manipulation"
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={formData.paymentMode === mode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0"
                    />
                    <span className="font-medium text-sm sm:text-base">{mode}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20 lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Order Summary</h2>
              <div className="space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                    <span className="flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-3 sm:pt-4 mb-4 sm:mb-6 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg sm:text-xl font-bold pt-2">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

