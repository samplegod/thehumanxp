import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, Compass, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";

import { CheckoutLink, CheckoutNotice, NewsletterForm } from "@/components/conversion/conversion-ui";
import { episodes } from "@/lib/episodes";

export const metadata: Metadata = {
  title: "Membership | The Human Experience Podcast",
  description: "Support independent long-form inquiry and help The Human Experience archive continue to grow.",
};

const included = [
  "Direct support for future independent conversations",
  `The complete ${episodes.length}-episode public archive`,
  "The interactive Knowledge Universe",
  "Curated essential-episode pathways",
];

const roadmap = [
  ["The listening room", "A member community for thoughtful reflections, episode discussions, and connection."],
  ["Deeper listening paths", "Guided sequences through consciousness, science, healing, and human potential."],
  ["Closer to the conversation", "Follow listeners with shared interests and continue the inquiry together."],
];

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  return (
    <main className="membership-page">
      <header className="membership-nav">
        <Link href="/"><ArrowLeft className="size-4" /> Back to HXP</Link>
        <Link href="/" className="membership-wordmark"><span>HXP</span><b>The Human Experience<small>Membership</small></b></Link>
        <a href="#pricing">View options <ArrowRight className="size-4" /></a>
      </header>

      <CheckoutNotice status={checkout} />

      <section className="membership-hero">
        <div className="membership-hero-light" aria-hidden="true" />
        <p className="conversion-kicker"><Sparkles className="size-4" /> An invitation to go deeper</p>
        <h1>Support the work.<br /><em>Keep the questions alive.</em></h1>
        <p>The Human Experience has grown into 192 conversations across consciousness, science, philosophy, healing, and human potential. Membership directly supports its next chapter.</p>
        <a href="#pricing" className="radiant-button">Choose your membership <ArrowRight className="size-4" /></a>
        <small>Secure checkout through Stripe · Billing portal required before production launch</small>
      </section>

      <section className="membership-truth">
        <div><p className="conversion-kicker">What membership means today</p><h2>A direct relationship with the work.</h2></div>
        <div><p>HXP membership is first and foremost patronage: a way to fund patient, independent conversations without asking the work to become louder, shorter, or more algorithmic.</p><p>The archive and Knowledge Universe remain open to explore. Paid membership supports their continuation and the member roadmap below as it is released.</p></div>
      </section>

      <section className="membership-included">
        <div className="membership-symbol"><Compass /></div>
        <div><p className="conversion-kicker">Included now</p><h2>Your membership supports access, continuity, and discovery.</h2><ul>{included.map((item) => <li key={item}><Check className="size-4" />{item}</li>)}</ul></div>
      </section>

      <section className="roadmap-section">
        <div className="section-heading"><div><p className="conversion-kicker">Clearly labeled roadmap</p><h2>What member support is building toward.</h2></div><p>These experiences are proposed—not yet promised as currently available benefits.</p></div>
        <div className="roadmap-grid">{roadmap.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><LockKeyhole className="size-5" /><h3>{title}</h3><p>{copy}</p><small>In development</small></article>)}</div>
      </section>

      <section id="pricing" className="membership-pricing">
        <div className="pricing-heading"><p className="conversion-kicker">Choose your support</p><h2>One membership.<br />Two ways to sustain it.</h2><p>The prices below reflect the membership plans already configured for this project.</p></div>
        <div className="pricing-grid">
          <Plan name="Monthly" price="$9" suffix="/ month" plan="monthly" copy="Flexible month-to-month support billed securely through Stripe." />
          <Plan name="Annual" price="$90" suffix="/ year" plan="yearly" copy="$18 less than twelve monthly payments—the equivalent of two months." featured />
        </div>
      </section>

      <section className="membership-faq">
        <div><p className="conversion-kicker">Questions, answered plainly</p><h2>Before you join.</h2></div>
        <div>
          <details open><summary>What do I receive immediately?</summary><p>You can explore the complete public archive, Knowledge Universe, and curated top episodes now. Your payment primarily supports continued independent production while member-specific experiences are developed.</p></details>
          <details><summary>Is the HXP community available?</summary><p>Yes. Every listener can create a profile and join public episode discussions. Paid supporters receive a member badge and access to member-designated spaces as they are introduced.</p></details>
          <details><summary>How does cancellation work?</summary><p>Billing is handled securely by Stripe. Subscription cancellation requires a Stripe billing-portal link or direct support workflow, which must be configured before production launch.</p></details>
          <details><summary>Where does my support go?</summary><p>Membership supports the ongoing research, recording, production, maintenance, and thoughtful organization of The Human Experience archive.</p></details>
        </div>
      </section>

      <section className="membership-final">
        <p className="conversion-kicker">The invitation remains open</p><h2>Help create more room for conversations that refuse the surface.</h2><a href="#pricing" className="radiant-button">Become a member <ArrowRight className="size-4" /></a>
      </section>

      <section className="membership-dispatch"><div><p className="conversion-kicker">Stay close to the work</p><h2>Receive the next transmission.</h2></div><NewsletterForm compact /></section>
    </main>
  );
}

function Plan({ name, price, suffix, plan, copy, featured = false }: { name: string; price: string; suffix: string; plan: "monthly" | "yearly"; copy: string; featured?: boolean }) {
  return (
    <article className={featured ? "is-featured" : ""}>
      {featured && <span className="plan-badge">Best annual value</span>}
      <p>{name}</p><h3>{price}<small>{suffix}</small></h3><p>{copy}</p>
      <ul>{included.map((item) => <li key={item}><Check className="size-3.5" />{item}</li>)}</ul>
      <CheckoutLink plan={plan} className={featured ? "radiant-button" : "outline-button"}>Continue with {name.toLowerCase()} <ArrowRight className="size-4" /></CheckoutLink>
      <small>Secure Stripe checkout · No hidden fees</small>
    </article>
  );
}
