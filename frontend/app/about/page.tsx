import NavBar from '@/components/NavBar';
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/70 backdrop-blur-md m-8 rounded-3xl border border-white shadow-xl">
        <h1 className="text-4xl font-bold text-[#102868] mb-4">About Us</h1>
        <p className="text-gray-700 font-medium max-w-lg">Learn more about the National Learning Portal and our mission to strengthen statistical capacity. This feature is currently under development.</p>
      </main>
    </div>
  );
}
