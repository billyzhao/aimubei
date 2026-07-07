"use client";

import { motion } from "framer-motion";

interface VisitorStatsProps {
  visitorCount: number;
  tributeCount: number;
  flowerCount: number;
  candleCount: number;
  messageCount: number;
}

export default function VisitorStats({
  visitorCount,
  tributeCount,
  flowerCount,
  candleCount,
  messageCount,
}: VisitorStatsProps) {
  const stats = [
    { label: "总访问", value: visitorCount, icon: "👁️", color: "from-amethyst-500 to-amethyst-700" },
    { label: "献花", value: flowerCount, icon: "🌸", color: "from-pink-500 to-rose-700" },
    { label: "点烛", value: candleCount, icon: "🕯️", color: "from-amber-500 to-orange-700" },
    { label: "留言", value: messageCount, icon: "✉️", color: "from-sky-500 to-indigo-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass-card p-4 text-center group hover:glow-border transition-all duration-300"
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">
            {stat.icon}
          </div>
          <div className={`text-xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
            {stat.value.toLocaleString()}
          </div>
          <div className="text-xs text-mist-400 mt-0.5">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
