import type { GradingOutput } from '@/types/schemas';

interface QuizFeedbackProps {
  grading: GradingOutput;
}

export default function QuizFeedback({ grading }: QuizFeedbackProps) {
  const correct = grading.feedback.filter((f) => f.is_correct).length;
  const total = grading.feedback.length;
  const scoreColor =
    grading.score >= 80 ? 'text-emerald-500'
    : grading.score >= 50 ? 'text-amber-500'
    : 'text-rose-500';
  const circumference = 2 * Math.PI * 32; // r=32

  return (
    <div className="space-y-6">
      {/* Score ring */}
      <div className="flex items-center gap-6 border-b border-slate-100 pb-5">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" width="80" height="80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(grading.score / 100) * circumference} ${circumference}`}
              className={scoreColor}
            />
          </svg>
          <span className={`text-lg font-bold tabular-nums ${scoreColor}`}>
            {grading.score.toFixed(0)}%
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{correct} / {total} Correct</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Quiz ID: {grading.quiz_id}</p>
        </div>
      </div>

      {/* Per-question feedback */}
      <div className="space-y-3">
        {grading.feedback.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 text-sm ${
              item.is_correct
                ? 'border-emerald-100 bg-emerald-50/50'
                : 'border-rose-100 bg-rose-50/50'
            }`}
          >
            <div className="mb-1 flex items-start gap-2">
              <span className={`mt-0.5 text-base leading-none font-bold ${item.is_correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                {item.is_correct ? '\u2713' : '\u2717'}
              </span>
              <p className="font-semibold text-slate-800 leading-snug">{item.q}</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
