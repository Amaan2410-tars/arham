import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart()

  const gst = total * 0.18 // 18% GST
  const finalTotal = total + gst

  if (itemCount === 0) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some products to get started</p>
          <Link to="/products" className="btn-primary inline-block">
            Shop Now
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full sm:w-20 sm:h-20 h-48 sm:h-auto object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-20 sm:h-20 h-48 sm:h-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={32} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex-grow w-full sm:w-auto min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{item.name}</h3>
                    <p className="text-primary font-bold text-sm sm:text-base">₹{item.price}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 sm:gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center touch-manipulation"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center touch-manipulation"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right sm:text-left">
                      <p className="font-bold text-base sm:text-lg mb-1">₹{item.price * item.quantity}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 touch-manipulation"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20 lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Order Summary</h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-semibold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-semibold">₹{gst.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-700 pt-3 sm:pt-4 flex justify-between text-lg sm:text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full block text-center text-sm sm:text-base py-2.5 sm:py-3">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

