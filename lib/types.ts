// 共享类型定义

export interface Memorial {
  id: string;
  name: string;
  title: string;
  birthYear: number;
  deathYear: number;
  avatar: string;
  coverImage: string;
  bio: string;
  personality: string;
  traits: string[];
  quotes: string[];
  timeline: TimelineEvent[];
  photos: string[];
  tributes: Tribute[];
  visitorCount: number;
  tributeCount: number;
  isVerified: boolean;
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  icon: string;
}

export interface Tribute {
  id: string;
  type: "flower" | "candle" | "message";
  visitor: string;
  content?: string;
  timestamp: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
