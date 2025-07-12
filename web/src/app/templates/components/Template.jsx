"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, FileText, Eye, Filter } from "lucide-react"
import Link from "next/link"

import templates from "@/data/template.json"

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredTemplates, setFilteredTemplates] = useState(templates)

  const handleSearch = () => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((template) => template.category === selectedCategory)
    }

    filtered.sort((a, b) => {
      if (a.popular && !b.popular) return -1
      if (!a.popular && b.popular) return 1
      return b.downloadCount - a.downloadCount
    })

    setFilteredTemplates(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-nepali-blue">Government Form Templates</h1>
              <p className="text-gray-600 mt-2">Download forms required for government work</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Citizenship">Citizenship</SelectItem>
                <SelectItem value="Birth Registration">Birth Registration</SelectItem>
                <SelectItem value="Marriage Registration">Marriage Registration</SelectItem>
                <SelectItem value="Passport">Passport</SelectItem>
                <SelectItem value="Property">Property</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="bg-[#082567]/90 w-full">
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-nepali-blue mb-4">Popular Forms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates
              .filter((t) => t.popular)
              .slice(0, 4)
              .map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow border-nepali-blue/20">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-12 w-12 text-nepali-blue mx-auto mb-3" />
                    <h3 className="font-semibold text-sm mb-2">{template.title}</h3>
                    <p className="text-xs text-gray-600 mb-3">{template.downloadCount} downloads</p>
                    <Button
                      size="sm"
                      className="w-full bg-nepali-blue hover:bg-nepali-blue/90"
                      onClick={() => window.open(template.pdfUrl, "_blank")}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-nepali-blue">All Forms</h2>
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <CardTitle className="text-nepali-blue">{template.title}</CardTitle>
                      {template.popular && <Badge className="bg-nepali-red hover:bg-nepali-red/90">Popular</Badge>}
                    </div>
                    <p className="text-gray-600 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>Category: {template.category}</span>
                      <span>Language: {template.language}</span>
                      <span>Size: {template.fileSize}</span>
                      <span>Updated: {template.lastUpdated}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{template.downloadCount} downloads</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-[#082567]"
                    onClick={() => window.open(template.pdfUrl, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No forms found.</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setFilteredTemplates(templates)
              }}
              className="mt-4"
              variant="outline"
            >
              Show All Forms
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
