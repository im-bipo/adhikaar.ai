import Link from "next/link"
import AuthSection from "./AuthSection"
import MobileMenu from "./MobileMenu"
import Image from "next/image"

const navigationItems = [
  { name: "Chatbot", href: "/chatbot" },
  { name: "Lawyers", href: "/lawyers" },
  { name: "Notices", href: "/notices" },
  { name: "Templates", href: "/templates" },
  { name: "Blog", href: "/blog" },
]

export default function Navbar() {
  return (
    <header className="sticky content-grid top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 content-grid ">
      <div className="full-width">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
             <Image
             src="/adkAiLogo.png"
              alt="ADK AI Logo"
              width={400}
              height={400}
              className="h-8 w-auto"
             />
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
      </div>
    </header>
  )
}
