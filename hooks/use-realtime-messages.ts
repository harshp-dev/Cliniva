"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MessageEntry {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export function useRealtimeMessages(currentUserId: string | null, peerUserId: string | null) {
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!peerUserId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/messages?conversation_with=${peerUserId}&limit=100`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      const rows = ((payload?.data ?? []) as MessageEntry[]).slice().reverse();
      setMessages(rows);
    } finally {
      setLoading(false);
    }
  }, [peerUserId]);

  useEffect(() => {
    if (!currentUserId || !peerUserId) {
      setMessages([]);
      return;
    }

    loadHistory();

    const supabase = createClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`messages:${currentUserId}:${peerUserId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const next = payload.new as {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          content?: string;
          created_at?: string;
          read_at?: string | null;
        };

        const isCurrentConversation =
          (next.sender_id === currentUserId && next.recipient_id === peerUserId) ||
          (next.sender_id === peerUserId && next.recipient_id === currentUserId);

        if (!isCurrentConversation || !next.id || !next.sender_id || !next.recipient_id) {
          return;
        }
        const nextId = next.id;
        const nextSenderId = next.sender_id;
        const nextRecipientId = next.recipient_id;

        setMessages((current) => {
          if (current.some((item) => item.id === nextId)) {
            return current;
          }

          return [
            ...current,
            {
              id: nextId,
              sender_id: nextSenderId,
              recipient_id: nextRecipientId,
              content: String(next.content ?? ""),
              created_at: String(next.created_at ?? new Date().toISOString()),
              read_at: next.read_at ?? null
            }
          ];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        const next = payload.new as { id?: string; read_at?: string | null };
        if (!next.id) {
          return;
        }

        setMessages((current) =>
          current.map((item) => (item.id === next.id ? { ...item, read_at: next.read_at ?? null } : item))
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, peerUserId, loadHistory]);

  return { messages, loading, refresh: loadHistory };
}
