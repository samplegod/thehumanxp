import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function resolveReport(formData: FormData) {
  "use server";
  const user = await requireUser();
  if (user.role !== "admin") return;
  await db.report.update({ where: { id: String(formData.get("id")) }, data: { status: "resolved" } });
  revalidatePath("/community/admin");
}
export default async function AdminPage() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/community");
  const reports = await db.report.findMany({ include: { reporter: true, post: { include: { author: true } } }, orderBy: { createdAt: "desc" } });
  return <main className="community-subpage narrow"><header><Link href="/community"><ArrowLeft /> Community</Link><span>Moderator workspace</span></header><section className="subpage-heading"><Shield /><p className="conversion-kicker">Community care</p><h1>Moderation</h1><p>Review listener reports without exposing private messages or unnecessary personal information.</p></section><section className="report-list">{reports.length ? reports.map(r => <article key={r.id}><span>{r.status}</span><b>{r.reason}</b><p>{r.post?.body ?? "Reported content is no longer available."}</p><small>Reported by @{r.reporter.handle}</small>{r.status === "open" && <form action={resolveReport}><input type="hidden" name="id" value={r.id} /><button>Mark resolved</button></form>}</article>) : <div className="empty-state"><Shield /><h2>The room is calm.</h2><p>There are no community reports to review.</p></div>}</section></main>;
}
