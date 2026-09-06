import type { GradingOutput } from '@/types/schemas';

interface QuizFeedbackProps {
  grading: GradingOutput;
}

export default function QuizFeedback({ grading }: QuizFeedbackProps) {
  return (
    <div className="space-y-4">
      {/* Per-question feedback */}
      <div className="space-y-4">
        {grading.feedback.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border p-5 ${
              item.is_correct
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="mb-2 flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-white ${item.is_correct ? 'bg-gov-green' : 'bg-gov-red'}`}>
                {item.is_correct ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <p className="font-semibold text-gray-800 leading-snug">{item.q}</p>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-gov-blue rounded-r-xl p-3 mt-3 text-sm text-blue-800 ml-9">
              <span className="font-bold text-gov-blue mr-2">Explanation:</span>
              {item.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
