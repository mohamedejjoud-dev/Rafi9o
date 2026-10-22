/**
 * Rafi9i — Rafi AI Agent Chat Interface
 * Full conversational UI: chat, quiz, challenges, profile analysis.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Zap, Brain, Target, GraduationCap, CheckCircle2, XCircle, RotateCcw, MessageCircle } from "lucide-react";
import {
  generateAgentResponse,
  type ChatMessage,
  type QuizData,
  type ChallengeData,
  type AnalysisData,
  type FieldData,
  type AskData,
  type StudentProfile,
} from "@/lib/rafi-agent";
import { useI18n } from "@/lib/i18n";
import RafiLogo from "@/components/ui/RafiLogo";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components: Rendered AI content cards
// ─────────────────────────────────────────────────────────────────────────────

function QuizCard({ data }: { data: QuizData }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const q = data.questions[current];
  const total = data.questions.length;

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, i]);
  };

  const handleNext = () => {
    if (current + 1 < total) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  const handleReset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setAnswers([]);
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{t("ai.quiz.done")}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{score}/{total} {t("ai.quiz.score")}</p>
          </div>
          <div className="ml-auto text-3xl font-black text-orange-600">{pct}%</div>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <button onClick={handleReset} className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700">
          <RotateCcw className="h-3 w-3" /> {t("ai.quiz.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{q.field}</span>
        <span className="text-xs text-slate-500">{current + 1}/{total}</span>
      </div>
      {/* Progress */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${((current) / total) * 100}%` }} />
      </div>
      {/* Question */}
      <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{q.question}</p>
      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === q.correctIndex;
          const showResult = selected !== null;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all border
                ${!showResult ? "border-slate-200 dark:border-slate-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20" : ""}
                ${showResult && isCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300" : ""}
                ${showResult && isSelected && !isCorrect ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" : ""}
                ${showResult && !isSelected && !isCorrect ? "border-slate-200 dark:border-slate-700 opacity-60" : ""}
                ${!showResult ? "text-slate-700 dark:text-slate-300" : ""}
              `}
            >
              <span className="flex items-center gap-2">
                {showResult && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                {showResult && isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                {opt}
              </span>
            </button>
          );
        })}
      </div>
      {/* Explanation */}
      {selected !== null && (
        <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2 italic">
          💡 {q.explanation}
        </p>
      )}
      {selected !== null && (
        <button
          onClick={handleNext}
          className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
        >
          {current + 1 < total ? t("ai.quiz.next") : t("ai.quiz.result")}
        </button>
      )}
    </div>
  );
}

