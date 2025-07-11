// my-component.js or my-page.js
'use client';

import { useState, useEffect } from "react"; // Import useEffect
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, User, Briefcase, MapPin, BarChart3, Camera } from "lucide-react";
import { useUser } from "@clerk/nextjs"; // Import useUser hook

const LAWYER_SPECIALTIES = [
  { value: "CRIMINAL_LAW", label: "Criminal Law" },
  { value: "FAMILY_LAW", label: "Family Law" },
  { value: "CORPORATE_LAW", label: "Corporate Law" },
  { value: "REAL_ESTATE_LAW", label: "Real Estate Law" },
  { value: "INTELLECTUAL_PROPERTY_LAW", label: "Intellectual Property Law" },
  { value: "IMMIGRATION_LAW", label: "Immigration Law" },
  { value: "ENVIRONMENTAL_LAW", label: "Environmental Law" },
  { value: "TAX_LAW", label: "Tax Law" },
  { value: "PERSONAL_INJURY_LAW", label: "Personal Injury Law" },
  { value: "EMPLOYMENT_LAW", label: "Employment Law" },
  { value: "BANKRUPTCY_LAW", label: "Bankruptcy Law" },
  { value: "ESTATE_PLANNING", label: "Estate Planning" },
  { value: "HEALTHCARE_LAW", label: "Healthcare Law" },
  { value: "CIVIL_LITIGATION", label: "Civil Litigation" },
];

const STEPS = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Professional Details", icon: Briefcase },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Case Statistics", icon: BarChart3 },
  { id: 5, title: "Profile & Review", icon: Camera },
];

