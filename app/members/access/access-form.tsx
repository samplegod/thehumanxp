"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check, LoaderCircle, Mail } from "lucide-react";

export function MemberAccessForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading"); setMessage("");
    const email = new FormData(event.currentTarget).get("email");
    const response = await fetch("/api/members/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const payload = await response.json();
    setState(response.ok ? "success" : "error"); setMessage(payload.message ?? payload.error ?? "Please try again.");
  }
  return <form className="member-access-form" onSubmit={submit}>
    <label><Mail /><span className="sr-only">Stripe billing email</span><input name="email" type="email" required autoComplete="email" placeholder="Email used for membership" /></label>
    <button disabled={state === "loading"}>{state === "loading" ? <LoaderCircle className="animate-spin" /> : <>Send private access link <ArrowRight /></>}</button>
    {message && <p className={state === "error" ? "is-error" : ""}>{state === "success" && <Check />}{message}</p>}
  </form>;
}
