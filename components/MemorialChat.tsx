"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Memorial } from "@/lib/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface MemorialChatProps {
  memorial: Memorial;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function MemorialChat({ memorial }: MemorialChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `你好，我是${memorial.name}的AI数字形象。有什么想和我说的吗？`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [loadedHistory, setLoadedHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // 客户端挂载后检测语音识别支持，避免 hydration 不匹配
  useEffect(() => {
    setMounted(true);
    setSpeechSupported(
      !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
    );
  }, []);

  // ====================================
  // 语音输入：Web Speech API SpeechRecognition
  // ====================================

  const speechRecognitionSupported = mounted && speechSupported;

  const startRecording = useCallback(() => {
    if (!speechRecognitionSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInput(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("语音识别错误:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, [speechRecognitionSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // ====================================
  // TTS：window.speechSynthesis
  // ====================================

  const speak = useCallback((text: string, index: number) => {
    if (!("speechSynthesis" in window)) return;

    // 如果正在播报同一条，停止
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    // 停止之前的播报
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // 尝试选择中文语音
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find((v) => v.lang.startsWith("zh"));
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
    setSpeakingIndex(index);
  }, [speakingIndex]);

  // ====================================
  // 对话导出
  // ====================================

  const exportMarkdown = useCallback(() => {
    const header = `# 与 ${memorial.name} 的对话\n\n> AI数字形象 · ${new Date().toLocaleString("zh-CN")}\n\n---\n\n`;
    const body = messages
      .filter((m) => !(m.role === "assistant" && m.content.includes("AI数字形象。有什么想和我说的吗？")))
      .map((m) => {
        const speaker = m.role === "user" ? "来访者" : memorial.name;
        return `### ${speaker}\n\n${m.content}\n`;
      })
      .join("\n---\n\n");
    const footer = "\n\n---\n\n*以上回复由AI生成，仅供纪念用途*";

    const markdown = header + body + footer;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `对话_${memorial.name}_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [messages, memorial.name]);

  const exportPDF = useCallback(async () => {
    // 创建临时容器用于渲染对话内容
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 680px;
      padding: 40px;
      background: #ffffff;
      font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
      color: #333;
    `;

    const filteredMessages = messages.filter(
      (m) => !(m.role === "assistant" && m.content.includes("AI数字形象。有什么想和我说的吗？"))
    );

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 22px; color: #6b21a8; margin: 0 0 8px 0;">与 ${memorial.name} 的对话</h1>
        <div style="font-size: 13px; color: #999;">AI数字形象 · ${new Date().toLocaleString("zh-CN")}</div>
      </div>
      <div style="border-top: 1px solid #eee; margin-bottom: 20px;"></div>
      ${filteredMessages
        .map((m) => {
          const speaker = m.role === "user" ? "来访者" : memorial.name;
          const bg = m.role === "user" ? "#f3e8ff" : "#f5f5f5";
          const margin = m.role === "user" ? "margin-left: 40px;" : "margin-right: 40px;";
          return `
            <div style="margin: 16px 0; padding: 14px; border-radius: 10px; background: ${bg}; ${margin}">
              <div style="font-weight: bold; font-size: 13px; color: #6b21a8; margin-bottom: 6px;">${speaker}</div>
              <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap; word-break: break-word;">${m.content}</div>
            </div>
          `;
        })
        .join("")}
      <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
        以上回复由AI生成，仅供纪念用途
      </div>
    `;

    document.body.appendChild(container);

    try {
      // 用 html2canvas 截图为 canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // 用 jsPDF 生成 PDF
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 595.28; // A4 宽度 (pt)
      const pageHeight = 841.89; // A4 高度 (pt)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "pt", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      // 第一页
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 多页处理
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 直接下载
      pdf.save(`对话_${memorial.name}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF 生成失败:", error);
    } finally {
      document.body.removeChild(container);
    }

    setShowExportMenu(false);
  }, [messages, memorial.name]);

  // 点击外部关闭导出菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 加载历史对话
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/chat?memorialSlug=${memorial.id}`);
        if (res.ok) {
          const history = await res.json();
          if (Array.isArray(history) && history.length > 0) {
            const historyMessages: Message[] = history.map((m: any) => ({
              role: m.role,
              content: m.content,
              timestamp: m.createdAt,
            }));
            setMessages([
              {
                role: "assistant",
                content: `你好，我是${memorial.name}的AI数字形象。有什么想和我说的吗？`,
              },
              ...historyMessages,
            ]);
          }
        }
      } catch {
        // 静默失败
      }
      setLoadedHistory(true);
    }
    loadHistory();
  }, [memorial.id, memorial.name]);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, streamingText]);

  // 组件卸载时停止语音
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const sendMessage = async (text: string) => {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorialSlug: memorial.id,
          message: text,
          stream: true,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullText += parsed.content;
                  setStreamingText(fullText);
                }
              } catch {
                // skip
              }
            }
          }
        }

        if (fullText) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullText },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "抱歉，我暂时无法回复。请稍后再试。" },
          ]);
        }
      } else {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "请求失败");

        const fullText = data.content || "抱歉，我暂时无法回复。";
        await typewriterEffect(fullText);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fullText },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，我暂时无法回复。请稍后再试。" },
      ]);
    } finally {
      setIsTyping(false);
      setStreamingText("");
    }
  };

  const typewriterEffect = async (text: string) => {
    const chunkSize = 2;
    for (let i = 0; i <= text.length; i += chunkSize) {
      setStreamingText(text.slice(0, i));
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
          <div className="text-xs text-mist-400">AI数字形象 · 基于性格特征还原</div>
        </div>

        {/* 导出按钮 */}
        <div className="ml-auto relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 rounded-lg hover:bg-amethyst-500/10 text-mist-400 hover:text-amethyst-300 transition-colors"
            title="导出对话"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 glass-card p-1 z-20">
              <button
                onClick={exportMarkdown}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-mist-300 hover:bg-amethyst-500/10 transition-colors"
              >
                📄 导出 Markdown
              </button>
              <button
                onClick={exportPDF}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-mist-300 hover:bg-amethyst-500/10 transition-colors"
              >
                📄 导出 PDF
              </button>
            </div>
          )}
        </div>

        <div className="px-2 py-1 rounded-full bg-amethyst-500/10 text-xs text-amethyst-400 border border-amethyst-500/20">
          AI 对话
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in group`}>
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
              {/* AI 消息的语音播报按钮 */}
              {msg.role === "assistant" && i > 0 && (
                <button
                  onClick={() => speak(msg.content, i)}
                  className="ml-2 inline-flex items-center gap-1 text-xs text-mist-400 hover:text-amethyst-300 transition-colors opacity-0 group-hover:opacity-100"
                  title={speakingIndex === i ? "停止播报" : "语音播报"}
                >
                  {speakingIndex === i ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M5 8H3v8h2l5 5V3L5 8z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 流式输出中 */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
              ✨
            </div>
            <div className="bg-midnight-700/60 px-4 py-3 rounded-2xl rounded-bl-md border border-amethyst-500/10">
              {streamingText ? (
                <span className="text-sm text-mist-200 leading-relaxed">
                  {streamingText}
                  <span className="inline-block w-0.5 h-4 bg-amethyst-400 ml-0.5 animate-pulse align-middle" />
                </span>
              ) : (
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-amethyst-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-amethyst-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-amethyst-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && !isTyping && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={isTyping}
              className="px-3 py-1.5 rounded-full bg-amethyst-500/10 text-xs text-mist-300 border border-amethyst-500/20 hover:bg-amethyst-500/20 transition-colors disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-amethyst-500/15">
        <div className="flex gap-2 items-center">
          {/* 语音输入按钮 */}
          {speechRecognitionSupported && (
            <button
              onClick={handleMicClick}
              disabled={isTyping}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                  : "bg-amethyst-500/10 text-amethyst-400 border border-amethyst-500/20 hover:bg-amethyst-500/20"
              } disabled:opacity-40`}
              title={isRecording ? "停止录音" : "语音输入"}
            >
              {isRecording ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-11a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "正在聆听..." : "输入你想说的话..."}
            className="flex-1 bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amethyst-600 to-amethyst-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amethyst-500/30 transition-all"
          >
            {isTyping ? "..." : "发送"}
          </button>
        </div>
        <p className="text-xs text-mist-400/60 mt-2 text-center">
          ⚠️ 以上回复由AI生成，仅供纪念用途
        </p>
      </div>
    </div>
  );
}
