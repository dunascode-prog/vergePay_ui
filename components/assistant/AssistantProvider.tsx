"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useAppData } from "@/components/app-data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { askAssistant, assistantSuggestions } from "@/services/assistant";
import { AssistantAnswer } from "@/types/assistant";
import { AssistantActionButton } from "./AssistantActionButton";

// "Ask VergePay": a chat panel, opened from the top bar or the Home card,
// that answers questions about the customer's own money. The API works the
// figures out; the conversation lives only in this tab.

type Message =
  | { id: number; from: "you"; text: string }
  | { id: number; from: "vergepay"; reply: AssistantAnswer }
  | { id: number; from: "error"; text: string };

const AssistantContext = createContext<{ openAssistant: (question?: string) => void } | null>(null);

export function useAssistant() {
  const value = useContext(AssistantContext);
  if (!value) throw new Error("useAssistant needs AssistantProvider");
  return value;
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const openAssistant = useCallback((question?: string) => {
    setOpen(true);
    if (question) setPending(question);
  }, []);
  const value = useMemo(() => ({ openAssistant }), [openAssistant]);

  return (
    <AssistantContext.Provider value={value}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
          <AssistantChat pending={pending} onPendingTaken={() => setPending(null)} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </AssistantContext.Provider>
  );
}

let nextId = 1;

function AssistantChat({ pending, onPendingTaken, onNavigate }: { pending: string | null; onPendingTaken: () => void; onNavigate: () => void }) {
  const { user } = useAppData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [starters, setStarters] = useState<string[] | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    assistantSuggestions()
      .then((r) => live && setStarters(r.questions))
      .catch(() => live && setStarters(["What should I do next?", "Who owes me the most?", "How much did I spend this month?"]));
    return () => {
      live = false;
    };
  }, []);

  // keep the newest message in view
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || busy) return;
      setDraft("");
      setMessages((m) => [...m, { id: nextId++, from: "you", text }]);
      setBusy(true);
      try {
        const reply = await askAssistant(text);
        setMessages((m) => [...m, { id: nextId++, from: "vergepay", reply }]);
      } catch (err) {
        setMessages((m) => [...m, { id: nextId++, from: "error", text: err instanceof ApiError ? err.message : "Something went wrong. Please try again." }]);
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  // a question handed over from elsewhere (e.g. a suggestion on Home)
  useEffect(() => {
    if (pending && !busy) {
      onPendingTaken();
      void send(pending);
    }
  }, [pending, busy, send, onPendingTaken]);

  const name = user?.first_name ?? user?.username;

  return (
    <>
      <SheetHeader className="border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <SheetTitle className="text-base">Ask VergePay</SheetTitle>
            <SheetDescription className="text-xs">Answers come from your own figures. Nothing you ask is saved.</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {name ? `Hi ${name}. ` : ""}Ask me about what you&apos;re owed, what you spent, your payroll, goals or loans.
            </p>
            <div className="flex flex-wrap gap-2">
              {(starters ?? []).map((q) => (
                <Chip key={q} onClick={() => void send(q)}>
                  {q}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.from === "you" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-emerald-700 px-3.5 py-2 text-sm text-white">{m.text}</p>
            </div>
          ) : m.from === "error" ? (
            <p key={m.id} role="alert" className="max-w-[85%] rounded-2xl rounded-bl-md border border-destructive/20 bg-destructive/5 px-3.5 py-2 text-sm text-destructive">
              {m.text}
            </p>
          ) : (
            <div key={m.id} className="space-y-2">
              <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">{m.reply.answer}</div>
              {m.reply.worded_by === "llm" && <p className="text-[11px] text-muted-foreground">Worded by an AI model; the figures are VergePay&apos;s.</p>}
              {m.reply.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {m.reply.actions.map((a, n) => (
                    <AssistantActionButton key={`${a.label}-${n}`} action={a} primary={n === 0} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
              {m.reply.followups.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {m.reply.followups.map((q) => (
                    <Chip key={q} onClick={() => void send(q)}>
                      {q}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          ),
        )}

        {busy && (
          <div className="flex w-14 items-center justify-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3 py-3" aria-label="Working it out">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <label htmlFor="assistant-question" className="sr-only">
          Your question
        </label>
        <textarea
          id="assistant-question"
          rows={1}
          maxLength={300}
          value={draft}
          placeholder="Ask about your money…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
        />
        <Button type="submit" size="icon" className="size-10 shrink-0 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800" disabled={busy || !draft.trim()} aria-label="Ask">
          <ArrowUp className="size-4" />
        </Button>
      </form>
    </>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("rounded-full border bg-background px-3 py-1.5 text-left text-xs font-medium text-foreground/80 transition-colors hover:border-emerald-600/50 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950 dark:hover:text-emerald-200")}
    >
      {children}
    </button>
  );
}
