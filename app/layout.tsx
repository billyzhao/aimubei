import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "永念 EverMind — AI数字纪念空间",
  description: "用AI技术让逝者的记忆活下去，把冰冷的石碑变成可交互的数字纪念空间，让思念可以对话。",
  keywords: "AI墓碑,数字纪念,纪念馆,AI复刻,数字永生,在线祭奠",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
