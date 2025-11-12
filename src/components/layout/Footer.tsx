import { Mail, Phone, MapPin } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function Footer() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) return null

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Arham Stationary & Disposal
            </h3>
            <p className="text-gray-400">
              Your trusted partner for all stationery and disposal solutions.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-400 text-sm">
                  8-1-423/11, Teja Colony Main Rd, Alkapoor Twp Main Rd,<br />
                  near 7 Tombs Road, Hyderabad, Telangana 500104
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} />
                <a href="tel:9533732344" className="text-gray-400 hover:text-white transition-colors">
                  9533732344
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} />
                <a href="mailto:irfanali55@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  irfanali55@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Arham Stationary & Disposal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

