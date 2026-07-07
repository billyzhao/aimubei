"use client";

import { useState } from "react";

export interface TimelineEventInput {
  year: number;
  title: string;
  description: string;
  icon: string;
}

interface TimelineBuilderProps {
  events: TimelineEventInput[];
  onEventsChange: (events: TimelineEventInput[]) => void;
}

const ICON_OPTIONS = [
  { value: "🌿", label: "出生" },
  { value: "🎓", label: "学业" },
  { value: "💼", label: "事业" },
  { value: "💍", label: "婚姻" },
  { value: "👶", label: "家庭" },
  { value: "🎖️", label: "荣誉" },
  { value: "📖", label: "教育" },
  { value: "⚕️", label: "医疗" },
  { value: "🎨", label: "艺术" },
  { value: "✈️", label: "旅行" },
  { value: "🕯️", label: "离世" },
  { value: "⭐", label: "其他" },
];

export default function TimelineBuilder({
  events,
  onEventsChange,
}: TimelineBuilderProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TimelineEventInput>({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    icon: "⭐",
  });

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      title: "",
      description: "",
      icon: "⭐",
    });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!formData.title.trim() || !formData.year) return;

    const sorted = [...events];

    if (editingIndex !== null) {
      sorted[editingIndex] = formData;
    } else {
      sorted.push(formData);
    }

    // Sort by year
    sorted.sort((a, b) => a.year - b.year);

    onEventsChange(sorted);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(events[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    onEventsChange(events.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Event List */}
      {events.length > 0 && (
        <div className="space-y-2">
          {events.map((event, index) => (
            <div
              key={index}
              className="glass-card p-4 flex items-start gap-3 group hover:border-amethyst-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-amethyst-500/10 flex items-center justify-center text-lg flex-shrink-0">
                {event.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amethyst-400 font-semibold text-sm">
                    {event.year}
                  </span>
                  <span className="text-mist-200 font-medium text-sm">
                    {event.title}
                  </span>
                </div>
                {event.description && (
                  <p className="text-xs text-mist-400 leading-relaxed line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(index)}
                  className="w-7 h-7 rounded-lg bg-amethyst-500/10 text-amethyst-300 flex items-center justify-center text-xs hover:bg-amethyst-500/20 transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-300 flex items-center justify-center text-xs hover:bg-rose-500/20 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm ? (
        <div className="glass-card p-5 space-y-4 border-amethyst-500/30">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">
              {editingIndex !== null ? "编辑时间线事件" : "添加时间线事件"}
            </h4>
            <button
              onClick={resetForm}
              className="text-mist-400 hover:text-mist-200 text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-xs text-mist-400 mb-1 block">年份 *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) || 0 })
                }
                placeholder="1950"
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-3 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-mist-400 mb-1 block">标题 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="如：考入北京大学"
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-3 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-mist-400 mb-1 block">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="详细描述这一年的重要事件..."
              rows={2}
              className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-3 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-mist-400 mb-2 block">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, icon: opt.value })}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    formData.icon === opt.value
                      ? "bg-amethyst-500/20 border-2 border-amethyst-500/40 scale-110"
                      : "bg-midnight-700/40 border-2 border-transparent hover:border-amethyst-500/20"
                  }`}
                  title={opt.label}
                >
                  {opt.value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-sm text-mist-400 hover:text-mist-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={!formData.title.trim()}
              className="btn-primary text-sm px-5 py-2 disabled:opacity-30"
            >
              {editingIndex !== null ? "保存" : "添加"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-amethyst-500/20 text-sm text-mist-400 hover:border-amethyst-500/40 hover:text-amethyst-300 hover:bg-amethyst-500/5 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> 添加时间线事件
        </button>
      )}

      {events.length === 0 && !showForm && (
        <p className="text-xs text-mist-400 text-center">
          还没有添加时间线事件，点击上方按钮开始添加
        </p>
      )}
    </div>
  );
}
