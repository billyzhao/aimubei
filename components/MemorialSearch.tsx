"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MemorialSearch({
  initialQuery = "",
  initialYear = "",
}: {
  initialQuery?: string;
  initialYear?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [year, setYear] = useState(initialYear);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (year.trim() && /^\d{4}$/.test(year.trim())) params.set("year", year.trim());
    const qs = params.toString();
    router.push(`/memorials${qs ? `?${qs}` : ""}`);
  };

  const handleReset = () => {
    setQuery("");
    setYear("");
    router.push("/memorials");
  };

  const hasFilter = query.trim() || year.trim();

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center">
      <div className="flex-1 w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索姓名、关键词或年代（如 1950）..."
          className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
        />
      </div>
      <div className="w-full md:w-36">
        <input
          type="text"
          inputMode="numeric"
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
          placeholder="生卒年"
          className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
        />
      </div>
      <button type="submit" className="btn-primary text-sm py-2.5 px-6 whitespace-nowrap">
        🔍 搜索
      </button>
      {hasFilter && (
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-mist-400 hover:text-white transition-colors whitespace-nowrap px-2"
        >
          清除
        </button>
      )}
    </form>
  );
}
