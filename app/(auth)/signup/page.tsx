"use client";

import Link from "next/link";
import { useState } from "react";
import { getEmailRedirectUrl } from "@/lib/auth/email-redirect";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
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

    setMessage("Creating account...");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectUrl("/dashboard")
      }
    });
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Signup submitted. Check email verification settings.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <form onSubmit={onSubmit} className="card w-full space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <label className="text-sm text-slate-700">
          Work Email
          <input type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="text-sm text-slate-700">
          Password
          <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary w-full">Create Account</button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <p className="text-sm text-slate-600">Already registered? <Link href="/login" className="text-sky-700 underline">Login</Link></p>
      </form>
    </main>
  );
}
