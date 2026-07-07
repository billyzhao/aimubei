"use client";

import { motion } from "framer-motion";
import type { TimelineEvent } from "@/lib/types";

interface TimelineProps {
  events: TimelineEvent[];
  name: string;
}

export default function Timeline({ events, name }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical center line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amethyst-500/30 via-amethyst-500/20 to-transparent hidden md:block" />
      {/* Left line for mobile */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amethyst-500/30 via-amethyst-500/20 to-transparent md:hidden" />

      <div className="space-y-8">
        {events.map((event, i) => {
          const isLeft = i % 2 === 0;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative group"
            >
              {/* Desktop: alternating layout */}
              <div className="hidden md:flex items-center gap-6">
                {/* Left side content */}
                {isLeft ? (
                  <>
                    <div className="flex-1 text-right">
                      <TimelineCard event={event} align="right" />
                    </div>
                    <TimelineNode icon={event.icon} />
                    <div className="flex-1" />
                  </>
                ) : (
                  <>
                    <div className="flex-1" />
                    <TimelineNode icon={event.icon} />
                    <div className="flex-1">
                      <TimelineCard event={event} align="left" />
                    </div>
                  </>
                )}
              </div>

              {/* Mobile: left-aligned layout */}
              <div className="md:hidden relative flex gap-6">
                <TimelineNode icon={event.icon} />
                <div className="flex-1 pb-2">
                  <TimelineCard event={event} align="left" />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* End marker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="hidden md:flex justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amethyst-500/20 to-midnight-800 border-2 border-amethyst-500/20 flex items-center justify-center timeline-node-glow">
                <span className="text-xs text-mist-400">END</span>
              </div>
              <p className="text-sm text-mist-400 italic mt-3">
                {name}的故事在此定格，但记忆永存。
              </p>
            </div>
          </div>
          <div className="md:hidden relative flex gap-6">
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amethyst-500/20 to-midnight-800 border-2 border-amethyst-500/20 flex items-center justify-center timeline-node-glow">
                <span className="text-xs text-mist-400">END</span>
              </div>
            </div>
            <div className="flex-1 pt-3">
              <p className="text-sm text-mist-400 italic">
                {name}的故事在此定格，但记忆永存。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TimelineNode({ icon }: { icon: string }) {
  return (
    <div className="relative z-10 flex-shrink-0">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-midnight-700 to-midnight-800 border-2 border-amethyst-500/30 flex items-center justify-center text-xl group-hover:border-amethyst-500/60 group-hover:scale-110 timeline-node-glow timeline-icon-hover transition-all duration-300">
        {icon}
      </div>
    </div>
  );
}

function TimelineCard({ event, align }: { event: TimelineEvent; align: "left" | "right" }) {
  return (
    <div className={`glass-card p-4 group-hover:glow-border transition-all duration-300 ${align === "right" ? "ml-auto" : ""}`}>
      <div className={`flex items-center gap-3 mb-2 ${align === "right" ? "justify-end" : "justify-start"}`}>
        {align === "right" && (
          <span className="text-sm font-semibold text-white">
            {event.title}
          </span>
        )}
        <span className="text-lg font-bold text-gradient-gold font-mono">
          {event.year}
        </span>
        {align === "left" && (
          <span className="text-sm font-semibold text-white">
            {event.title}
          </span>
        )}
      </div>
      <p className={`text-sm text-mist-400 leading-relaxed ${align === "right" ? "text-right" : "text-left"}`}>
        {event.description}
      </p>
    </div>
  );
}
