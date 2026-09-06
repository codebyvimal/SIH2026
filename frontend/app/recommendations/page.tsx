import { fetchEmployeeDashboard } from "@/lib/api";
import { API_BASE } from "@/lib/config";
import RecommendationsClient from "./RecommendationsClient";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import type { RecommendedCourse } from "@/types/schemas";

type EnhancedCourse = RecommendedCourse & { domain: string; gap_skill: string };

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams?: { official_id?: string };
}) {
  const officialId = searchParams?.official_id;
  const data = await fetchEmployeeDashboard(officialId);
  
  const gaps = data.payload.gaps.filter((g) => g.gap > 0);
  
  let allRecommendations: EnhancedCourse[] = [];
  try {
    const promises = gaps.map(async (gap) => {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gap_skill: gap.skill, gap_size: gap.gap }),
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        return json.recommended.map((r: RecommendedCourse) => ({ ...r, domain: gap.domain, gap_skill: gap.skill }));
      }
      return [];
    });
    const results = await Promise.all(promises);
    allRecommendations = results.flat();
  } catch (err) {
    console.error("Failed to fetch all recommendations from backend, using fallback", err);
  }

  if (allRecommendations.length === 0) {
    // Fallback if backend /recommend fails
    allRecommendations = data.payload.recommended.map(r => {
      const domainMatch = r.why.match(/\(([^)]+)\)/);
      let domainStr = domainMatch ? domainMatch[1].toLowerCase().replace(/ /g, "_") : (gaps[0]?.domain || "unknown");
      return {
        ...r, 
        domain: domainStr,
        gap_skill: gaps[0]?.skill || "General"
      }
    });
  }
  
  const uniqueRecs: EnhancedCourse[] = [];
  const seen = new Set();
  for (const rec of allRecommendations) {
    if (!seen.has(rec.course_id)) {
      seen.add(rec.course_id);
      uniqueRecs.push(rec);
    }
  }

  return (
    <div className="min-h-screen bg-gov-bg font-montserrat text-gray-800">
      <NavBar />

      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gov-blue tracking-tight">Full Course Recommendations</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Explore all targeted learning paths derived from your current skill gaps. These recommendations are specifically curated to bridge your competency requirements.
          </p>
        </header>

        <RecommendationsClient 
          officialId={data.payload.official_id} 
          recommendations={uniqueRecs} 
        />
      </main>
    </div>
  );
}
