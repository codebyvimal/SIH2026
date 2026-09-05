"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QuizFeedback from "@/components/dashboard/QuizFeedback";
import type { GradingOutput } from "@/types/schemas";
import NavBar from "@/components/NavBar";

export default function ResultsPage({ params }: { params: { quiz_id: string } }) {
  const { quiz_id } = params;
  const router = useRouter();
  const [result, setResult] = useState<GradingOutput | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem(`gradingResult_${quiz_id}`);
    if (data) {
      try {
        setResult(JSON.parse(data));
      } catch (err) {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [quiz_id]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 font-sans">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold mb-4">Results not found</h1>
          <p className="text-slate-500 mb-6">Could not load the results for this quiz.</p>
          <button
            onClick={() => router.push("/assessment")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Assessment
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <NavBar 
        variant="employee" 
        navItems={[]}
        
        
      />

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Assessment Results
          </h1>
          <p className="text-slate-500 mt-2">
            Review your performance and detailed explanations for each question.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <QuizFeedback grading={result} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-end">
          <Link
            href="/dashboard/employee"
            className="px-6 py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors w-full sm:w-auto text-center"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/assessment"
            className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transition-all w-full sm:w-auto text-center"
          >
            Take Another Quiz
          </Link>
        </div>
      </main>
    </div>
  );
}
