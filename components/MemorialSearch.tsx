"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MemorialSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    router.push(`/memorials${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索纪念馆..."
          className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
        />
      </div>
      <button
        type="submit"
        className="btn-primary text-sm py-2.5 px-6 whitespace-nowrap"
      >
        🔍 搜索
      </button>
    </form>
  );
}
