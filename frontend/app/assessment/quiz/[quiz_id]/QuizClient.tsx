'use client';

import { useState } from 'react';
import { API_BASE } from "@/lib/config";
import { useRouter } from 'next/navigation';
import type { AssessmentOutput, GradingOutput } from '@/types/schemas';

interface QuizClientProps {
  quiz: AssessmentOutput;
  officialId?: string | null;
}

export default function QuizClient({ quiz, officialId }: QuizClientProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalQuestions = quiz.questions.length;
  const question = quiz.questions[currentIdx];

  const handleSelect = (optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      let result: GradingOutput;
      
      try {
        const res = await fetch(`${API_BASE}/grading`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quiz.quiz_id,
            answers,
            official_id: officialId,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to submit grading');
        }
        result = await res.json();
      } catch (err) {
        console.warn('[QuizClient] fetch grading failed, using mock grading', err);
        let correctCount = 0;
        const feedback = quiz.questions.map((q, i) => {
          const is_correct = answers[i] === q.correct;
          if (is_correct) correctCount++;
          return {
            q: q.q,
            your_answer: answers[i] ?? -1,
            correct: q.correct,
            is_correct,
            explanation: q.explanation,
          };
        });
        
        result = {
          quiz_id: quiz.quiz_id,
          score: (correctCount / quiz.questions.length) * 100,
          feedback,
        };
      }
      
      sessionStorage.setItem(`gradingResult_${quiz.quiz_id}`, JSON.stringify(result));
      
      const queryParams = officialId ? `?official_id=${officialId}` : '';
      router.push(`/assessment/results/${quiz.quiz_id}${queryParams}`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error submitting quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isCurrentAnswered = answers[currentIdx] !== undefined;
  const isAllAnswered = Object.keys(answers).length === totalQuestions;
  const unansweredCount = totalQuestions - Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gov-bg flex flex-col font-montserrat text-gray-800">
      <div className="bg-gov-blue text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Skill Assessment</h1>
            <p className="text-sm text-blue-200 mt-1">Source: {quiz.source_filename}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm font-semibold bg-white/20 px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
              Question {currentIdx + 1} of {totalQuestions}
            </div>
            {unansweredCount > 0 ? (
              <p className="text-xs text-blue-200 mt-2 tracking-wide uppercase font-medium">
                {unansweredCount} remaining
              </p>
            ) : (
              <p className="text-xs text-green-300 mt-2 tracking-wide uppercase font-bold flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All Answered
              </p>
            )}
          </div>
        </div>
        
        {/* Progress Bar in Header */}
        <div className="w-full h-1.5 bg-gov-blue-dark">
          <div 
            className="h-full bg-gov-gold transition-all duration-500 ease-out"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between shadow-sm">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 text-lg font-bold">
              &times;
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-10 mb-8 flex flex-col justify-center min-h-[350px]">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {question.q}
          </h2>

          <div className="space-y-4">
            {question.options.map((opt, idx) => {
              const isSelected = answers[currentIdx] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group flex items-center gap-4
                    ${isSelected 
                      ? 'bg-blue-50 border-gov-blue shadow-sm' 
                      : 'bg-white border-gray-200 hover:border-gov-blue/50 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors shadow-sm
                    ${isSelected 
                      ? 'bg-gov-blue text-white' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`flex-1 text-base ${isSelected ? 'text-gov-blue font-semibold' : 'text-gray-700'}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <button
            onClick={handlePrevious}
            disabled={currentIdx === 0 || isSubmitting}
            className="px-6 py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            &larr; Previous
          </button>

          {currentIdx < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              className="px-8 py-3 rounded-xl font-bold text-sm bg-gov-blue text-white hover:bg-gov-blue-dark shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              Next &rarr;
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered || isSubmitting}
              className="px-8 py-3 rounded-xl font-bold text-sm bg-gov-green text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit Assessment &rarr;</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
