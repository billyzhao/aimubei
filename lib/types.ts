// 共享类型定义

export interface Memorial {
  id: string;
  slug: string;
  name: string;
  title: string;
  birthYear: number;
  deathYear: number;
  avatar: string;
  coverImage?: string;
  bio: string;
  personality?: string;
  traits?: string[];
  quotes?: string[];
  // 分类标签：关系类型 / 地区（用于筛选）
  relationship?: string | null;
  region?: string | null;
  timeline?: TimelineEvent[];
  photos?: string[];
  tributes?: Tribute[];
  visitorCount: number;
  tributeCount: number;
  photoCount?: number;
  isPublic: boolean;
  visibility?: string;
  isVerified: boolean;
  createdAt?: Date | string;
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

// 通知（馆主动态）
export interface Notification {
  id: string;
  userId: string;
  memorialId: string;
  memorialSlug: string;
  memorialName: string;
  type: "NEW_MESSAGE" | "NEW_VISITOR";
  content?: string | null;
  isRead: boolean;
  createdAt: string;
}
