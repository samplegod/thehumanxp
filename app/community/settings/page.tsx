import Link from "next/link";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function updateProfile(formData: FormData) {
  "use server";
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 500);
  const location = String(formData.get("location") ?? "").trim().slice(0, 80);
  const interests = String(formData.get("interests") ?? "").split(",").map(v => v.trim()).filter(Boolean).slice(0, 10);
  if (name.length < 2) return;
  await db.user.update({ where: { id: user.id }, data: { name, bio, location: location || null, showLocation: formData.get("showLocation") === "on", interests: JSON.stringify(interests) } });
  revalidatePath("/community/settings");
}
async function deleteAccount(formData: FormData) {
  "use server";
  const user = await requireUser();
  if (formData.get("confirmation") !== "DELETE") return;
  await db.user.delete({ where: { id: user.id } });
  await clearSession();
  redirect("/");
}

export default async function SettingsPage() {
  const user = await requireUser();
  const interests = JSON.parse(user.interests || "[]").join(", ");
  return <main className="community-subpage narrow"><header><Link href="/community"><ArrowLeft /> Community</Link><span>Profile & privacy</span></header><section className="subpage-heading"><UserRound /><p className="conversion-kicker">Your presence</p><h1>Membership profile</h1><p>Share only what helps meaningful connection. Your email and private messages are never shown publicly.</p><div className="profile-membership-status"><span>{user.membership === "paid" ? "Supporting member" : "Free community profile"}</span><p>{user.membership === "paid" ? "Your profile carries the luminous HXP supporter badge." : "Your free profile includes community conversations, connections, and episode rooms."}</p>{user.membership !== "paid" && <Link href="/membership">Explore supporting membership</Link>}</div></section><form action={updateProfile} className="settings-form"><label>Name<input name="name" defaultValue={user.name} required minLength={2} maxLength={60} /></label><label>Handle<input value={`@${user.handle}`} disabled /></label><label>Bio<textarea name="bio" defaultValue={user.bio} maxLength={500} /></label><label>Interests <small>Comma-separated</small><input name="interests" defaultValue={interests} /></label><label>Location<input name="location" defaultValue={user.location ?? ""} maxLength={80} /></label><label className="check-row"><input name="showLocation" type="checkbox" defaultChecked={user.showLocation} /> Show my location on my public profile</label><button className="radiant-button">Save profile <Save /></button></form><section className="danger-zone"><h2>Delete account</h2><p>This permanently removes your profile, posts, comments, follows, messages, and community data.</p><form action={deleteAccount}><label>Type DELETE to confirm<input name="confirmation" required pattern="DELETE" /></label><button>Delete my account</button></form></section></main>;
}
