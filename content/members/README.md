# HXP members library content

Add or edit releases in `library.json`; the `/members` shelves and release pages are generated from that file.

Each item needs a unique `slug`, one of the seven existing `category` values, display metadata, `topics`, and a `body` array. Set `featured` on one item to make it the lead release. Set `available` to `false` for an upcoming item. An optional `href` can point to a private audio, PDF, or download URL; without one, HXP creates an internal reading page at `/members/[slug]`.

Keep paid media in private, signed storage before replacing the sample content. Files placed directly in `public/` are not protected by the Stripe gate.
