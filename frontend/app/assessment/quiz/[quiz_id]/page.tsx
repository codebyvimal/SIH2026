import { fetchQuiz } from '@/lib/api';
import { notFound } from 'next/navigation';
import QuizClient from './QuizClient';

export default async function QuizPage({ params }: { params: { quiz_id: string } }) {
  const { quiz_id } = params;

  try {
    const quiz = await fetchQuiz(quiz_id);
    return <QuizClient quiz={quiz} />;
  } catch (err) {
    console.error(err);
    notFound();
  }
}