function ChallengeCard({ data }: { data: ChallengeData }) {
  const { t } = useI18n();
  const [checked, setChecked] = useState<boolean[]>(data.tasks.map(() => false));
  const done = checked.filter(Boolean).length;
  const pct = Math.round((done / data.tasks.length) * 100);
  const diffColor = data.difficulty === "difficile" ? "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
    : data.difficulty === "moyen" ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
    : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎯</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 dark:text-white text-sm">{data.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{data.description}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${diffColor}`}>
          {data.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>⏱ {data.timeframe}</span>
        <span className="text-orange-600 font-bold">+{data.xp} XP</span>
        <span className="ms-auto">{done}/{data.tasks.length} {t("ai.tasks")}</span>
      </div>

      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
        <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-2">
        {data.tasks.map((task, i) => (
          <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => setChecked((c) => c.map((v, j) => j === i ? !v : v))}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-500 accent-orange-500"
            />
            <span className={`text-sm transition-all ${checked[i] ? "line-through text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-300"}`}>
              {task}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function AnalysisCard({ data }: { data: AnalysisData }) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4 shadow-sm">
      {/* Personality type */}
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-orange-500 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("ai.personality")}</p>
          <p className="font-bold text-slate-900 dark:text-white">{data.personalityType}</p>
        </div>
      </div>

      {/* Strengths */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("ai.strengths")}</p>
        {data.strengths.map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">{s.label}</span>
              <span className="font-bold" style={{ color: s.color }}>{s.score}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recommended fields */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("ai.fields")}</p>
        {data.recommendedFields.map((f) => (
          <div key={f.name} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-lg">{f.emoji}</span>
            <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">{f.name}</span>
            <span className="text-sm font-bold" style={{ color: f.color }}>{f.match}%</span>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="flex gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
        <span className="text-lg shrink-0">💡</span>
        <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">{data.tip}</p>
      </div>
    </div>
  );
}

function FieldListCard({ data }: { data: FieldData }) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
      {data.fields.map((field) => (
        <div key={field.name} className="rounded-xl border border-slate-100 dark:border-slate-700 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">{field.name}</p>
            <span className="text-xs font-bold text-orange-600">{field.match}% {t("ai.match")}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{field.description}</p>
          {field.schools.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {field.schools.map((school) => (
                <span key={school} className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {school}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AskCard({ data, onPick }: { data: AskData; onPick: (id: string, label: string) => void }) {
  return (
    <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-orange-50/80 dark:bg-orange-950/30 p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{data.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onPick(opt.id, opt.label)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-orange-400 hover:text-orange-700"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ msg, onAskPick }: { msg: ChatMessage; onAskPick: (id: string, label: string) => void }) {
  const { t } = useI18n();
  const isRafi = msg.role === "rafi";

  return (
    <div className={`flex gap-2.5 ${isRafi ? "items-end" : "items-end flex-row-reverse"}`}>
      {/* Avatar */}
      {isRafi ? (
        <RafiLogo iconOnly size={32} className="shrink-0" />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {t("ai.you")}
        </div>
      )}

      {/* Content */}
      <div className={`max-w-[85%] space-y-2 ${isRafi ? "" : "items-end"}`}>
        {/* Text content */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
            ${isRafi
              ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm"
              : "bg-orange-500 text-white rounded-br-sm"
            }
          `}
        >
          {msg.content}
        </div>

        {/* Rich content cards */}
        {msg.type === "quiz" && msg.data && (
          <QuizCard data={msg.data as QuizData} />
        )}
        {msg.type === "challenge" && msg.data && (
          <ChallengeCard data={msg.data as ChallengeData} />
        )}
        {msg.type === "analysis" && msg.data && (
          <AnalysisCard data={msg.data as AnalysisData} />
        )}
        {msg.type === "field-list" && msg.data && (
          <FieldListCard data={msg.data as FieldData} />
        )}
        {msg.type === "ask" && msg.data && (
          <AskCard data={msg.data as AskData} onPick={onAskPick} />
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-slate-400 dark:text-slate-600 ${isRafi ? "text-left" : "text-right"}`}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Chat Component
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { key: "ai.quick.quiz",      icon: Zap },
  { key: "ai.quick.analyze",   icon: Brain },
  { key: "ai.quick.challenge", icon: Target },
  { key: "ai.quick.fields",    icon: GraduationCap },
  { key: "ai.quick.ask",       icon: MessageCircle },
] as const;

interface RafiAgentChatProps {
  profile?: StudentProfile;
  className?: string;
  onProfileChange?: (profile: StudentProfile) => void;
}

export default function RafiAgentChat({ profile = {}, className = "", onProfileChange }: RafiAgentChatProps) {
  const { t, locale, dir } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "rafi-greeting",
      role: "rafi",
      type: "text",
      content: t("ai.greeting"),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTo({ top: messagesElement.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages((current) =>
      current.map((m) => (m.id === "rafi-greeting" ? { ...m, content: t("ai.greeting") } : m))
    );
  }, [locale, t]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      type: "text",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const { message, profile: next } = await generateAgentResponse(text, profile, locale, messages);
      onProfileChange?.(next);
      setMessages((m) => [...m, message]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleQuickAction = (key: string) => {
    void sendMessage(t(key as Parameters<typeof t>[0]));
  };

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`} dir={dir}>
      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onAskPick={(id) => void sendMessage(id)} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5">
            <RafiLogo iconOnly size={32} className="shrink-0" />
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs text-slate-400 ms-1.5">{t("ai.typing")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {QUICK_ACTIONS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleQuickAction(key)}
            disabled={isTyping}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all disabled:opacity-50 shadow-xs"
          >
            <Icon className="h-3 w-3" />
            {t(key as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 pb-4"
      >
        <div className="flex gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-sm">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("ai.placeholder")}
            disabled={isTyping}
            dir={dir}
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none disabled:opacity-50"
            aria-label={t("ai.placeholder")}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            id="rafi-chat-send-btn"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
            aria-label={t("ai.send")}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
