import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Download, Search, Camera, X, ImagePlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const PRODUCT_IMAGE_BUCKET = 'product-images'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  description?: string
  image_url?: string
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image_url: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleImageSelection = (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Please choose an image smaller than 5MB.')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  const handleGalleryPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelection(event.target.files?.[0] || null)
    event.target.value = ''
  }

  const clearSelectedImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  const generateFileName = (extension: string) => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${crypto.randomUUID()}.${extension}`
    }
    const randomPart = Math.random().toString(36).slice(2, 10)
    return `${Date.now()}-${randomPart}.${extension}`
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (error) throw error
      if (data) {
        setProducts(data)
        // Auto-create backorders for products with 0 stock
        checkAndCreateBackorders(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAndCreateBackorders = async (products: Product[]) => {
    try {
      const outOfStockProducts = products.filter(p => p.stock === 0)
      
      for (const product of outOfStockProducts) {
        // Check if backorder already exists
        const { data: existing } = await supabase
          .from('backorders')
          .select('*')
          .eq('product_name', product.name)
          .eq('status', 'pending')
          .single()

        if (!existing) {
          // Auto-create backorder
          await supabase.from('backorders').insert({
            product_name: product.name,
            category: product.category,
            quantity_ordered: 10, // Default quantity
            supplier: '',
            expected_date: null,
            status: 'pending',
            notes: 'Auto-created: Product out of stock',
          })
          console.log(`Auto-created backorder for ${product.name}`)
        }
      }
    } catch (error) {
      console.error('Error checking backorders:', error)
      // Don't show error to user - this is background process
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('You must be logged in to add products. Please log in again.')
      window.location.href = '/admin/login'
      return
    }

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a product name')
      return
    }
    if (!formData.category.trim()) {
      alert('Please enter a category')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price')
      return
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      alert('Please enter a valid stock quantity')
      return
    }

    try {
      let uploadedImageUrl = formData.image_url.trim() || null

      if (imageFile) {
        setUploadingImage(true)
        try {
          const fileExtension =
            imageFile.name.split('.').pop()?.toLowerCase() ||
            imageFile.type.split('/').pop() ||
            'jpg'
          const filePath = `products/${generateFileName(fileExtension)}`

          const { error: uploadError } = await supabase.storage
            .from(PRODUCT_IMAGE_BUCKET)
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: imageFile.type || 'image/jpeg',
            })

          if (uploadError) {
            throw uploadError
          }

          const { data: urlData } = supabase.storage
            .from(PRODUCT_IMAGE_BUCKET)
            .getPublicUrl(filePath)

          uploadedImageUrl = urlData.publicUrl
        } catch (error) {
          console.error('Image upload error:', error)
          alert('Could not upload the photo. Please try again or use an image URL instead.')
          setUploadingImage(false)
          return
        } finally {
          setUploadingImage(false)
        }
      }

      const productData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description.trim() || null,
        image_url: uploadedImageUrl,
      }

      let error, data

      if (editingProduct) {
        const result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
        error = result.error
        data = result.data
      } else {
        const result = await supabase
          .from('products')
          .insert(productData)
          .select()
        error = result.error
        data = result.data
      }

      if (error) {
        console.error('Supabase error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        // More helpful error messages
        let errorMessage = error.message || 'Unknown error'
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          errorMessage = 'Permission denied. Make sure you are logged in as an admin user.\n\nIf you are logged in, check your Supabase RLS policies.'
        } else if (error.message?.includes('violates')) {
          errorMessage = `Database constraint error: ${error.message}\n\nCheck that all required fields are filled correctly.`
        }
        
        alert(`Error saving product: ${errorMessage}\n\nCheck browser console (F12) for more details.`)
        return
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.warn('No data returned from Supabase')
        alert('Product saved but no confirmation received. Please refresh the page to verify.')
        fetchProducts() // Refresh anyway
        return
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
      
      // Show success message
      if (editingProduct) {
        alert('Product updated successfully!')
      } else {
        alert('Product added successfully!')
      }
    } catch (error: any) {
      console.error('Error saving product:', error)
      alert(`Error saving product: ${error.message || 'Unknown error'}\n\nCheck browser console (F12) for more details.`)
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
      description: product.description || '',
      image_url: product.image_url || '',
    })
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      image_url: '',
    })
    setImageFile(null)
    setImagePreview(null)
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Category', 'Price', 'Stock'].join(','),
      ...products.map(p => [p.name, p.category, p.price, p.stock].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
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
                  <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
                    Product Photo
                  </label>
                  <div className="space-y-3">
                    {imagePreview || formData.image_url ? (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={imagePreview || formData.image_url}
                          alt="Selected product"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={clearSelectedImage}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full px-4 py-6 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-500">
                        No photo selected
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="btn-secondary flex items-center space-x-2 text-sm sm:text-base"
                      >
                        <ImagePlus size={18} />
                        <span>Choose photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="btn-secondary flex items-center space-x-2 text-sm sm:text-base"
                      >
                        <Camera size={18} />
                        <span>Take photo</span>
                      </button>
                    </div>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryPick}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleGalleryPick}
                    />
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB. Camera option works best on mobile.</p>
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2 text-sm sm:text-base">Image URL (optional)</label>
                  <input
                    type="url"
                    placeholder="Paste an existing image link"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use this if your product image is already hosted online.</p>
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
                    setShowModal(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                  className="btn-secondary text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn-primary text-sm sm:text-base ${uploadingImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={uploadingImage}
                >
                  {uploadingImage
                    ? 'Uploading photo...'
                    : editingProduct
                      ? 'Update Product'
                      : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

