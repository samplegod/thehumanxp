"use client";

import { ArrowRight, Check, Heart, LoaderCircle, Mail, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { track, type AnalyticsEvent } from "@/lib/analytics";

export function TrackedLink({
  href,
  event,
  label,
  className,
  children,
}: {
  href: string;
  event: AnalyticsEvent;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return <a href={href} className={className} onClick={() => track(event, { label, href })}>{children}</a>;
}

export function CheckoutLink({ plan, children, className }: { plan: "supporter" | "monthly" | "god"; children: React.ReactNode; className?: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <a
      href={`/api/stripe/checkout?plan=${plan}`}
      className={className}
      aria-busy={loading}
      onClick={() => {
        setLoading(true);
        track("billing_plan_selected", { plan });
        track("checkout_started", { plan });
      }}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : children}
    </a>
  );
}

export function FavoriteButton({ episodeNumber, title }: { episodeNumber: number; title: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("hxp:favorites") ?? "[]") as number[];
    setSaved(favorites.includes(episodeNumber));
  }, [episodeNumber]);
  return (
    <button
      type="button"
      className={`favorite-button ${saved ? "is-saved" : ""}`}
      aria-label={`${saved ? "Remove" : "Save"} ${title}`}
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault();
        const favorites = JSON.parse(localStorage.getItem("hxp:favorites") ?? "[]") as number[];
        const next = saved ? favorites.filter((item) => item !== episodeNumber) : [...new Set([...favorites, episodeNumber])];
        localStorage.setItem("hxp:favorites", JSON.stringify(next));
        setSaved(!saved);
        track("favorite_toggled", { episode: episodeNumber, saved: !saved });
      }}
    ><Heart className="size-4" fill={saved ? "currentColor" : "none"} /></button>
  );
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    const payload = await response.json();
    if (response.ok) {
      setState("success");
      setMessage("You’re on the list. Watch your inbox for the next transmission.");
      track("email_signup", { source: compact ? "footer" : "homepage" });
      event.currentTarget.reset();
    } else {
      setState("error");
      setMessage(payload.error ?? "Signup is temporarily unavailable.");
    }
  }
  return (
    <form className={`newsletter-form ${compact ? "is-compact" : ""}`} onSubmit={submit}>
      <label>
        <Mail className="size-4" />
        <span className="sr-only">Email address</span>
        <input name="email" type="email" required placeholder="Your email address" />
      </label>
      <button type="submit" disabled={state === "loading"}>
        {state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <>Join the dispatch <ArrowRight className="size-4" /></>}
      </button>
      {message && <p className={state === "error" ? "is-error" : ""} role="status">{state === "success" ? <Check className="size-4" /> : <X className="size-4" />}{message}</p>}
    </form>
  );
}

export function CheckoutNotice({ status }: { status?: string }) {
  useEffect(() => {
    if (status === "success") track("checkout_completed");
    if (status === "cancelled") track("checkout_cancelled");
  }, [status]);
  if (status !== "success" && status !== "cancelled") return null;
  return (
    <div className={`checkout-notice ${status}`} role="status">
      {status === "success" ? <Check className="size-5" /> : <X className="size-5" />}
      <div><strong>{status === "success" ? "Welcome to the next chapter." : "Checkout paused."}</strong><span>{status === "success" ? "Your payment was received. Membership fulfillment details will arrive through the contact information used at checkout." : "Nothing was charged. Return whenever the timing feels right."}</span></div>
    </div>
  );
}
