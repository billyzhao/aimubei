import type { TimelineEvent } from "@/lib/types";

interface TimelineProps {
  events: TimelineEvent[];
  name: string;
}

export default function Timeline({ events, name }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amethyst-500/30 via-amethyst-500/20 to-transparent" />

      <div className="space-y-8">
        {events.map((event, i) => (
          <div key={i} className="relative flex gap-6 group">
            {/* Node */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-midnight-700 to-midnight-800 border-2 border-amethyst-500/30 flex items-center justify-center text-xl group-hover:border-amethyst-500/60 group-hover:scale-110 transition-all duration-300">
                {event.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="glass-card p-4 group-hover:glow-border transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gradient-gold font-mono">
                    {event.year}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {event.title}
                  </span>
                </div>
                <p className="text-sm text-mist-400 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* End marker */}
        <div className="relative flex gap-6">
          <div className="relative z-10 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amethyst-500/20 to-midnight-800 border-2 border-amethyst-500/20 flex items-center justify-center">
              <span className="text-xs text-mist-400">END</span>
            </div>
          </div>
          <div className="flex-1 pt-3">
            <p className="text-sm text-mist-400 italic">
              {name}的故事在此定格，但记忆永存。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
