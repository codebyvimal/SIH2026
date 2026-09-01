interface AdminTopCoursesProps {
  courses: string[];
}

export default function AdminTopCourses({ courses }: AdminTopCoursesProps) {
  return (
    <div className="divide-y divide-slate-100">
      {courses.map((course, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{course}</p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Trending
          </span>
        </div>
      ))}
    </div>
  );
}
