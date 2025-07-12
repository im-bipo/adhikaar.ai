import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#000c1f] container-grid text-gray-300 py-12 md:py-16 lg:py-20">
      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 lg:gap-16">
          {/* Column 1: Logo and Description */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/logo-final.png"
                alt="Adhikar.ai Logo"
                className="h-8"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              A platform providing legal assistance and information for Nepali
              citizens.
            </p>
          </div>

          {/* Column 2: Services */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white mb-2">Services</h3>
            <Link
              href="/chat"
              className="text-sm hover:text-white transition-colors"
            >
              AI Chatbot
            </Link>
            <Link
              href="/lawyers"
              className="text-sm hover:text-white transition-colors"
            >
              Lawyer Suggestions
            </Link>
            <Link
              href="/forms"
              className="text-sm hover:text-white transition-colors"
            >
              Government Forms
            </Link>
            <Link
              href="/notice"
              className="text-sm hover:text-white transition-colors"
            >
              Notice Portal
            </Link>
          </div>

          {/* Column 3: Information */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white mb-2">
              Information
            </h3>
            <Link
              href="/about"
              className="text-sm hover:text-white transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-sm hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/blog"
              className="text-sm hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/privacy"
              className="text-sm hover:text-white transition-colors"
            >
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
  );
}
