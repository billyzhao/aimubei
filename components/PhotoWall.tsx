"use client";

import { useState } from "react";

interface PhotoWallProps {
  photos: string[];
}

export default function PhotoWall({ photos }: PhotoWallProps) {
  const [selected, setSelected] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📸</div>
        <p className="text-mist-400 text-sm">暂无照片</p>
        <p className="text-mist-400/60 text-xs mt-1">
          纪念馆创建者可以在编辑页面上传照片
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            className="aspect-square glass-card overflow-hidden cursor-pointer group hover:glow-border transition-all duration-300"
          >
            <img
              src={photo}
              alt={`照片 ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-midnight-800/80 text-white text-xl flex items-center justify-center hover:bg-midnight-700 transition-colors"
            onClick={() => setSelected(null)}
          >
            ✕
          </button>

          {selected > 0 && (
            <button
              className="absolute left-6 w-12 h-12 rounded-full bg-midnight-800/80 text-white text-xl flex items-center justify-center hover:bg-midnight-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(selected - 1);
              }}
            >
              ←
            </button>
          )}

          <img
            src={photos[selected]}
            alt={`照片 ${selected + 1}`}
            className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {selected < photos.length - 1 && (
            <button
              className="absolute right-6 w-12 h-12 rounded-full bg-midnight-800/80 text-white text-xl flex items-center justify-center hover:bg-midnight-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(selected + 1);
              }}
            >
              →
            </button>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-mist-400">
            {selected + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
