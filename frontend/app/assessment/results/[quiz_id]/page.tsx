"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import QuizFeedback from "@/components/dashboard/QuizFeedback";
import type { GradingOutput } from "@/types/schemas";
import NavBar from "@/components/NavBar";
import { API_BASE } from "@/lib/config";

function ResultsContent({ quiz_id }: { quiz_id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const officialId = searchParams.get('official_id');

  const [result, setResult] = useState<GradingOutput | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      const data = sessionStorage.getItem(`gradingResult_${quiz_id}`);
      if (data) {
        try {
          setResult(JSON.parse(data));
          return;
        } catch (err) {
          console.error(err);
        }
      }

      if (officialId) {
        try {
          const res = await fetch(`${API_BASE}/grading/${quiz_id}/${officialId}`);
          if (res.ok) {
            const json = await res.json();
            setResult(json);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }

      setError(true);
    };

    fetchResult();
  }, [quiz_id, officialId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gov-bg flex items-center justify-center text-gray-800 font-montserrat">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold mb-4 text-gov-blue">Results not found</h1>
          <p className="text-gray-500 mb-6">Could not load the results for this quiz.</p>
          <button
            onClick={() => router.push("/assessment")}
            className="px-6 py-3 bg-gov-blue text-white font-bold rounded-xl hover:bg-gov-blue-dark transition-colors shadow-sm"
          >
            Back to Assessment
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gov-bg flex items-center justify-center font-montserrat">
        <div className="w-10 h-10 border-4 border-gov-blue/30 border-t-gov-blue rounded-full animate-spin" />
      </div>
    );
  }

  const getGrade = (score: number) => {
    if (score >= 90) return { letter: 'A', color: 'bg-blue-50 text-gov-blue border-gov-blue' };
    if (score >= 80) return { letter: 'B', color: 'bg-green-50 text-gov-green border-gov-green' };
    if (score >= 70) return { letter: 'C', color: 'bg-yellow-50 text-yellow-600 border-yellow-500' };
    if (score >= 60) return { letter: 'D', color: 'bg-orange-50 text-saffron border-saffron' };
    return { letter: 'F', color: 'bg-red-50 text-gov-red border-gov-red' };
  };

  const grade = getGrade(result.score);

  return (
    <div className="min-h-screen bg-gov-bg flex flex-col font-montserrat text-gray-800">
      <NavBar />

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gov-blue">
              Assessment Results
            </h1>
            <p className="text-gray-500 mt-2">
              Review your performance and detailed explanations for each question.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl font-bold shadow-sm ${grade.color}`}>
              {grade.letter}
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-800">Score: {Math.round(result.score)}%</h2>
              <p className="text-gray-500 mt-1 font-medium">Based on {result.feedback.length} questions</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <QuizFeedback grading={result} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-end mt-8 mb-12">
          <Link
            href={officialId ? `/dashboard/employee?official_id=${officialId}` : "/dashboard/employee"}
            className="px-6 py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors w-full sm:w-auto text-center"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/assessment"
            className="px-8 py-3 rounded-xl font-bold text-sm bg-gov-blue text-white hover:bg-gov-blue-dark shadow-md transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2"
          >
            Take Another Quiz &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage({ params }: { params: { quiz_id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gov-bg flex items-center justify-center"><div className="w-10 h-10 border-4 border-gov-blue/30 border-t-gov-blue rounded-full animate-spin" /></div>}>
      <ResultsContent quiz_id={params.quiz_id} />
    </Suspense>
  );
}
