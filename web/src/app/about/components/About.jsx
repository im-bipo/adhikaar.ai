export default function AboutSection() {
    return (
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/logo-final.png" // 🔁 Replace with your actual logo file path
              alt="Adhikaar AI Logo"
              className="mx-auto h-16 md:h-20 object-contain"
            />
          </div>
  
          {/* Heading + Description + Image */}
          <div className="grid md:grid-cols-2 gap-10 items-center text-left">
            {/* Text */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#082567] mb-4">
                About Adhikaar AI
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Adhikaar AI is a platform where users can easily access knowledge regarding the laws of Nepal. 
                It provides simplified legal information, helpful forms, and a verified lawyer directory 
                to help Nepali citizens understand their rights and responsibilities.
              </p>
            </div>
  
           
          </div>
  
          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#082567] mb-2">
                📚 Legal Knowledge
              </h3>
              <p className="text-gray-600">
                Explore easy-to-understand articles and guides related to Nepali law.
              </p>
            </div>
  
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#082567] mb-2">
                📝 Government Forms
              </h3>
              <p className="text-gray-600">
                Download official forms and templates required for various legal processes.
              </p>
            </div>
  
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#082567] mb-2">
                👨‍⚖️ Lawyer Directory
              </h3>
              <p className="text-gray-600">
                Connect with verified lawyers across Nepal for legal consultation.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  