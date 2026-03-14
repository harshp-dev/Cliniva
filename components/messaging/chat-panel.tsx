"use client";

import { useState } from "react";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";

export function ChatPanel({ channelId }: { channelId: string }) {
  const [message, setMessage] = useState("");
  const { messages } = useRealtimeMessages(channelId);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: "00000000-0000-0000-0000-000000000000",
        recipient_id: "00000000-0000-0000-0000-000000000001",
        content: message
      })
    });

    setMessage("");
  }

  return (
    <section className="card flex h-[420px] flex-col">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Care Team Messaging</h3>
      <div className="mb-4 flex-1 space-y-2 overflow-y-auto rounded-md bg-slate-50 p-3">
        {messages.length === 0 ? <p className="text-sm text-slate-500">No messages yet.</p> : null}
        {messages.map((item, index) => (
          <p key={`${item.id}-${index}`} className="rounded-md bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">{item.content}</p>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="input"
          placeholder="Type a secure message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit" className="btn-primary">Send</button>
      </form>
    </section>
  );
}
