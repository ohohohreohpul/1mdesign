# Checkout setup — THE $1M DESIGN SYSTEM

The site is a static page with no backend, so checkout uses a **Stripe Payment Link**
(Stripe-hosted checkout). No server, no API keys in the browser. You get card + Apple Pay +
Google Pay, promo codes, receipts, and a redirect to your delivery page — all handled by Stripe.

## How the flow works

```
Buy button (site)
      │  window.CHECKOUT_URL  →  https://buy.stripe.com/…   (your Payment Link)
      ▼
Stripe-hosted checkout  →  card / Apple Pay / Google Pay, email, optional promo code
      │  on success (redirect)
      ▼
thanks.html  →  download links (PDF, ePub, Kit, Visual Library)  +  Stripe emails the receipt
```

Only **one** edit is needed in the code: paste the Payment Link into `site/index.html`
(the `window.CHECKOUT_URL = "";` line). Everything else is already wired.

---

## Option A — Stripe Dashboard (no code, ~5 min)

1. **Create the product.** Dashboard → *Product catalog* → **Add product**.
   - Name: `The $1M Design System`
   - Description: `124-page book (PDF + ePub) + Product Marketing Kit + Visual Library + lifetime updates.`
   - Image: upload `site/assets/art/book-render.png`.
2. **Add the price.**
   - **One-time**, Amount **`5.99` USD**. *(The `$88` on the page is a marketing anchor only — do not enter it in Stripe.)*
3. **Create the Payment Link.** Product page → **Create payment link** (or *Payment Links* → New).
   - Select the $5.99 price, quantity fixed at 1 (turn **off** "let customers adjust quantity").
   - **After payment → Redirect customers to a page** → `https://YOURDOMAIN/thanks.html`
   - **Collect customer email**: on (needed for the receipt + refunds).
   - **Promotion codes**: on (optional, lets you run launch codes).
   - **Automatic tax**: optional — turn on only if you've set up Stripe Tax and registered where required.
   - Apple Pay / Google Pay / Link appear automatically on eligible devices.
4. **Copy the link** — it looks like `https://buy.stripe.com/XXXXXXXX`.
5. **Paste it** into `site/index.html`:
   ```html
   <script>window.CHECKOUT_URL = "https://buy.stripe.com/XXXXXXXX";</script>
   ```
6. Done. Every "Get the book" button now funnels to the pricing card, and the pricing button opens Stripe.

---

## Option B — Stripe CLI / API (scripted)

Install the CLI and `stripe login` first. Run in **test mode** with a test key, then repeat with your live key.

```bash
# 1) Product
stripe products create \
  --name="The $1M Design System" \
  --description="124-page book (PDF + ePub) + Product Marketing Kit + Visual Library + lifetime updates."
# → note the product id: prod_XXX

# 2) Price — $5.99 one-time (amounts are in cents)
stripe prices create \
  --product=prod_XXX \
  --unit-amount=599 \
  --currency=usd
# → note the price id: price_XXX

# 3) Payment Link → redirect to your delivery page on success
stripe payment_links create \
  --line-items="[{\"price\":\"price_XXX\",\"quantity\":1}]" \
  -d "after_completion[type]=redirect" \
  -d "after_completion[redirect][url]=https://YOURDOMAIN/thanks.html" \
  -d "allow_promotion_codes=true"
# → returns url: https://buy.stripe.com/XXXX  → paste into index.html
```

---

## Digital delivery

The buyer lands on `thanks.html`, which hosts the download links, and Stripe emails the receipt.
Drop the real files in `site/assets/downloads/` keeping these names, or swap each `href` for a hosted URL:

- `the-1m-design-system.pdf`
- `the-1m-design-system.epub`
- `product-marketing-kit.zip`
- `visual-library.zip`

Trade-off to know: a public `thanks.html` means the download URLs aren't individually gated —
fine for a $5.99 product (many creators do exactly this). If you later want per-buyer, expiring
links, move fulfilment to a provider (Gumroad/Lemon Squeezy/Payhip) or add a tiny serverless
function that verifies the Stripe session and issues a signed link. Not needed to launch.

## Refunds

7-day policy is stated on the page and on `thanks.html`. Refund from the Stripe payment
(Dashboard → Payments → the charge → **Refund**), or `stripe refunds create --charge=ch_XXX`.

## Go-live checklist

- [ ] Payment Link created with the **$5.99** price and quantity locked to 1
- [ ] Success redirect set to your real `https://YOURDOMAIN/thanks.html`
- [ ] Link pasted into `index.html` `window.CHECKOUT_URL`
- [ ] Real files uploaded to `site/assets/downloads/` (or hrefs swapped)
- [ ] `hello@YOURDOMAIN` on `thanks.html` replaced with your support address
- [ ] Tested one full **test-mode** purchase (card `4242 4242 4242 4242`, any future date/CVC)
- [ ] Switched Payment Link + files to **live**, ran one real purchase, then refunded it

---

## Want me to run the Stripe side next time?

There is **no Stripe MCP connected** in this session, so I can't create the product/price/link in
your account directly right now. To let me do it end-to-end next time, add the Stripe MCP server
(the official `@stripe/mcp`, pointed at a **restricted** key) to your Claude config. Once it's
connected, I can create the product, the $5.99 price, and the Payment Link, and paste the URL into
`index.html` for you.
