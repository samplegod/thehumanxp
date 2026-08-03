import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { MemberAccessForm } from "./access-form";
import "../members.css";

export default function MemberAccessPage() {
  return <main className="members-gate"><div className="members-gate-glow" /><Link href="/"><ArrowLeft /> Back to HXP</Link><section><LockKeyhole /><p className="members-kicker">Private member access</p><h1>Return to<br />the archive.</h1><p>Enter the email attached to your active Stripe membership. We’ll send a secure, 15-minute access link—no password required.</p><MemberAccessForm /><small>Not a member yet? <Link href="/membership">Explore membership.</Link></small></section></main>;
}
