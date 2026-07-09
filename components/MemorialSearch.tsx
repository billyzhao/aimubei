"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const relationshipOptions = ["父母", "配偶", "子女", "师友", "战友", "恩师", "其他"];
const regionOptions = ["华北", "东北", "华东", "华中", "华南", "西南", "西北", "港澳台", "海外", "其他"];

export default function MemorialSearch({
  initialQuery = "",
  initialYear = "",
  initialRelationship = "",
  initialRegion = "",
  initialSort = "newest",
}: {
  initialQuery?: string;
  initialYear?: string;
  initialRelationship?: string;
  initialRegion?: string;
  initialSort?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [year, setYear] = useState(initialYear);
  const [relationship, setRelationship] = useState(initialRelationship);
  const [region, setRegion] = useState(initialRegion);
  const [sort, setSort] = useState(initialSort);

  const buildQs = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (year.trim() && /^\d{4}$/.test(year.trim())) params.set("year", year.trim());
    if (relationship) params.set("relationship", relationship);
    if (region) params.set("region", region);
    if (sort && sort !== "newest") params.set("sort", sort);
    return params.toString();
  };

  const applyFilters = () => {
    const qs = buildQs();
    router.push(`/memorials${qs ? `?${qs}` : ""}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleReset = () => {
    setQuery("");
    setYear("");
    setRelationship("");
    setRegion("");
    setSort("newest");
    router.push("/memorials");
  };

  const hasFilter =
    query.trim() || year.trim() || relationship || region || (sort && sort !== "newest");

  const selectCls =
    "bg-midnight-700/60 text-mist-200 rounded-xl px-3 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors";

  return (
    <div className="space-y-3">
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

      {/* Filters: relationship / region / sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={relationship}
          onChange={(e) => {
            setRelationship(e.target.value);
            setTimeout(applyFilters, 0);
          }}
          className={`${selectCls} flex-1`}
        >
          <option value="">关系类型（全部）</option>
          {relationshipOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setTimeout(applyFilters, 0);
          }}
          className={`${selectCls} flex-1`}
        >
          <option value="">地区（全部）</option>
          {regionOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setTimeout(applyFilters, 0);
          }}
          className={`${selectCls} sm:w-40`}
        >
          <option value="newest">最新创建</option>
          <option value="popular">最热门</option>
          <option value="tributes">最多祭奠</option>
        </select>
      </div>
    </div>
  );
}
