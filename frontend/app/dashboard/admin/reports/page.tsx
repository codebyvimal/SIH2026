export default function PlaceholderPage() {
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#102868]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">System Reports & Analytics</h1>
      <p className="text-gray-600 font-medium max-w-lg">This module is actively being developed. Soon you will be able to view a detailed breakdown of all your skills and assessments.</p>
    </div>
  );
}
