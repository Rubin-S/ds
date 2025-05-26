// pages/contact-us.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormDataState {
  firstName: string;
  lastName: string;
  fatherName: string;
  aadharPhoneNumber: string;
  hometownLocation: string;
  bloodGroup: string;
  email: string;
  message: string;
  aadharNumber: string;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const ContactPage = () => {
  const initialFormData: FormDataState = {
    firstName: "",
    lastName: "",
    fatherName: "",
    aadharPhoneNumber: "",
    hometownLocation: "",
    bloodGroup: "",
    email: "",
    message: "",
    aadharNumber: "",
  };

  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [aadharPhoto, setAadharPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  // 'form', 'success', 'error'
  const [pageState, setPageState] = useState<"form" | "success" | "error">(
    "form"
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBloodGroupChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bloodGroup: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAadharPhoto(e.target.files[0]);
    } else {
      setAadharPhoto(null);
    }
  };

  const resetFormAndState = () => {
    setFormData(initialFormData);
    setAadharPhoto(null);
    const photoInput = document.getElementById(
      "aadharPhoto"
    ) as HTMLInputElement;
    if (photoInput) photoInput.value = "";
    setSubmissionError(null);
    setPageState("form");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionError(null);

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.fatherName.trim() ||
      !formData.aadharPhoneNumber.trim() ||
      !formData.hometownLocation.trim() ||
      !formData.bloodGroup.trim()
    ) {
      setSubmissionError(
        "Please fill in all required fields: First Name, Last Name, Father's Name, Phone Number, Hometown, and Blood Group."
      );
      return;
    }

    if (aadharPhoto && formData.aadharNumber.trim()) {
      setSubmissionError(
        "Please provide either an Aadhar card photo or an Aadhar number, not both."
      );
      return;
    }

    setIsSubmitting(true);

    const submissionFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionFormData.append(key, value);
    });

    if (aadharPhoto) {
      submissionFormData.append("aadharPhoto", aadharPhoto);
    }

    try {
      const response = await fetch("/api/contact-submissions", {
        method: "POST",
        body: submissionFormData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Server Error (${response.status})`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.detail || responseText;
        } catch (jsonParseError) {
          errorMessage = responseText.includes("<!DOCTYPE html>")
            ? "Submission endpoint not found or server error."
            : responseText;
        }
        throw new Error(errorMessage);
      }

      // const result = JSON.parse(responseText); // We might not need the result for this UI change
      setPageState("success");
    } catch (err: any) {
      setSubmissionError(
        err.message || "Failed to send submission. Please try again."
      );
      setPageState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageState === "success") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen px-4 py-12 md:px-10 bg-white flex flex-col items-center justify-center text-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-green-500 mb-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Submission Successful!
        </h1>
        <p className="text-muted-foreground mb-8 md:mb-10 max-w-md">
          Thank you for providing your details. We have received your
          submission.
        </p>
        <Button onClick={resetFormAndState} className="w-full md:w-auto">
          Submit Another Response
        </Button>
      </motion.section>
    );
  }

  if (pageState === "error") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen px-4 py-12 md:px-10 bg-white flex flex-col items-center justify-center text-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-red-500 mb-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 101.414-1.414L11.414 10l1.293-1.293a1 1 0 10-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="text-3xl md:text-4xl font-bold text-destructive mb-4">
          Submission Failed
        </h1>
        <p className="text-muted-foreground mb-2 md:mb-3 max-w-md">
          We encountered an issue while submitting your details.
        </p>
        {submissionError && (
          <p className="text-red-700 dark:text-red-500 text-sm mb-6 max-w-md bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
            <strong>Error:</strong> {submissionError}
          </p>
        )}
        <Button onClick={resetFormAndState} className="w-full md:w-auto">
          Try Again
        </Button>
      </motion.section>
    );
  }

  // pageState === 'form'
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-12 md:px-10 bg-white"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
          Submit Your Details
        </h1>
        <p className="text-center text-muted-foreground mb-8 md:mb-10">
          Please provide your information. Fields marked with * are required.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block mb-1 font-medium text-muted-foreground"
              >
                First Name *
              </label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block mb-1 font-medium text-muted-foreground"
              >
                Last Name *
              </label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="fatherName"
              className="block mb-1 font-medium text-muted-foreground"
            >
              Father's Name *
            </label>
            <Input
              id="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Richard Doe"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="aadharPhoneNumber"
                className="block mb-1 font-medium text-muted-foreground"
              >
                Phone (Aadhar Linked) *
              </label>
              <Input
                id="aadharPhoneNumber"
                type="tel"
                value={formData.aadharPhoneNumber}
                onChange={handleChange}
                placeholder="9XXXXXXXXX"
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label
                htmlFor="hometownLocation"
                className="block mb-1 font-medium text-muted-foreground"
              >
                Hometown Location *
              </label>
              <Input
                id="hometownLocation"
                value={formData.hometownLocation}
                onChange={handleChange}
                placeholder="e.g., Salem, Tamil Nadu"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="bloodGroup"
              className="block mb-1 font-medium text-muted-foreground"
            >
              Blood Group *
            </label>
            <Select
              onValueChange={handleBloodGroupChange}
              value={formData.bloodGroup}
              disabled={isSubmitting}
            >
              <SelectTrigger id="bloodGroup">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional Fields */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 font-medium text-muted-foreground"
            >
              Email Address (Optional)
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block mb-1 font-medium text-muted-foreground"
            >
              Message (Optional)
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write any additional information here..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Aadhar Details - Mutually Exclusive */}
          <div className="p-4 border border-dashed rounded-md space-y-4">
            <p className="text-sm text-muted-foreground">
              Provide Aadhar details (Optional): You can upload a photo of your
              Aadhar card OR enter your Aadhar number. Please provide only one.
            </p>
            <div>
              <label
                htmlFor="aadharPhoto"
                className="block mb-1 font-medium text-muted-foreground"
              >
                Aadhar Card Photo (Optional)
              </label>
              <Input
                id="aadharPhoto"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isSubmitting || !!formData.aadharNumber.trim()}
              />
              {aadharPhoto && (
                <p className="text-xs mt-1 text-muted-foreground">
                  Selected: {aadharPhoto.name}
                </p>
              )}
            </div>

            <div className="text-center my-2 text-sm font-medium text-muted-foreground">
              OR
            </div>

            <div>
              <label
                htmlFor="aadharNumber"
                className="block mb-1 font-medium text-muted-foreground"
              >
                Aadhar Card Number (Optional)
              </label>
              <Input
                id="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                placeholder="XXXX XXXX XXXX"
                disabled={isSubmitting || !!aadharPhoto}
              />
            </div>
          </div>

          {/* Display client-side validation error for required fields etc. before submitting */}
          {submissionError && pageState === "form" && (
            <p className="text-red-600 text-sm">{submissionError}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Submit Details"}
          </Button>
        </form>

        <div className="mt-12 md:mt-16 text-center text-muted-foreground text-xs md:text-sm">
          <p>For inquiries, you can also contact:</p>
          <p>Phone: +91 9443091530</p>
          <p>Email: rubinsenthil@gmail.com</p>
          <p>
            Address: 17, Udhayamampattu Rd, Thiyagadurgam, Tamil Nadu 606206
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactPage;
