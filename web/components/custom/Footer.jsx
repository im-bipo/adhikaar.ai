import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#1A2B5B] container-grid text-gray-300 py-12 md:py-16 lg:py-20">
      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 lg:gap-16">
          {/* Column 1: Logo and Description */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M12 2L15.09 8.26L22 9L17 14.74L18.18 21.02L12 17.77L5.82 21.02L7 14.74L2 9L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
              <span className="ml-2 text-xl font-semibold text-white">
                अधिकार<span className="text-red-500">.ai</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              A platform providing legal assistance and information for Nepali citizens.
            </p>
          </div>

          {/* Column 2: Services */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white mb-2">Services</h3>
            <Link href="/chat" className="text-sm hover:text-white transition-colors">
              AI Chatbot
            </Link>
            <Link href="/lawyers" className="text-sm hover:text-white transition-colors">
              Lawyer Suggestions
            </Link>
            <Link href="/forms" className="text-sm hover:text-white transition-colors">
              Government Forms
            </Link>
            <Link href="/notice" className="text-sm hover:text-white transition-colors">
              Notice Portal
            </Link>
          </div>

          {/* Column 3: Information */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white mb-2">Information</h3>
            <Link href="/about" className="text-sm hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-sm hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/blog" className="text-sm hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/privacy" className="text-sm hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white mb-2">Contact</h3>
            <p className="text-sm">Phone: +977-9800000000</p>
            <p className="text-sm">Email: info@adhikarai.com</p>
            <p className="text-sm">Address: Nepal</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 AdhikarAi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
