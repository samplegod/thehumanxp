export type AnalyticsEvent =
  | "membership_cta_clicked"
  | "pricing_viewed"
  | "checkout_started"
  | "checkout_completed"
  | "checkout_cancelled"
  | "episode_played"
  | "universe_engaged"
  | "email_signup"
  | "billing_plan_selected"
  | "favorite_toggled";

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const detail = { event, properties, timestamp: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent("hxp:analytics", { detail }));
  const dataLayerWindow = window as Window & { dataLayer?: unknown[] };
  dataLayerWindow.dataLayer?.push(detail);
  if (process.env.NODE_ENV === "development") console.info("[HXP analytics]", detail);
}
