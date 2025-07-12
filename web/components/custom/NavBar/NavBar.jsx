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
           <img src="/logo-final.png" width={24}  height={24} className="w-32" alt="" />
           
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
