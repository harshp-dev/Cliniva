import { ChatPanel } from "@/components/messaging/chat-panel";
import { NotificationsPanel } from "@/components/messaging/notifications-panel";

export default function MessagesPage() {
  return (
    <section className="space-y-6">
      <ChatPanel />
      <NotificationsPanel />
    </section>
  );
}
