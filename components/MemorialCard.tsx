import Link from "next/link";
import type { Memorial } from "@/lib/types";
import { Highlight } from "@/components/Highlight";

// 头像 emoji 映射（无头像时按标题/标签推断）
function getAvatarEmoji(title: string, traits: string[]): string {
  const text = title + traits.join("");
  if (/教师|老师|教/.test(text)) return "📖";
  if (/医|药|诊/.test(text)) return "⚕️";
  if (/母|妈|奶奶|外婆/.test(text)) return "🥟";
  if (/父|爸|爷爷|外公/.test(text)) return "🕯️";
  if (/军|兵|战/.test(text)) return "🎖️";
  if (/艺|画|音|琴/.test(text)) return "🎨";
  return "🌿";
}

export default function MemorialCard({
  memorial,
  query = "",
}: {
  memorial: Memorial;
  query?: string;
}) {
  const bio = memorial.bio || "";
  const bioShort = bio.length > 60 ? bio.slice(0, 60) + "…" : bio;

  return (
    <Link
      href={`/memorial/${memorial.slug}`}
      className="glass-card overflow-hidden hover:glow-border transition-all duration-300 group"
    >
      {/* Cover */}
      <div className="h-40 bg-gradient-to-br from-midnight-700 to-midnight-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 starfield opacity-30" />
        {memorial.avatar ? (
          <img
            src={memorial.avatar}
            alt={memorial.name}
            className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="text-6xl group-hover:scale-110 transition-transform duration-300 relative z-10">
            {getAvatarEmoji(memorial.title, memorial.traits ?? [])}
          </div>
        )}
        {memorial.isVerified && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-amethyst-500/20 text-xs text-amethyst-300 border border-amethyst-500/30 backdrop-blur-sm z-20">
            ✓ 已认证
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white group-hover:text-amethyst-400 transition-colors mb-1">
          <Highlight text={memorial.name} query={query} />
        </h3>
        <p className="text-sm text-mist-400 mb-3">
          <Highlight text={memorial.title} query={query} />
        </p>
        <p className="text-xs text-mist-400 leading-relaxed overflow-hidden" style={{ maxHeight: "2.6em" }}>
          <Highlight text={bioShort} query={query} />
        </p>

        {/* Tags: traits + relationship + region */}
        <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
          {(memorial.traits ?? []).slice(0, 3).map((trait) => (
            <span
              key={trait}
              className="px-2 py-0.5 rounded-full bg-amethyst-500/10 text-xs text-amethyst-300 border border-amethyst-500/15"
            >
              {trait}
            </span>
          ))}
          {memorial.relationship && (
            <span className="px-2 py-0.5 rounded-full bg-gold-500/10 text-xs text-gold-300 border border-gold-500/20">
              {memorial.relationship}
            </span>
          )}
          {memorial.region && (
            <span className="px-2 py-0.5 rounded-full bg-mist-500/10 text-xs text-mist-300 border border-mist-500/20">
              📍 {memorial.region}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-mist-400 pt-3 border-t border-amethyst-500/10">
          <span className="flex items-center gap-1">👁️ {memorial.visitorCount.toLocaleString()}</span>
          <span className="flex items-center gap-1">🌸 {memorial.tributeCount.toLocaleString()}</span>
          <span className="ml-auto text-amethyst-400 group-hover:translate-x-1 transition-transform">
            进入 →
          </span>
        </div>
      </div>
    </Link>
  );
}
