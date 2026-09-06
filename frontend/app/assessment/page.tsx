'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from "@/lib/config";
import NavBar from '@/components/NavBar';

export default function AssessmentUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/assessment`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to generate assessment. Please try again.");
      
      const data = await res.json();
      router.push(`/assessment/quiz/${data.quiz_id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <NavBar />
      
      <main className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 border-b border-gray-100 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-50 text-[#264092] flex items-center justify-center rounded-xl mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Material for Assessment</h1>
            <p className="text-gray-500 text-sm">Upload a training manual, policy document, or guidelines (PDF). AI will analyze the content and generate a tailored quiz.</p>
          </div>

          {/* Upload Area */}
          <div className="p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging ? 'border-[#264092] bg-blue-50/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf" className="hidden" />
              
              <svg className={`w-10 h-10 mb-4 ${isDragging ? 'text-[#264092]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700"><span className="text-[#264092] font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF documents only</p>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-sm font-medium mt-4 text-center">{error}</p>}
            
            {isUploading && (
              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-[#264092]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <div>
                  <p className="text-sm font-semibold text-[#264092]">Generating your quiz...</p>
                  <p className="text-xs text-blue-600/80">AI is analyzing the document.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#264092] hover:bg-[#1e3477] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
