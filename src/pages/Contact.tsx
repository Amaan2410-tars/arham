import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function Contact() {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg px-4">
            Get in touch with us for any queries or support
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card space-y-4 sm:space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Get in Touch</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <MapPin className="mt-1 text-primary flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Address</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      8-1-423/11, Teja Colony Main Rd,<br />
                      Alkapoor Twp Main Rd,<br />
                      near 7 Tombs Road,<br />
                      Hyderabad, Telangana 500104
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Phone className="text-primary flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Phone</h3>
                    <a href="tel:9533732344" className="text-gray-600 dark:text-gray-400 hover:text-primary text-xs sm:text-sm break-all">
                      9533732344
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Mail className="text-primary flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Email</h3>
                    <a href="mailto:irfanali55@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-primary text-xs sm:text-sm break-all">
                      irfanali55@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Clock className="mt-1 text-primary flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Business Hours</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Monday - Saturday: 9:00 AM - 8:00 PM<br />
                      Sunday: 10:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Send us a Message</h2>
            <form className="space-y-3 sm:space-y-4">
              <div>
                <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Name</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Email</label>
                <input
                  type="email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base resize-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full text-sm sm:text-base">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

