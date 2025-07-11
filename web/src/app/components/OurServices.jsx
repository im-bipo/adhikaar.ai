import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, FileText, BookOpen, Book, PhoneCall } from "lucide-react"

function ServiceCard({
  icon: Icon,
  iconBgColor,
  title,
  description,
  buttonText,
  buttonHref,
  buttonColor,
  buttonHoverColor,
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{ backgroundColor: buttonColor }}
      >
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 flex-grow">{description}</p>
      <Button
        asChild
        className="px-6 py-2 text-base rounded-md transition-colors"
        style={{ backgroundColor: buttonColor, hover: { backgroundColor: buttonHoverColor } }}
      >
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </div>
  )
}

const services = [
  {
    icon: MessageCircle,
    title: "AI Chatbot",
    description: "Get instant answers to legal questions. Ask using both voice and text input for convenience.",
    buttonText: "Get Started",
    buttonHref: "/chatbot",
    buttonColor: "#3B82F6", // Blue
    buttonHoverColor: "#2563EB", // Darker Blue
  },
  {
    icon: Users,
    title: "Lawyer Suggestions",
    description: "Find suitable lawyers based on your problem. Contact directly via WhatsApp for consultation.",
    buttonText: "Find Lawyers",
    buttonHref: "/lawyers",
    buttonColor: "#EF4444", // Red
    buttonHoverColor: "#DC2626", // Darker Red
  },
  {
    icon: FileText,
    title: "Government Forms",
    description: "Download forms required for government work like citizenship, birth registration, and more.",
    buttonText: "View Forms",
    buttonHref: "/forms",
    buttonColor: "#10B981", // Green
    buttonHoverColor: "#059669", // Darker Green
  },
  {
    icon: BookOpen,
    title: "Notice Portal",
    description: "Stay updated with government legal notices and new regulations.",
    buttonText: "View Notices",
    buttonHref: "/notices",
    buttonColor: "#8B5CF6", // Purple
    buttonHoverColor: "#7C3AED", // Darker Purple
  },
  {
    icon: Book,
    title: "Lawyer Blog",
    description: "Read legal articles written by registered lawyers and expand your knowledge.",
    buttonText: "Read Blog",
    buttonHref: "/blog",
    buttonColor: "#F97316", // Orange
    buttonHoverColor: "#EA580C", // Darker Orange
  },
  {
    icon: PhoneCall,
    title: "Contact Support",
    description: "24/7 support service. Contact via phone, email, or WhatsApp.",
    buttonText: "Contact Us",
    buttonHref: "/contact",
    buttonColor: "#3B82F6", // Blue
    buttonHoverColor: "#2563EB", // Darker Blue
  },
]

export default function ServicesSection() {
  return (
    <section className="content-grid bg-[#F9FAFB] lg:py-20">
      <div className="container px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
        <p className="text-lg md:text-xl text-gray-600 mb-12">All essential legal assistance services in one place</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}
