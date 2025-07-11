"use client"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigationItems = [
  { name: "Chatbot", href: "/chatbot" },
  { name: "Lawyers", href: "/lawyers" },
  { name: "Notices", href: "/notices" },
  { name: "Templates", href: "/templates" },
  { name: "Blog", href: "/blog" },
]


export default function MobileMenu({ authComponent }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col space-y-4 mt-4">
          <Link href="/" className="flex items-center space-x-2 pb-4 border-b">
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
            <span className="text-xl font-semibold text-gray-900">
              अधिकार<span className="text-red-500">.ai</span>
            </span>
          </Link>

          <nav className="flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t">
            <div onClick={() => setIsOpen(false)}>{authComponent}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
