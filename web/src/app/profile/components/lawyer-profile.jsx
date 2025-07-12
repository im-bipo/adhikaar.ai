"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Scale,
  Trophy,
  XCircle,
  Clock,
  FileText,
  Calendar,
  User,
  BarChart3,
} from "lucide-react";

const SPECIALTY_LABELS = {
  CRIMINAL_LAW: "Criminal Law",
  FAMILY_LAW: "Family Law",
  CORPORATE_LAW: "Corporate Law",
  REAL_ESTATE_LAW: "Real Estate Law",
  INTELLECTUAL_PROPERTY_LAW: "Intellectual Property Law",
  IMMIGRATION_LAW: "Immigration Law",
  ENVIRONMENTAL_LAW: "Environmental Law",
  TAX_LAW: "Tax Law",
  PERSONAL_INJURY_LAW: "Personal Injury Law",
  EMPLOYMENT_LAW: "Employment Law",
  BANKRUPTCY_LAW: "Bankruptcy Law",
  ESTATE_PLANNING: "Estate Planning",
  HEALTHCARE_LAW: "Healthcare Law",
  CIVIL_LITIGATION: "Civil Litigation",
};

export default function LawyerProfile(lawyer) {
  console.log("haha Lawyer Profile Data:", lawyer);
  const lawyerData = {
    id: "user_2zjBCxIKEQAkGTbrxzCqy2xybbE",
    createdAt: "2025-07-11T16:20:18.217Z",
    updatedAt: "2025-07-11T16:20:18.217Z",
    name: "Bipin Khatri",
    email: "bipinkhatri.ram@gmail.com",
    barId: "Culpa perspiciatis",
    specialty: ["INTELLECTUAL_PROPERTY_LAW"],
    description: "In nisi ad excepturi",
    profilePicture:
      "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yempCQ3dIdXNCeWUwWnBSOVV1UEY0Q3l4RE4ifQ",
    noOfCases: 0,
    wonCases: 0,
    lostCases: 0,
    pendingCases: 0,
    city: "Voluptate et assumen",
    state: "Autem deleniti in su",
    country: "Ipsa a in natus ips",
    phoneNumber: "+1 (843) 763-4074",
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const calculateSuccessRate = () => {
    const totalCompletedCases = lawyerData.wonCases + lawyerData.lostCases;
    if (totalCompletedCases === 0) return 0;
    return Math.round((lawyerData.wonCases / totalCompletedCases) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={lawyerData.profilePicture || "/placeholder.svg"}
                  alt={lawyerData.name}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(lawyerData.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {lawyerData.name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  {lawyerData.specialty
                    .map((s) => SPECIALTY_LABELS[s])
                    .join(", ")}{" "}
                  Attorney
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  <span>Bar ID: {lawyerData.barId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {formatDate(lawyerData.createdAt)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{lawyerData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">
                  {lawyerData.phoneNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-gray-600">
                  {lawyerData.city}, {lawyerData.state}
                </p>
                <p className="text-sm text-gray-600">{lawyerData.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Case Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {lawyerData.noOfCases}
                </div>
                <p className="text-sm text-gray-600">Total Cases</p>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">
                      {lawyerData.wonCases}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Won</p>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-lg font-semibold text-red-600">
                      {lawyerData.lostCases}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Lost</p>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-lg font-semibold text-yellow-600">
                      {lawyerData.pendingCases}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>

              {lawyerData.noOfCases > 0 && (
                <>
                  <Separator />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {calculateSuccessRate()}%
                    </div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Legal Specialties</p>
              <div className="flex flex-wrap gap-2">
                {lawyerData.specialty.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {SPECIALTY_LABELS[specialty]}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Bar Registration</p>
              <p className="text-sm text-gray-600">{lawyerData.barId}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">
                Professional Description
              </p>
              <p className="text-sm text-gray-600">{lawyerData.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Professional Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Profile Created:</span>
                  <span className="text-gray-600">
                    {formatDate(lawyerData.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-gray-600">
                    {formatDate(lawyerData.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profile Status:</span>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Practice Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Primary Specialty:</span>
                  <span className="text-gray-600">
                    Intellectual Property Law
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Years of Experience:</span>
                  <span className="text-gray-600">Not specified</span>
                </div>
                <div className="flex justify-between">
                  <span>Case Load:</span>
                  <span className="text-gray-600">
                    {lawyerData.noOfCases === 0
                      ? "New Practice"
                      : `${lawyerData.noOfCases} cases`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
