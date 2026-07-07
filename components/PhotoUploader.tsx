"use client";

import { useState, useRef, useCallback } from "react";

interface UploadedPhoto {
  url: string;
  caption?: string;
}

interface PhotoUploaderProps {
  memorialSlug?: string;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  onAvatarSet?: (url: string) => void;
  maxPhotos?: number;
}

export default function PhotoUploader({
  memorialSlug,
  photos,
  onPhotosChange,
  onAvatarSet,
  maxPhotos = 20,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      if (photos.length + fileArray.length > maxPhotos) {
        setError(`最多只能上传 ${maxPhotos} 张照片`);
        return;
      }

      const invalid = fileArray.filter(
        (f) => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)
      );
      if (invalid.length > 0) {
        setError("仅支持 JPG、PNG、WebP、GIF 格式");
        return;
      }

      const oversize = fileArray.filter((f) => f.size > 10 * 1024 * 1024);
      if (oversize.length > 0) {
        setError("单张照片不能超过 10MB");
        return;
      }

      setError("");
      setUploading(true);

      try {
        const newUrls: string[] = [];

        for (const file of fileArray) {
          const formData = new FormData();
          formData.append("file", file);

          if (memorialSlug) {
            formData.append("memorialSlug", memorialSlug);
          }

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "上传失败");
          }

          const data = await res.json();
          newUrls.push(data.url);

          // 第一张照片自动设为头像
          if (photos.length === 0 && newUrls.length === 1 && onAvatarSet) {
            onAvatarSet(data.url);
            setAvatarUrl(data.url);
          }
        }

        onPhotosChange([...photos, ...newUrls]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "上传失败");
      } finally {
        setUploading(false);
      }
    },
    [photos, memorialSlug, onPhotosChange, onAvatarSet, maxPhotos]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  const handleRemove = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    if (avatarUrl === photos[index]) {
      setAvatarUrl(newPhotos[0] || null);
      if (onAvatarSet) onAvatarSet(newPhotos[0] || "");
    }
  };

  const handleSetAvatar = (url: string) => {
    setAvatarUrl(url);
    if (onAvatarSet) onAvatarSet(url);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? "border-amethyst-500/60 bg-amethyst-500/10 scale-[1.02]"
            : "border-amethyst-500/20 hover:border-amethyst-500/40 hover:bg-amethyst-500/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleUpload(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-amethyst-500/30 border-t-amethyst-500 rounded-full animate-spin" />
            <p className="text-sm text-mist-300">上传中...</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-3">📸</div>
            <p className="text-sm text-mist-200 font-medium mb-1">
              点击或拖拽上传照片
            </p>
            <p className="text-xs text-mist-400">
              支持 JPG、PNG、WebP、GIF，单张不超过 10MB
            </p>
            <p className="text-xs text-mist-400 mt-1">
              已上传 {photos.length}/{maxPhotos} 张
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {photos.map((url, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-xl overflow-hidden bg-midnight-800 border border-amethyst-500/15"
            >
              <img
                src={url}
                alt={`照片 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <div className="flex items-center justify-between">
                  {index === 0 || avatarUrl === url ? (
                    <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-xs text-gold-300 border border-gold-500/30">
                      头像
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetAvatar(url);
                      }}
                      className="px-2 py-0.5 rounded-full bg-amethyst-500/20 text-xs text-amethyst-300 border border-amethyst-500/30 hover:bg-amethyst-500/30 transition-colors"
                    >
                      设为头像
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs hover:bg-rose-500/40 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {/* First photo badge */}
              {index === 0 && avatarUrl !== url && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-midnight-900/60 text-xs text-gold-300">
                  ★
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
