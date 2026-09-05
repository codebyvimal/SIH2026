'use client';

import { useState } from 'react';
import { API_BASE } from "@/lib/config";
import { useRouter } from 'next/navigation';
import type { AssessmentOutput, GradingOutput } from '@/types/schemas';

interface QuizClientProps {
  quiz: AssessmentOutput;
}

export default function QuizClient({ quiz }: QuizClientProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      
      let result: GradingOutput;
      
      try {
        const res = await fetch(`${API_BASE}/grading`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quiz.quiz_id,
            answers,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to submit grading');
        }
        result = await res.json();
      } catch (err) {
        console.warn('[QuizClient] fetch grading failed, using mock grading', err);
        // Fallback mock grading
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
      
      // Store result in sessionStorage so the results page can retrieve it instantly
      sessionStorage.setItem(`gradingResult_${quiz.quiz_id}`, JSON.stringify(result));
      
      router.push(`/assessment/results/${quiz.quiz_id}`);
    } catch (err) {
      console.error(err);
      alert('Error submitting quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isCurrentAnswered = answers[currentIdx] !== undefined;
  const isAllAnswered = Object.keys(answers).length === totalQuestions;
  const unansweredCount = totalQuestions - Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden text-slate-100">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Skill Assessment</h1>
            <p className="text-sm text-slate-400 mt-1 font-mono">Source: {quiz.source_filename}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Question {currentIdx + 1} of {totalQuestions}
            </div>
            {unansweredCount > 0 ? (
              <p className="text-[10px] text-slate-400 mt-2 tracking-wide uppercase">
                {unansweredCount} remaining
              </p>
            ) : (
              <p className="text-[10px] text-emerald-400 mt-2 tracking-wide uppercase">
                All Answered
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mb-10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50 mb-8 min-h-[300px] flex flex-col justify-center">
          <h2 className="text-xl md:text-2xl font-medium text-slate-100 mb-8 leading-snug">
            {question.q}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isSelected = answers[currentIdx] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group flex items-center gap-4
                    ${isSelected 
                      ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-500'
                    }
                  `}
                >
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-colors
                    ${isSelected 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-slate-900 border-slate-600 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`flex-1 text-[15px] ${isSelected ? 'text-blue-100 font-medium' : 'text-slate-300'}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation / Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIdx === 0 || isSubmitting}
            className="px-6 py-3 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            &larr; Previous
          </button>

          {currentIdx < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              className="px-8 py-3 rounded-xl font-semibold text-sm bg-white text-slate-900 hover:bg-slate-200 shadow-lg shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              Next &rarr;
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered || isSubmitting}
              className="px-8 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center gap-2"
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
