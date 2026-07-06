"use client";

import { useEffect, useState } from "react";

// Generic skeleton pulse
function Pulse({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse bg-midnight-700/60 rounded-lg ${className}`}
    />
  );
}

// Memorial page skeleton
export function MemorialSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative h-[60vh] min-h-[400px] bg-midnight-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-900/80 to-midnight-950/95" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-12 px-6">
          <Pulse className="w-24 h-24 rounded-full mb-4" />
          <Pulse className="w-48 h-8 mb-2" />
          <Pulse className="w-32 h-4 mb-6" />
          <div className="flex gap-3">
            <Pulse className="w-20 h-8 rounded-full" />
            <Pulse className="w-20 h-8 rounded-full" />
            <Pulse className="w-20 h-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Pulse className="w-40 h-6 mb-6" />
        <Pulse className="w-full h-4 mb-2" />
        <Pulse className="w-full h-4 mb-2" />
        <Pulse className="w-3/4 h-4 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Pulse className="h-24 rounded-xl" />
          <Pulse className="h-24 rounded-xl" />
          <Pulse className="h-24 rounded-xl" />
        </div>

        <Pulse className="w-32 h-6 mb-4" />
        <div className="space-y-3">
          <Pulse className="w-full h-16 rounded-lg" />
          <Pulse className="w-full h-16 rounded-lg" />
          <Pulse className="w-full h-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen px-6 md:px-12 py-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Pulse className="w-40 h-7 mb-2" />
          <Pulse className="w-60 h-4" />
        </div>
        <Pulse className="w-28 h-10 rounded-xl" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5">
            <Pulse className="w-12 h-12 rounded-xl mb-3" />
            <Pulse className="w-16 h-4 mb-1" />
            <Pulse className="w-10 h-6" />
          </div>
        ))}
      </div>

      {/* Memorial cards skeleton */}
      <Pulse className="w-32 h-6 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <Pulse className="w-14 h-14 rounded-xl" />
              <div className="flex-1">
                <Pulse className="w-28 h-5 mb-1" />
                <Pulse className="w-20 h-3" />
              </div>
            </div>
            <Pulse className="w-full h-3 mb-2" />
            <Pulse className="w-3/4 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Homepage hero skeleton (instant flash prevention)
export function HeroSkeleton() {
  return (
    <div className="relative flex-1 flex items-center justify-center pt-16 overflow-hidden min-h-[70vh]">
      <div className="absolute inset-0 starfield opacity-40" />
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-20">
        <Pulse className="w-20 h-20 rounded-full mx-auto mb-8" />
        <Pulse className="w-64 h-10 mx-auto mb-4" />
        <Pulse className="w-80 h-4 mx-auto mb-2" />
        <Pulse className="w-72 h-4 mx-auto mb-8" />
        <div className="flex gap-4 justify-center">
          <Pulse className="w-36 h-12 rounded-xl" />
          <Pulse className="w-36 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
