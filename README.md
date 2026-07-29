# THE $1M DESIGN SYSTEM — landing page

Award-tier one-page funnel site. Vanilla HTML/CSS/JS. **GSAP + ScrollTrigger** (scroll
progress, count-ups, parallax) + **Motion.dev** (`inView` reveals, magnetic buttons) +
CSS glassmorphism, aurora, masked type reveals, 3D cover tilt, custom cursor, sticky buy-bar.

## Run
```
python3 -m http.server 5599 --directory .    # then open http://localhost:5599
```
(A `.claude/launch.json` config named **site** is also included for the preview panel.)

## Files
- `index.html` — all sections (nav, hero, problem, thesis, method bento, proof/research, before-after, value stack, testimonials, author, pricing, FAQ, final CTA, footer, buy-bar).
- `css/style.css` — tokens (paper/ink/red `#E3232D`), glass, type (Bebas + Inter + Georgia), all components, responsive, `prefers-reduced-motion`.
- `js/main.js` — motion layer, graceful fallback if CDNs blocked (content still shows).
- `assets/art/` — cover, before/after, graveyard, book render.
- `assets/avatars/` — 6 testimonial portraits (Recraft 4.1, UGC style).

## Before you launch (required)
1. **Checkout:** `[data-checkout]` currently alerts. Point CTAs (`[data-cta]`) + the pricing button to your real checkout (Gumroad / Lemon Squeezy / Stripe).
2. **Price:** every price shows `$5.99` (`[data-price]` spans + the `<s>$88</s>` value anchor). Set your real numbers.
3. **Testimonials = PLACEHOLDER.** The 6 quotes + names in `#testimonials` are samples with AI avatars, clearly disclaimed. **Replace with verified reader quotes before running ads** — fake testimonials are deceptive (and the book preaches against fake proof). Keep or swap the avatars accordingly.
4. **Stats are real + cited** (Lindgaard 2006 · Stanford/Fogg · Baymard) — keep the footnotes.
5. **Perf/CSP:** for production, self-host GSAP, Motion, and the Bebas font instead of the CDNs (faster LCP, cleaner CSP). Add real `<meta>`/OG + favicon.

## Media to add (see chat "signs")
Placeholders reuse existing art; these would level it up: book interior spread, an author
photo, a value-stack product shot, real before/after page screenshots (for an interactive
slider), and optional UGC video testimonials (scripts in `../../UGC/`).
