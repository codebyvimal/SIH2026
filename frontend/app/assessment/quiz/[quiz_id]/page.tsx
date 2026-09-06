import { fetchQuiz } from '@/lib/api';
import { notFound } from 'next/navigation';
import QuizClient from './QuizClient';

export default async function QuizPage({ params, searchParams }: { params: { quiz_id: string }, searchParams?: { official_id?: string } }) {
  const { quiz_id } = params;
  const officialId = searchParams?.official_id;

  try {
    const quiz = await fetchQuiz(quiz_id);
    return <QuizClient quiz={quiz} officialId={officialId} />;
  } catch (err) {
    console.error(err);
    notFound();
  }
}
