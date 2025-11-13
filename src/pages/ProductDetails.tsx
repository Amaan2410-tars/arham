import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'

interface Product {
  id: string
  name: string
  price: number
  category: string
  image_url?: string
  description?: string
  stock: number
  barcode?: string
}

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    if (id) fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Product not found</p>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-4 sm:mb-6 text-sm sm:text-base touch-manipulation"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-0 overflow-hidden"
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Package size={60} className="sm:w-20 sm:h-20 text-gray-400" />
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div>
              <span className="text-primary font-medium text-sm sm:text-base">{product.category}</span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 mb-3 sm:mb-4">{product.name}</h1>
              <p className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">₹{product.price}</p>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{product.description}</p>
              </div>
            )}

            <div className="flex items-center">
              <span className={`font-medium text-sm sm:text-base ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <label className="font-medium text-sm sm:text-base">Quantity:</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 sm:w-10 sm:h-10 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-sm sm:text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 sm:w-10 sm:h-10 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn-primary w-full flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

