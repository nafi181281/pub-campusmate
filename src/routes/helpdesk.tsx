import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ChatStatus } from "ai";
import { BookMarked, Languages, RotateCcw } from "lucide-react";
import logo from "@/assets/pub-crest.jpg.asset.json";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PageHeader } from "@/components/campus/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCampus, type ChatMessage } from "@/lib/campus/store";
import { GRADE_SCALE, gradeFor } from "@/lib/campus/grading";
import { POLICIES } from "@/lib/campus/knowledge";

export const Route = createFileRoute("/helpdesk")({
  head: () => ({
    meta: [
      { title: "Jervis (বাংলা / English) — PUB CampusMate" },
      { name: "description", content: "Bilingual AI helpdesk for PUB students: grading, credit limits, course drop, probation and tuition fee policy with official source citations." },
      { property: "og:title", content: "Jervis — PUB CampusMate" },
      { property: "og:description", content: "Ask in Bangla or English about PUB academic policies, with cited official sources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpdeskPage,
});

const SUGGESTIONS = [
  "What grade is 73%?",
  "প্রবেশনে থাকলে কত ক্রেডিট নিতে পারব?",
  "How is tuition fee paid?",
  "কোর্স ড্রপ করার নিয়ম কী?",
  "Can I take CSE 2101 without CSE 1201?",
  "What is the hostel fee?",
];

function HelpdeskPage() {
  const chat = useCampus((s) => s.chat);
  const setChat = useCampus((s) => s.setChat);
  const lang = useCampus((s) => s.chatLang);
  const setLang = useCampus((s) => s.setChatLang);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || status === "submitted" || status === "streaming") return;
    setError(null);
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const history = [...useCampus.getState().chat, userMsg];
    setChat(history);
    setStatus("submitted");
    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "";
    try {
      const res = await fetch("/api/helpdesk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang, messages: history.slice(-30).map(({ role, text }) => ({ role, text })) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "The helpdesk could not answer right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setStatus("streaming");
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }
      if (acc.trim()) setChat([...history, { id: crypto.randomUUID(), role: "assistant", text: acc }]);
      setStatus("ready");
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        if (acc.trim()) setChat([...history, { id: crypto.randomUUID(), role: "assistant", text: acc + "\n\n_(stopped)_" }]);
        setStatus("ready");
      } else {
        setError((e as Error).message);
        setStatus("error");
      }
    } finally {
      setStreaming(null);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const onSubmit = (msg: PromptInputMessage) => {
    void send(msg.text);
  };

  const busy = status === "submitted" || status === "streaming";

  return (
    <>
      <PageHeader eyebrow="Bilingual · বাংলা / English" title="Jervis" titleBn="এআই হেল্পডেস্ক" description="Answers come from PUB's official academic policies and cite their source. If something isn't in the official documents, the helpdesk will say so." />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <section className="flex h-[72vh] min-h-[520px] flex-col rounded-lg border bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={logo.url} alt="" className="size-9 rounded-full border bg-card object-contain" />
              <div>
                <p className="font-semibold leading-tight">CampusMate Helpdesk</p>
                <p className="text-xs text-muted-foreground">PUB Academic Ordinance knowledge base</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy || chat.length === 0}
              onClick={() => {
                setChat([]);
                setError(null);
                textareaRef.current?.focus();
              }}
            >
              <RotateCcw /> New conversation
            </Button>
          </div>
          <Conversation className="flex-1">
            <ConversationContent>
              {chat.length === 0 && !streaming ? (
                <ConversationEmptyState
                  icon={<img src={logo.url} alt="" className="size-16 rounded-full border bg-card object-contain" />}
                  title="আসসালামু আলাইকুম! How can I help?"
                  description="Ask about grading, credit limits, course drop, probation or tuition fees — in বাংলা or English."
                />
              ) : (
                chat.map((m) => (
                  <Message key={m.id} from={m.role}>
                    <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                      {m.role === "assistant" ? <MessageResponse>{m.text}</MessageResponse> : <p className="whitespace-pre-wrap">{m.text}</p>}
                    </MessageContent>
                  </Message>
                ))
              )}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer>Checking the official documents…</Shimmer>
                  </MessageContent>
                </Message>
              )}
              {streaming && (
                <Message from="assistant">
                  <MessageContent>
                    <MessageResponse isAnimating>{streaming}</MessageResponse>
                  </MessageContent>
                </Message>
              )}
              {error && <p className="rounded-md bg-danger-soft p-3 text-sm text-destructive">{error}</p>}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <div className="space-y-2 border-t p-3">
            {chat.length === 0 && (
              <Suggestions>
                {SUGGESTIONS.map((s) => (
                  <Suggestion key={s} suggestion={s} onClick={(v) => void send(v)} />
                ))}
              </Suggestions>
            )}
            <PromptInput onSubmit={onSubmit}>
              <PromptInputTextarea ref={textareaRef} placeholder="প্রশ্ন লিখুন / Type your question…" />
              <PromptInputFooter>
                <PromptInputTools>
                  <Languages className="ml-1 size-4 text-muted-foreground" />
                  <ToggleGroup type="single" size="sm" value={lang} onValueChange={(v) => v && setLang(v as typeof lang)} aria-label="Answer language">
                    <ToggleGroupItem value="auto" className="px-2 text-xs">Auto</ToggleGroupItem>
                    <ToggleGroupItem value="bn" className="px-2 text-xs">বাংলা</ToggleGroupItem>
                    <ToggleGroupItem value="en" className="px-2 text-xs">English</ToggleGroupItem>
                  </ToggleGroup>
                </PromptInputTools>
                <PromptInputSubmit status={status} onStop={() => abortRef.current?.abort()} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
        <KnowledgeSidebar />
      </div>
    </>
  );
}

function KnowledgeSidebar() {
  const [pct, setPct] = useState("73");
  const g = gradeFor(Number(pct) || 0);
  return (
    <aside className="space-y-4">
      <div className="rounded-lg border bg-card p-5 shadow-card">
        <h2 className="font-sans text-base font-semibold">Grade converter</h2>
        <div className="mt-3 flex items-center gap-3">
          <Input type="number" min={0} max={100} value={pct} onChange={(e) => setPct(e.target.value)} className="w-24" aria-label="Percentage" />
          <span className="text-sm text-muted-foreground">%</span>
          <span className="ml-auto font-display text-2xl font-bold text-primary">{g.letter}</span>
          <span className="text-sm text-muted-foreground">{g.point.toFixed(2)}</span>
        </div>
        <table className="mt-4 w-full text-xs">
          <tbody className="divide-y">
            {GRADE_SCALE.map((row) => (
              <tr key={row.letter} className={row.letter === g.letter ? "bg-accent font-semibold" : ""}>
                <td className="py-1 pl-1">{row.range}</td>
                <td className="text-center">{row.letter}</td>
                <td className="pr-1 text-right">{row.point.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[11px] text-muted-foreground">[PUB Academic Ordinance Sec 5.1]</p>
      </div>
      <div className="rounded-lg border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><BookMarked className="size-4 text-royal" /> Official knowledge base</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {POLICIES.filter((p) => p.id !== "grading").map((p) => (
            <li key={p.id}>
              <p className="font-medium">{p.title} <span className="text-muted-foreground">· {p.titleBn}</span></p>
              <p className="text-xs text-muted-foreground">{p.text}</p>
              <p className="text-[11px] text-royal">[{p.source}]</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
