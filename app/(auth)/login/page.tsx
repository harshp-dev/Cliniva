"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setMessage("Supabase env vars are missing. Configure .env.local.");
      return;
    }

    setMessage("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextPath = params.get("next") || "/dashboard";
    setMessage("Signed in. Redirecting...");
    router.replace(nextPath);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <form onSubmit={onSubmit} className="card w-full space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <label className="text-sm text-slate-700">
          Email
          <input type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="text-sm text-slate-700">
          Password
          <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary w-full">Sign In</button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <p className="text-sm text-slate-600">New user? <Link href="/signup" className="text-sky-700 underline">Create account</Link></p>
      </form>
    </main>
  );
}