export default function LawyerRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userId: "", // New field for Clerk user ID
    name: "",
    email: "",
    phoneNumber: "",
    barId: "",
    specialty: [],
    description: "",
    city: "",
    state: "",
    country: "",
    noOfCases: 0, // Will be calculated
    wonCases: 0,
    lostCases: 0,
    pendingCases: 0,
    profilePicture: "",
  });
  const [errors, setErrors] = useState({});

  // Get user data from Clerk
  const { isLoaded, isSignedIn, user } = useUser();

  // useEffect to populate form data when Clerk user loads
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setFormData((prev) => ({
        ...prev,
        userId: user.id || "",
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.primaryEmailAddress?.emailAddress || "",
        profilePicture: user.imageUrl || "", // Pre-fill profile picture if available
      }));
    }
  }, [isLoaded, isSignedIn, user]);

  // useEffect to update total cases whenever won, lost, or pending cases change
  useEffect(() => {
    const total = formData.wonCases + formData.lostCases + formData.pendingCases;
    setFormData((prev) => ({ ...prev, noOfCases: total }));
  }, [formData.wonCases, formData.lostCases, formData.pendingCases]);


  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
        break;
      case 2:
        if (!formData.barId.trim()) newErrors.barId = "Bar ID is required";
        if (formData.specialty.length === 0) newErrors.specialty = "At least one specialty is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        break;
      case 3:
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State/Province is required";
        if (!formData.country.trim()) newErrors.country = "Country is required";
        break;
      case 4:
        // noOfCases is now derived, so only validate won/lost/pending for non-negativity
        if (formData.wonCases < 0) newErrors.wonCases = "Won cases cannot be negative";
        if (formData.lostCases < 0) newErrors.lostCases = "Lost cases cannot be negative";
        if (formData.pendingCases < 0) newErrors.pendingCases = "Pending cases cannot be negative";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSpecialtyChange = (specialty, checked) => {
    if (checked) {
      updateFormData("specialty", [...formData.specialty, specialty]);
    } else {
      updateFormData(
        "specialty",
        formData.specialty.filter((s) => s !== specialty),
      );
    }
  };

  const handleSubmit = async () => {
    // Validate the final step before submission
    if (validateStep(currentStep)) { // Changed from validateStep(4) to currentStep to ensure final step is validated
      try {
        console.log("Submitting lawyer data:", formData); // Log data before sending

        // Add userId to the data being sent
        const dataToSend = { ...formData, userId: user?.id || "" }; 

        const response = await fetch("/api/lawyer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
          alert("Lawyer registration submitted successfully!");
          // Optional: Redirect or clear form
          // router.push('/dashboard');
        } else {
          const errorData = await response.json();
          console.error("Error submitting form:", errorData);
          alert(`Error submitting form: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Network error or unexpected issue:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const progress = (currentStep / STEPS.length) * 100; // Use STEPS.length for total steps

  // If Clerk hasn't loaded, display a loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading user session...</p>
      </div>
    );
  }

  // If user is not signed in, prompt them to sign in
  if (!isSignedIn) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <p className="text-lg">Please sign in to register as a lawyer.</p>
        {/* You could add a link to your sign-in page here */}
        {/* <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link> */}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Lawyer Registration</CardTitle>
          <CardDescription>Complete your professional profile in {STEPS.length} easy steps</CardDescription>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-1 ${currentStep >= step.id ? "text-primary" : ""}`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Step {currentStep}: {STEPS[currentStep - 1].title}
              </h2>
              {renderStepContent()}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < STEPS.length ? ( // Use STEPS.length for the last step
                <Button onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>Submit Registration</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Hidden field for Clerk User ID */}
            <Input type="hidden" id="userId" value={formData.userId} />

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                // Name is disabled and pre-filled from Clerk
                disabled
                placeholder="Enter your full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                // Email is disabled and pre-filled from Clerk
                disabled
                placeholder="Enter your email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barId">Bar ID *</Label>
              <Input
                id="barId"
                value={formData.barId}
                onChange={(e) => updateFormData("barId", e.target.value)}
                placeholder="Enter your Bar ID"
                className={errors.barId ? "border-red-500" : ""}
              />
              {errors.barId && <p className="text-sm text-red-500">{errors.barId}</p>}
            </div>
            <div className="space-y-2">
              <Label>Legal Specialties *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {LAWYER_SPECIALTIES.map((specialty) => (
                  <div key={specialty.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={specialty.value}
                      checked={formData.specialty.includes(specialty.value)}
                      onCheckedChange={(checked) => handleSpecialtyChange(specialty.value, checked)}
                    />
                    <Label htmlFor={specialty.value} className="text-sm font-normal">
                      {specialty.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.specialty && <p className="text-sm text-red-500">{errors.specialty}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Professional Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Describe your professional experience and expertise"
                className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                placeholder="Enter your city"
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => updateFormData("state", e.target.value)}
                placeholder="Enter your state or province"
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateFormData("country", e.target.value)}
                placeholder="Enter your country"
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="noOfCases">Total Number of Cases</Label>
              <Input
                id="noOfCases"
                type="number"
                min="0"
                value={formData.noOfCases}
                // This field is now disabled as it's calculated
                disabled
                placeholder="0"
                className={errors.noOfCases ? "border-red-500" : ""}
              />
              {errors.noOfCases && <p className="text-sm text-red-500">{errors.noOfCases}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wonCases">Won Cases</Label>
                <Input
                  id="wonCases"
                  type="number"
                  min="0"
                  value={formData.wonCases}
                  onChange={(e) => updateFormData("wonCases", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.wonCases ? "border-red-500" : ""}
                />
                {errors.wonCases && <p className="text-sm text-red-500">{errors.wonCases}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lostCases">Lost Cases</Label>
                <Input
                  id="lostCases"
                  type="number"
                  min="0"
                  value={formData.lostCases}
                  onChange={(e) => updateFormData("lostCases", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.lostCases ? "border-red-500" : ""}
                />
                {errors.lostCases && <p className="text-sm text-red-500">{errors.lostCases}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pendingCases">Pending Cases</Label>
                <Input
                  id="pendingCases"
                  type="number"
                  min="0"
                  value={formData.pendingCases}
                  onChange={(e) => updateFormData("pendingCases", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.pendingCases ? "border-red-500" : ""}
                />
                {errors.pendingCases && <p className="text-sm text-red-500">{errors.pendingCases}</p>}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profilePicture">Profile Picture URL (Optional)</Label>
              <Input
                id="profilePicture"
                value={formData.profilePicture}
                onChange={(e) => updateFormData("profilePicture", e.target.value)}
                placeholder="Enter profile picture URL"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Your Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Clerk User ID:</strong> {formData.userId} {/* Display hidden user ID for review */}
                </div>
                <div>
                  <strong>Name:</strong> {formData.name}
                </div>
                <div>
                  <strong>Email:</strong> {formData.email}
                </div>
                <div>
                  <strong>Phone:</strong> {formData.phoneNumber}
                </div>
                <div>
                  <strong>Bar ID:</strong> {formData.barId}
                </div>
                <div>
                  <strong>Specialties:</strong>{" "}
                  {formData.specialty.map((s) => LAWYER_SPECIALTIES.find((spec) => spec.value === s)?.label).join(", ")}
                </div>
                <div>
                  <strong>Location:</strong> {formData.city}, {formData.state}, {formData.country}
                </div>
                <div>
                  <strong>Total Cases:</strong> {formData.noOfCases}
                </div>
                <div>
                  <strong>Won/Lost/Pending:</strong> {formData.wonCases}/{formData.lostCases}/{formData.pendingCases}
                </div>
                {formData.profilePicture && (
                  <div>
                    <strong>Profile Picture:</strong>{" "}
                    <img src={formData.profilePicture} alt="Profile" className="w-16 h-16 rounded-full inline-block ml-2" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}