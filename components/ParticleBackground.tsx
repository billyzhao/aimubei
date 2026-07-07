"use client";

import { useEffect, useRef } from "react";

/**
 * 背景粒子效果 — 柔和光点缓慢上升飘浮
 * 使用 Canvas 实现，性能优于 DOM 元素动画
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      opacityDir: number;
      hue: number;
    }

    const initParticles = () => {
      const count = Math.min(40, Math.floor((canvas.width * canvas.height) / 25000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.5,
          speedY: Math.random() * 0.3 + 0.1,
          speedX: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.5 + 0.1,
          opacityDir: Math.random() > 0.5 ? 1 : -1,
          hue: Math.random() > 0.5 ? 265 : 45, // 紫色或金色
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // 上升
        p.y -= p.speedY;
        p.x += p.speedX;

        // 闪烁
        p.opacity += p.opacityDir * 0.003;
        if (p.opacity > 0.6) p.opacityDir = -1;
        if (p.opacity < 0.05) p.opacityDir = 1;

        // 重置位置
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // 绘制光点
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 75%, ${p.opacity})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 75%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
