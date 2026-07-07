import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "永念 EverMind — AI数字纪念空间",
    template: "%s | 永念 EverMind",
  },
  description: "用AI技术让逝者的记忆活下去，把冰冷的石碑变成可交互的数字纪念空间，让思念可以对话。",
  keywords: "AI墓碑,数字纪念,纪念馆,AI复刻,数字永生,在线祭奠",
  openGraph: {
    title: "永念 EverMind — AI数字纪念空间",
    description: "用AI技术让逝者的记忆活下去，把冰冷的石碑变成可交互的数字纪念空间，让思念可以对话。",
    siteName: "永念 EverMind",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "永念 EverMind — AI数字纪念空间",
    description: "用AI技术让逝者的记忆活下去，让思念可以对话。",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
