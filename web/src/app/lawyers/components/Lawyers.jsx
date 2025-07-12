'use client'
import React, { useEffect, useState } from 'react';
import { Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Lawyers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Location");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialyst");

  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await fetch('/api/lawyer');
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setLawyers(data.lawyers);
        setFilteredLawyers(data.lawyers);
        extractFilters(data.lawyers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchLawyers();
  }, []);

  const extractFilters = (lawyersList) => {
    const citySet = new Set();
    const specialtySet = new Set();
    lawyersList.forEach(lawyer => {
      if (lawyer.city) citySet.add(lawyer.city);
      if (Array.isArray(lawyer.specialty)) {
        lawyer.specialty.forEach(spec => specialtySet.add(spec));
      }
    });
    setLocations(["All Location", ...Array.from(citySet)]);
    setSpecialties(["All Specialyst", ...Array.from(specialtySet)]);
  };

  const handleSearch = () => {
    let filtered = [...lawyers];
    if (searchTerm) {
      filtered = filtered.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lawyer.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedLocation !== "All Location") {
      filtered = filtered.filter((lawyer) => lawyer.city === selectedLocation);
    }
    if (selectedSpecialty !== "All Specialyst") {
      filtered = filtered.filter((lawyer) =>
        lawyer.specialty.some(s => s === selectedSpecialty)
      );
    }
    setFilteredLawyers(filtered);
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className='w-11/12 mx-auto my-4 flex flex-col gap-4'>
      <div>
        <h1 className='text-3xl font-bold text-[#082567]'>Lawyers Directory</h1>
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
          <SelectTrigger><SelectValue placeholder="select your location" /></SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc} </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
          <SelectContent>
            {specialties.map((spec) => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="bg-[#082567] col-span-1">
          <Filter className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Find Your Advocate</h1>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredLawyers.length > 0 ? (
            filteredLawyers.map((advocate) => (
              <div key={advocate.id} className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 p-5 relative group">
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full font-medium ${advocate.verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {advocate.verified ? '✔ Verified' : 'Not Verified'}
                </span>
                <div className="flex flex-col ">
                  <div className='flex gap-4'>

                  <img src={advocate.profilePicture} alt={advocate.name} className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover mb-3" />
                  <h2 className="text-xl font-semibold text-gray-800 pt-10 ">{advocate.name}</h2>
                  </div>
                  <p className="text-sm text-blue-600 mb-2">{advocate.specialty.join(', ')}</p>
                  <h2 className="text-sm  text-gray-800">{advocate.email}</h2>
               
                  <h2 className="text-sm text-gray-800">{advocate.description}</h2>
                </div>
                <div className="text-sm text-gray-700 space-y-1 mt-3">
                  <p><strong>📍 Location:</strong> {advocate.city}</p>
                  <p><strong>🧾 Bar ID:</strong> {advocate.barId}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">No lawyers found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lawyers;
