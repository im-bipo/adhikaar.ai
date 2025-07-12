'use client'
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Pin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import notices from "@/data/data.json"; 

const Notice = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredNotices, setFilteredNotices] = useState(notices);

  const handleSearch = () => {
    let filtered = notices;
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((n) => n.category === selectedCategory);
    }
    filtered.sort((a, b) =>
      a.isPinned && !b.isPinned ? -1 : !a.isPinned && b.isPinned ? 1 : 0
    );
    setFilteredNotices(filtered);
  };

  return (
    <>
      <div className="w-11/12 mx-auto">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#082567]">Notice Portal</h1>
                <p className="text-gray-400 mt-2">
                  Government legal notices and new regulations
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" className="mt-4 sm:mt-0">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-11/12 mx-auto my-4">
          <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="col-span-1"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Citizenship">Citizenship</SelectItem>
              <SelectItem value="Women's Rights">Women's Rights</SelectItem>
              <SelectItem value="Labor Rights">Labor Rights</SelectItem>
              <SelectItem value="Criminal">Criminal</SelectItem>
              <SelectItem value="Tax">Tax</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-[#082567] col-span-1"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              className={`hover:shadow-lg transition-shadow ${
                notice.isPinned ? "border-red-500 border-2" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between flex-col sm:flex-row">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {notice.isPinned && (
                        <Pin className="h-4 w-4 text-[#082567]" />
                      )}
                      <CardTitle className="text-[#082567]">
                        {notice.title}
                      </CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{notice.date}</span>
                      </div>
                      <span>Source: {notice.source}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{notice.category}</Badge>
                    {notice.isPinned && <Badge className="bg-red-400">Pinned</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {notice.description}
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button size="sm" className="bg-[#082567] w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notices found.</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setFilteredNotices(notices);
              }}
              className="mt-4"
              variant="outline"
            >
              Show All Notices
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Notice;
