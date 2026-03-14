"use client";

import { useEffect, useMemo, useState } from "react";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  role: "admin" | "provider" | "staff" | "patient";
  email: string;
  first_name: string;
  last_name: string;
}

interface MeResponse {
  user_id: string;
  role: "admin" | "provider" | "staff" | "patient";
}

function displayName(contact: Contact) {
  const fullName = `${contact.first_name} ${contact.last_name}`.trim();
  return fullName || contact.email;
}

export function ChatPanel() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const { messages, loading, refresh } = useRealtimeMessages(me?.user_id ?? null, activeContactId);

  const activeContact = useMemo(
    () => contacts.find((contact) => contact.id === activeContactId) ?? null,
    [activeContactId, contacts]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      const [meRes, contactsRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
        fetch("/api/messages/contacts?limit=200", { cache: "no-store" })
      ]);

      const mePayload = await meRes.json().catch(() => null);
      const contactsPayload = await contactsRes.json().catch(() => null);

      if (cancelled) {
        return;
      }

      const nextMe = mePayload?.data as MeResponse | undefined;
      const nextContacts = (contactsPayload?.data ?? []) as Contact[];

      if (nextMe) {
        setMe(nextMe);
      }
      setContacts(nextContacts);
      setActiveContactId((current) => {
        if (current && nextContacts.some((item) => item.id === current)) {
          return current;
        }
        return nextContacts[0]?.id ?? null;
      });
    }

    loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeContactId || !message.trim() || sending) {
      return;
    }

    setSending(true);
    setStatus("Sending message...");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: activeContactId,
          content: message
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setStatus(payload?.error?.message ?? "Unable to send message");
        return;
      }

      setMessage("");
      setStatus("Message sent.");
      refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-2 border-b border-slate-200 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        <h3 className="text-lg font-semibold text-slate-900">Contacts</h3>
        {contacts.length === 0 ? <p className="text-sm text-slate-500">No contacts available.</p> : null}
        <div className="max-h-[380px] space-y-1 overflow-y-auto">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm",
                contact.id === activeContactId ? "bg-sky-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
              onClick={() => setActiveContactId(contact.id)}
            >
              <p className="font-medium">{displayName(contact)}</p>
              <p className="text-xs uppercase tracking-wide opacity-80">{contact.role}</p>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex h-[520px] flex-col">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Secure Chat</h3>
        <p className="mb-3 text-sm text-slate-600">
          {activeContact ? `Conversation with ${displayName(activeContact)}` : "Select a contact to start chatting."}
        </p>

        <div className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-md bg-slate-50 p-3">
          {loading ? <p className="text-sm text-slate-500">Loading history...</p> : null}
          {!loading && messages.length === 0 ? <p className="text-sm text-slate-500">No messages yet.</p> : null}
          {messages.map((item) => {
            const isMine = item.sender_id === me?.user_id;
            return (
              <div
                key={item.id}
                className={cn(
                  "max-w-[85%] rounded-md px-3 py-2 text-sm shadow-sm",
                  isMine ? "ml-auto bg-sky-800 text-white" : "bg-white text-slate-700"
                )}
              >
                <p>{item.content}</p>
                <p className={cn("mt-1 text-[11px]", isMine ? "text-sky-100" : "text-slate-500")}>
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        <form onSubmit={sendMessage} className="space-y-2">
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Type a secure message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={!activeContactId || sending}
            />
            <button type="submit" className="btn-primary" disabled={!activeContactId || sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
          {status ? <p className="text-xs text-slate-600">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
