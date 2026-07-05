"use client";

import { useState, useRef, useEffect } from "react";
import { generateAIReply, type Memorial } from "@/lib/mockData";

interface MemorialChatProps {
  memorial: Memorial;
}

export default function MemorialChat({ memorial }: MemorialChatProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: `你好，我是${memorial.name}的AI数字形象。你可以叫我${memorial.name.split("")[0]}老师/长辈。有什么想和我说的吗？`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking + typing
    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      const reply = generateAIReply(userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "您最近过得好吗？",
    "我想您了",
    "给我讲讲您的故事吧",
    "您有什么人生建议吗？",
  ];

  return (
    <div className="glass-card flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-amethyst-500/15">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-lg">
            💬
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-midnight-800 animate-pulse" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">与 {memorial.name} 对话</div>
          <div className="text-xs text-mist-400">AI模拟 · 基于性格特征还原</div>
        </div>
        <div className="ml-auto px-2 py-1 rounded-full bg-amethyst-500/10 text-xs text-amethyst-400 border border-amethyst-500/20">
          AI 模拟回复
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                ✨
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-amethyst-600 to-amethyst-500 text-white rounded-br-md"
                  : "bg-midnight-700/60 text-mist-200 rounded-bl-md border border-amethyst-500/10"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
              ✨
            </div>
            <div className="bg-midnight-700/60 px-4 py-3 rounded-2xl rounded-bl-md border border-amethyst-500/10">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-amethyst-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-amethyst-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-amethyst-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
                setTimeout(() => {
                  setMessages((prev) => [...prev, { role: "user", content: prompt }]);
                  setInput("");
                  setIsTyping(true);
                  setTimeout(() => {
                    const reply = generateAIReply(prompt);
                    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
                    setIsTyping(false);
                  }, 1500);
                }, 100);
              }}
              className="px-3 py-1.5 rounded-full bg-amethyst-500/10 text-xs text-mist-300 border border-amethyst-500/20 hover:bg-amethyst-500/20 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-amethyst-500/15">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你想说的话..."
            className="flex-1 bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amethyst-600 to-amethyst-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amethyst-500/30 transition-all"
          >
            发送
          </button>
        </div>
        <p className="text-xs text-mist-400/60 mt-2 text-center">
          ⚠️ 以上回复由AI模拟生成，仅供纪念用途
        </p>
      </div>
    </div>
  );
}
