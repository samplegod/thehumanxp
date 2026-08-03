import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { getMemberEmail } from "@/lib/member-auth";
import { getStripeMembership } from "@/lib/stripe-membership";

export type MemberAccess = {
  email: string | null;
  active: boolean;
  source: "stripe" | "development-override" | "none";
};

/**
 * TEMPORARY DEVELOPMENT OVERRIDE — REMOVE before the owner account no longer
 * needs local library access. It is intentionally impossible to enable when
 * NODE_ENV is production, requires an explicit flag, and grants access only
 * when the authenticated community email exactly matches the configured email.
 * Stripe remains the source of truth for every other request.
 */
async function getDevelopmentOverrideEmail() {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.HXP_DEV_MEMBER_OVERRIDE !== "true") return null;

  const allowedEmail = process.env.HXP_DEV_MEMBER_EMAIL?.trim().toLowerCase();
  if (!allowedEmail) return null;

  const user = await getCurrentUser();
  const signedInEmail = user?.email.trim().toLowerCase();
  return signedInEmail === allowedEmail ? signedInEmail : null;
}

export async function getMemberAccess(): Promise<MemberAccess> {
  const developmentEmail = await getDevelopmentOverrideEmail();
  if (developmentEmail) {
    return { email: developmentEmail, active: true, source: "development-override" };
  }

  const email = await getMemberEmail();
  if (!email) return { email: null, active: false, source: "none" };

  const membership = await getStripeMembership(email);
  return { email, active: membership.active, source: "stripe" };
}
