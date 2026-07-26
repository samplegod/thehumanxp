"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export default function CommunityLogin() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "signup") setMode("signup");
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/community/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, ...data }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); setBusy(false); return; }
    window.location.href = "/community";
  }
  return <main className="community-auth"><div className="community-auth-glow" /><Link href="/" className="community-back"><ArrowLeft /> Back to HXP</Link><section>
    <p className="conversion-kicker"><Sparkles /> The listening room</p><h1>{mode === "login" ? "Return to the conversation." : "Enter the community."}</h1>
    <p>A thoughtful space for people who want to stay with the questions after the episode ends.</p>
    <form onSubmit={submit}>
      {mode === "signup" && <><label>Name<input name="name" required minLength={2} autoComplete="name" /></label><label>Handle<input name="handle" required minLength={3} pattern="[a-zA-Z0-9-]+" placeholder="your-name" /></label></>}
      <label>Email<input name="email" required type="email" autoComplete="email" /></label>
      <label>Password<input name="password" required type="password" minLength={mode === "signup" ? 10 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="radiant-button" disabled={busy}>{busy ? "Opening…" : mode === "login" ? "Enter community" : "Create profile"} <ArrowRight /></button>
    </form>
    <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? "New here? Create a profile" : "Already a member? Sign in"}</button>
    <aside><b>Local demo</b><span>demo@thehumanxp.com</span><span>hxp-demo-2026</span></aside>
  </section></main>;
}
