import { render, screen } from '@testing-library/react';
import QuizFeedback from '@/components/dashboard/QuizFeedback';
import type { GradingOutput } from '@/types/schemas';

const grading: GradingOutput = {
  quiz_id: 'q-01',
  score: 80,
  feedback: [
    { q: 'What is a p-value?', your_answer: 1, correct: 1, is_correct: true, explanation: 'Correct!' },
    { q: 'Which measure is robust?', your_answer: 0, correct: 2, is_correct: false, explanation: 'Wrong.' },
  ],
};

test('renders quiz score percentage', () => {
  render(<QuizFeedback grading={grading} />);
  expect(screen.getByText('80%')).toBeInTheDocument();
});

test('renders correct tally', () => {
  render(<QuizFeedback grading={grading} />);
  expect(screen.getByText('1 / 2 correct')).toBeInTheDocument();
});

test('renders question text', () => {
  render(<QuizFeedback grading={grading} />);
  expect(screen.getByText('What is a p-value?')).toBeInTheDocument();
});

test('renders explanation for incorrect answer', () => {
  render(<QuizFeedback grading={grading} />);
  expect(screen.getByText('Wrong.')).toBeInTheDocument();
});
