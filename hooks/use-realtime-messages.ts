"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MessageEntry {
  id: string;
  content: string;
}

export function useRealtimeMessages(channelId: string) {
  const [messages, setMessages] = useState<MessageEntry[]>([]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((current) => [{ id: String(payload.new.id), content: String(payload.new.content ?? "") }, ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return { messages };
}
