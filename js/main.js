/* THE $1M DESIGN SYSTEM — motion layer
   Reveals: CSS-class toggled via Motion.inView (or IntersectionObserver fallback).
   Scroll-driven (progress, count-ups, parallax, buy-bar): GSAP + ScrollTrigger.
   Micro-interactions (magnetic, 3D tilt, cursor-glow, custom cursor): direct + Motion. */
(function () {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = !!window.gsap, hasMotion = !!window.Motion;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  if (RM) { document.body.classList.add("reduced"); wireStatic(); return; }
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  let started = false;
  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") init();

  function init() {
    if (started) return; started = true;
    splitLines(); splitWords(); setDelays();
    heroIntro(); reveals(); counters(); scrollUI();
    magnetics(); tilt(); glow(); cursor(); wireStatic();
  }

  /* ---------- text splitting ---------- */
  function splitLines() {
    $$("[data-splitlines]").forEach(el => {
      const parts = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = parts.map(p =>
        `<span class="line-mask" style="display:block;overflow:hidden"><span class="line" style="display:block">${p.trim()}</span></span>`).join("");
    });
  }
  function splitWords() {
    $$("[data-splitwords]").forEach(el => {
      el.innerHTML = el.textContent.trim().split(/\s+/)
        .map(w => `<span class="word" style="display:inline-block">${w}</span>`).join(" ");
    });
  }
  function setDelays() {
    const step = (kids, s) => kids.forEach((k, i) => k.style.transitionDelay = (i * s) + "s");
    $$("[data-stagger]").forEach(el => step([...el.children], 0.07));
    $$("[data-splitlines]").forEach(el => step($$(".line", el), 0.08));
    $$("[data-splitwords]").forEach(el => step($$(".word", el), 0.045));
  }

  /* ---------- reveal on view ---------- */
  const show = el => el.classList.add("in");
  function onView(el, cb) {
    if (hasMotion && window.Motion.inView) {
      window.Motion.inView(el, () => { if (!el.classList.contains("in")) cb(); }, { amount: 0.2 });
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents, o) => ents.forEach(e => { if (e.isIntersecting) { cb(); o.unobserve(e); } }), { threshold: 0.2 });
      io.observe(el);
    } else cb();
  }
  function reveals() {
    const sel = '[data-anim],[data-stagger],[data-splitlines],[data-splitwords]';
    $$(sel).forEach(el => { if (el.closest("#hero")) return; onView(el, () => show(el)); });
  }

  /* ---------- hero intro (immediate, above fold) ---------- */
  function heroIntro() {
    const hero = $("#hero"); if (!hero) return;
    const fades = $$('[data-anim="fade"]', hero);
    fades.forEach((el, i) => el.style.transitionDelay = (0.45 + i * 0.08) + "s");
    const cover = $('[data-anim="cover"]', hero); if (cover) cover.style.transitionDelay = "0.35s";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('[data-splitlines],[data-anim]', hero).forEach(show);
    }));
    // floating chips (visible by default) get a gentle GSAP bob
    if (hasGSAP) $$("[data-float]").forEach((c, i) =>
      gsap.to(c, { y: "+=10", duration: 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
  }

  /* ---------- count-ups (GSAP ScrollTrigger) ---------- */
  function counters() {
    $$("[data-count]").forEach(el => {
      const target = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      const fmt = v => pre + Math.round(v).toLocaleString("en-US") + suf;
      const run = () => {
        if (!hasGSAP) { el.textContent = fmt(target); return; }
        const o = { v: 0 };
        gsap.to(o, { v: target, duration: 1.6, ease: "power2.out", onUpdate: () => el.textContent = fmt(o.v) });
      };
      if (hasGSAP) ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: run });
      else onView(el, run);
    });
  }

  /* ---------- scroll UI: progress, nav, buy-bar, parallax ---------- */
  function scrollUI() {
    const nav = $("#nav"), buybar = $("#buybar"), prog = $("#progress"), hero = $("#hero");
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.width = (scrollY / (h || 1) * 100) + "%";
      if (nav) nav.classList.toggle("scrolled", scrollY > 40);
      if (buybar && hero) buybar.classList.toggle("show", scrollY > hero.offsetHeight - 120);
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    if (hasGSAP && hero) {
      gsap.to(".aurora", { yPercent: 20, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-art", { yPercent: -8, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 } });
    }
  }

  /* ---------- magnetic buttons (direct transform) ---------- */
  function magnetics() {
    $$(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transition = "transform .12s linear";
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.45}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transition = "transform .5s cubic-bezier(.16,1,.3,1)";
        btn.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------- 3D cover tilt ---------- */
  function tilt() {
    const el = $("#coverTilt"); if (!el) return;
    const wrap = el.parentElement;
    wrap.addEventListener("pointermove", e => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1100px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg)`;
    });
    wrap.addEventListener("pointerleave", () => el.style.transform = "perspective(900px) rotateY(0) rotateX(0)");
  }

  /* ---------- cursor-follow glow ---------- */
  function glow() {
    $$("[data-glow]").forEach(el => el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }));
  }

  /* ---------- custom cursor ---------- */
  function cursor() {
    const c = $("#cursor"); if (!c || matchMedia("(hover:none)").matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; });
    (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    $$("a,button,.btn,[data-glow],summary,.magnetic").forEach(el => {
      el.addEventListener("pointerenter", () => c.classList.add("grow"));
      el.addEventListener("pointerleave", () => c.classList.remove("grow"));
    });
  }

  /* ---------- static wiring (runs even without motion) ---------- */
  function wireStatic() {
    // Checkout first, so the smooth-scroll handler below never binds the buy button.
    // The Stripe Payment Link URL is set once in index.html: window.CHECKOUT_URL.
    const CHECKOUT_URL = (window.CHECKOUT_URL || "").trim();
    $$("[data-checkout]").forEach(el => {
      if (CHECKOUT_URL && el.tagName === "A") el.setAttribute("href", CHECKOUT_URL);
      el.addEventListener("click", e => {
        if (!CHECKOUT_URL) {                       // not configured yet — keep them on the page
          e.preventDefault();
          const p = document.querySelector("#pricing");
          if (p) p.scrollIntoView({ behavior: "smooth" });
          return;
        }
        if (el.tagName !== "A") { e.preventDefault(); location.assign(CHECKOUT_URL); }
        // anchors navigate via their href (set above)
      });
    });

    $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
      const id = a.getAttribute("href"); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); t.scrollIntoView({ behavior: "smooth" });
    }));
    $$("[data-acc] details").forEach(d => d.addEventListener("toggle", () => {
      if (d.open) $$("[data-acc] details").forEach(o => { if (o !== d) o.open = false; });
    }));
  }
})();
