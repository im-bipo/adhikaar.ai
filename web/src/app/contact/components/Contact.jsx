export default function Contact() {
    return (
      <section className="bg-gray-50 py-12 w-11/12 mx-auto">
        <div className="max-w-7xl mx-auto px-6 text-left">
        
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#082567] mb-4">
              Contact Adhikaar AI
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl">
              Have questions, suggestions, or need help? Reach out to us using the form below,
              and we will get back to you as soon as possible.
            </p>
          </div>
  
   
          <div className="grid md:grid-cols-2 gap-10 items-start">

            <form className="space-y-6 bg-white p-6 rounded-xl shadow-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your message..."
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
  
              <button
                type="submit"
                className="bg-[#082567] text-white px-6 py-3 rounded-md hover:bg-[#061d4c] transition"
              >
                Send Message
              </button>
            </form>
  
           
            <div>
              <img
                src="/logo-final.png" 
                alt="Contact"
                className="rounded-xl shadow-lg w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
  