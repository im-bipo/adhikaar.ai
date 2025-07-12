import Link from "next/link"
import AuthSection from "./AuthSection"
import MobileMenu from "./MobileMenu"

const navigationItems = [
  { name: "Chatbot", href: "/chat" },
  { name: "Lawyers", href: "/lawyers" },
  { name: "Notices", href: "/notice" },
  { name: "Templates", href: "/templates" },
  { name: "Blog", href: "/blog" },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-500"
            >
              <path
                d="M12 2L15.09 8.26L22 9L17 14.74L18.18 21.02L12 17.77L5.82 21.02L7 14.74L2 9L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
            <span className="ml-2 text-xl font-semibold text-gray-900">
              अधिकार<span className="text-red-500">.ai</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <AuthSection />

        {/* Mobile Menu */}
        <MobileMenu authComponent={<AuthSection />} />
      </div>
    </header>
  )
}
