"use client";

import React, { useState, useRef } from "react";
import { API_BASE } from "@/lib/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function AssessmentUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      validateAndSetFile(selectedFiles[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please upload a valid PDF file.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    

    try {
      const res = await fetch(`${API_BASE}/assessment`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          // Ignore JSON parse error if response is not JSON
        }

        // Handle specific ValueError case from backend for scanned PDFs
        const errorMessage =
          errorData?.detail || errorData?.message || res.statusText;
        if (
          typeof errorMessage === "string" &&
          (errorMessage.toLowerCase().includes("valueerror") ||
            errorMessage.toLowerCase().includes("no text"))
        ) {
          throw new Error(
            "This PDF appears to be scanned/image-only — please upload a text-based PDF.",
          );
        }

        if (typeof errorMessage === "object" && Array.isArray(errorMessage)) {
          // Handle FastAPI validation error structure occasionally sent as detail array
          const msg = errorMessage[0]?.msg || JSON.stringify(errorMessage);
          if (
            msg.toLowerCase().includes("valueerror") ||
            msg.toLowerCase().includes("no text")
          ) {
            throw new Error(
              "This PDF appears to be scanned/image-only — please upload a text-based PDF.",
            );
          }
        }

        throw new Error(
          typeof errorMessage === "string"
            ? errorMessage
            : errorData?.detail ||
                errorData?.message ||
                "Failed to generate quiz. Please try again.",
        );
      }

      const data = await res.json();

      // Store the quiz data in sessionStorage to pass it to the next page
      sessionStorage.setItem(`quizData_${data.quiz_id}`, JSON.stringify(data));

      // Navigate to the quiz page
      router.push(`/assessment/quiz/${data.quiz_id}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Navigation Bar (Simplified version of Employee Dashboard nav) */}
      <NavBar 
        variant="employee" 
        navItems={[
    { label: "My Dashboard", href: "/dashboard/employee" },
    { label: "Upload PDF", href: "/assessment", active: true }
  ]}
        
        
      />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-10 text-center border-b border-slate-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <svg
                className="h-8 w-8 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
                <path d="M10 9H8"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Upload Material for Assessment
            </h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Upload a training manual, policy document, or guidelines as a PDF.
              AI will analyze the content and generate a tailored quiz.
            </p>
          </div>

          <div className="p-8">
            <div
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : file
                    ? "border-emerald-500 bg-emerald-50/30"
                    : "border-slate-300 bg-slate-50 hover:bg-slate-100"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
              />

              {file ? (
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <p className="font-semibold text-slate-800 text-lg mb-1">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <svg
                    className="h-10 w-10 text-slate-400 mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="text-slate-700 font-medium mb-1">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-slate-500 text-sm mb-4">
                    or click to browse your files
                  </p>
                  <span className="inline-block bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    Select PDF
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-800">
                    Upload Failed
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!file || isLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold shadow-sm transition-all ${
                  !file || isLoading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Quiz (Gemini AI)...
                  </>
                ) : (
                  <>
                    Generate Quiz
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </div>

            {isLoading && (
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden relative">
                  <div
                    className="bg-blue-600 h-2 rounded-full absolute top-0 left-0 animate-[progress_2s_ease-in-out_infinite]"
                    style={{ width: "50%" }}
                  ></div>
                </div>
                <p className="text-xs text-center text-slate-500 animate-pulse">
                  Analyzing document contents and generating questions. This may
                  take a few seconds...
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Required for the progress bar animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `,
        }}
      />
    </div>
  );
}
