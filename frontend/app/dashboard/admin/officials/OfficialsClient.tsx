"use client";

import { useState } from "react";
import Link from "next/link";
import { OfficialSummary } from "@/lib/api";

export default function OfficialsClient({ officials }: { officials: OfficialSummary[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = officials.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.role.toLowerCase().includes(term) ||
      o.dept.toLowerCase().includes(term)
    );
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Directory</h3>
        <input
          type="text"
          placeholder="Filter by role or department..."
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-72"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Officer ID</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Education</th>
              <th className="px-6 py-4 font-medium text-right">Experience</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <tr key={o.official_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">
                    <Link
                      href={`/dashboard/employee?official_id=${o.official_id}`}
                      className="text-amber-600 hover:text-amber-700 hover:underline font-semibold"
                    >
                      {o.official_id.split("-")[0]}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{o.role}</td>
                  <td className="px-6 py-4">{o.dept}</td>
                  <td className="px-6 py-4">{o.education}</td>
                  <td className="px-6 py-4 text-right">{o.experience_years} yrs</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  No officials found matching &quot;{searchTerm}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
