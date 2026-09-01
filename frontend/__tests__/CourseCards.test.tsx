import { render, screen } from '@testing-library/react';
import CourseCards from '@/components/dashboard/CourseCards';
import type { RecommendedCourse } from '@/types/schemas';

const courses: RecommendedCourse[] = [
  { course: 'Advanced Python Analytics', course_id: 'c-101', relevance: 0.95, why: 'Great match.' },
];

test('renders course title', () => {
  render(<CourseCards courses={courses} />);
  expect(screen.getByText('Advanced Python Analytics')).toBeInTheDocument();
});

test('renders why text', () => {
  render(<CourseCards courses={courses} />);
  expect(screen.getByText('Great match.')).toBeInTheDocument();
});

test('renders rank badge', () => {
  render(<CourseCards courses={courses} />);
  expect(screen.getByText('#1')).toBeInTheDocument();
});
