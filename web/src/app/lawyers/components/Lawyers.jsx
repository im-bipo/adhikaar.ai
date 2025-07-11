'use client'
import { React, useState} from 'react'
import { Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Lawyerdata from '@/data/lawyer.json'


const Lawyers = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLocation, setSelectedLocation] = useState("all")
    const [selectedSpecialty, setSelectedSpecialty] = useState("all")
    const [filteredLawyers, setFilteredLawyers] = useState(Lawyerdata)
    const handleSearch = () => {
        let filtered = [...Lawyerdata]

        if (searchTerm) {
            filtered = filtered.filter(
              (lawyer) =>
                lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lawyer.specialty.toLowerCase().includes(searchTerm.toLowerCase())
            )
          }
          if (selectedLocation !== "all") {
            filtered = filtered.filter((lawyer) => lawyer.location === selectedLocation)
          }
      
          if (selectedSpecialty !== "all") {
            filtered = filtered.filter((lawyer) => lawyer.specialty === selectedSpecialty)
          }
      
          setFilteredLawyers(filtered)
    }


  return (
<>
  <div className='w-11/12 mx-auto my-4 flex flex-col gap-4'>
  <div>
        <h1 className='text-3xl font-bold  text-[#082567]'>Lawyers Directory</h1>
        <p className='text-gray-400'>Connect with registered and verified lawyers</p>
      </div>


      <div className="grid md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search lawyers or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="Kathmandu">Kathmandu</SelectItem>
            <SelectItem value="Pokhara">Pokhara</SelectItem>
            <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
            <SelectItem value="Lalitpur">Lalitpur</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger>
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            <SelectItem value="Criminal Law">Criminal Law</SelectItem>
            <SelectItem value="Family Law">Family Law</SelectItem>
            <SelectItem value="Business Law">Business Law</SelectItem>
            <SelectItem value="Property Law">Property Law</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch}
         className="bg-[#082567] col-span-1" >
          <Filter className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

  
      
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Find Your Advocate</h1>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredLawyers.length > 0 ? (
            filteredLawyers.map((advocate) => (
              <div
                key={advocate.id}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 p-5 relative group"
              >
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full font-medium ${advocate.verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {advocate.verified ? '✔ Verified' : 'Not Verified'}
                </span>

                <div className="flex flex-col items-center text-center">
                  <img
                    src={advocate.photo}
                    alt={advocate.name}
                    className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover mb-3"
                  />
                  <h2 className="text-xl font-semibold text-gray-800">{advocate.name}</h2>
                  <p className="text-sm text-blue-600 mb-2">{advocate.specialty}</p>
                </div>

                <div className="text-sm text-gray-700 space-y-1 mt-3">
                  <p><strong>📍 Location:</strong> {advocate.location}</p>
                  <p><strong>🧾 Bar ID:</strong> {advocate.barId}</p>
                  <p><strong>🎓 Experience:</strong> {advocate.experience}</p>
                  <p><strong>💰 Fee:</strong> {advocate.consultationFee}</p>
                  <p><strong>⭐ Rating:</strong> {advocate.rating}</p>
                  <p><strong>🗣 Languages:</strong> {advocate.languages.join(', ')}</p>
                </div>

                <a
                  href={`https://wa.me/${advocate.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 bg-[#082567] text-white text-center py-2 rounded-lg font-medium hover:bg-[#082588] transition"
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">No lawyers found.</p>
          )}
        </div>
      </div>
      
  </div>
</>

  )
}

export default Lawyers