"use client";

import { useState } from "react";
import { SoapNotesWorkspace } from "@/components/ehr/soap-notes-workspace";

export default function ConsultationPage() {
  const [roomName, setRoomName] = useState("consult-room-001");
  const [tokenStatus, setTokenStatus] = useState<string>("");

  async function generateToken() {
    setTokenStatus("Generating secure room token...");
    const response = await fetch("/api/video/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_name: roomName })
    });

    if (!response.ok) {
      setTokenStatus("Unable to generate token. Check Twilio credentials.");
      return;
    }

    setTokenStatus("Token generated. Connect WebRTC room with Twilio Video SDK.");
  }

  return (
    <section className="space-y-6">
      <article className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Telehealth Video Consultation</h2>
        <p className="text-sm text-slate-600">Secure meeting rooms backed by Twilio Video access tokens.</p>
        <div className="flex flex-col gap-3 md:flex-row">
          <input className="input" value={roomName} onChange={(event) => setRoomName(event.target.value)} />
          <button className="btn-primary" onClick={generateToken}>Generate Meeting Room</button>
        </div>
        {tokenStatus ? <p className="text-sm text-slate-600">{tokenStatus}</p> : null}
      </article>

      <SoapNotesWorkspace />
    </section>
  );
}
