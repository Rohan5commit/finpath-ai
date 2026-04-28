"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Analysis, ChatMessage, FinancialProfile } from "@/lib/types";

export function ChatAssistant({
  analysis,
  profile,
}: {
  analysis: Analysis;
  profile: FinancialProfile;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `${analysis.coachMessage} Ask me a follow-up like “What should I cut first?” or “How do I reach my goal faster?”`,
      },
    ]);
  }, [analysis.coachMessage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    const nextHistory = [...messages, { role: "user", content: trimmed }];
    setMessages(nextHistory);
    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          analysis,
          question: trimmed,
          history: messages,
        }),
      });

      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) {
        throw new Error(data.error || "Chat request failed.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.answer! }]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Unable to get chat response.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-card rounded-[2rem] p-6">
      <SectionHeading
        eyebrow="AI budgeting assistant"
        title="Ask grounded follow-up questions"
        description="The assistant answers with plain-English financial guidance tied to the user’s current plan."
      />
      <div className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" description="Ask a question to start the conversation." />
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={message.role === "assistant" ? "rounded-[1.5rem] border border-white/10 bg-white/5 p-4" : "ml-auto max-w-3xl rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4"}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{message.role === "assistant" ? "FinPath AI" : "You"}</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">{message.content}</p>
            </div>
          ))
        )}
      </div>

      <form className="mt-6 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What should I cut first if I still want to go out with friends?"
          className="flex-1"
        />
        <Button type="submit" disabled={loading} variant="primary">
          {loading ? "Thinking..." : "Ask FinPath AI"}
        </Button>
      </form>
      {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
      <p className="mt-4 text-xs leading-6 text-slate-400">FinPath AI stays educational and avoids regulated financial advice or guarantees.</p>
    </Card>
  );
}
