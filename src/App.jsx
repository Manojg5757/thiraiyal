import { useEffect, useRef } from 'react';
import logo from './assets/logo.png';
import hero from './assets/hero.jpg';

const PHONE = '+91 63824 63706';
const TEL = 'tel:+916382463706';
const WA = 'https://wa.me/916382463706?text=' + encodeURIComponent('Hello Thiraiyal Health Care, I would like to book an appointment.');
const WA_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z"/></svg>';
const waIcon = <span className="ico-inline" dangerouslySetInnerHTML={{ __html: WA_ICON }} />;
const phoneIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;

export default function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let pageCalm = 0;
    let touchCalm = 0;
    function computeCalm() {
      const book = document.getElementById('book');
      const max = Math.max(1, book.offsetTop - innerHeight * 0.5);
      pageCalm = clamp(scrollY / max, 0, 1);
    }
    addEventListener('scroll', computeCalm, { passive: true });
    addEventListener('resize', computeCalm);

    const calm = () => clamp(pageCalm + touchCalm * (1 - pageCalm), 0, 1);
    const bpmOf = (c) => Math.round(lerp(118, 72, c));

    const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
    function beat(p) {
      return 0.12 * g(p, 0.12, 0.025) - 0.14 * g(p, 0.23, 0.01) + 1 * g(p, 0.26, 0.012) - 0.28 * g(p, 0.29, 0.012) + 0.26 * g(p, 0.48, 0.045);
    }

    function makeTrace(canvas, opts) {
      const ctx = canvas.getContext('2d');
      let W = 0, H = 0, dpr = 1, phase = 0, hist = [], pointer = null;
      function size() {
        dpr = Math.min(devicePixelRatio || 1, 2);
        const r = canvas.getBoundingClientRect();
        W = Math.max(10, r.width); H = Math.max(10, r.height);
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        hist = new Array(Math.ceil(W / opts.step) + 2).fill(0);
      }
      size();
      addEventListener('resize', size);
      let seed = 1;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

      function sample(c) {
        const bpm = bpmOf(c);
        phase += (bpm / 60) * opts.dt;
        if (phase > 1) phase -= 1;
        const jitter = (1 - c) * (rnd() - 0.5) * 0.22 + (1 - c) * Math.sin(phase * 40) * 0.04;
        const extra = (1 - c) > 0.5 ? 0.5 * g((phase + 0.5) % 1, 0.26, 0.012) * (1 - c) : 0;
        return beat(phase) * lerp(1.15, 0.9, c) + jitter + extra;
      }

      function draw() {
        const c = calm();
        const n = opts.speed;
        for (let k = 0; k < n; k++) {
          hist.push(sample(c));
          hist.shift();
        }

        ctx.clearRect(0, 0, W, H);
        if (opts.grid) {
          ctx.strokeStyle = 'rgba(255,255,255,.07)';
          ctx.lineWidth = 1;
          for (let x = 0; x < W; x += 24) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
          }
          for (let y = 0; y < H; y += 24) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
          }
        }

        const base = H * opts.base, amp = H * opts.amp;
        const col = c < 0.5 ? opts.hot : opts.cool;
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.25, col);
        grad.addColorStop(1, col);
        ctx.strokeStyle = grad;
        ctx.lineWidth = opts.width;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = col;
        ctx.shadowBlur = opts.glow;
        ctx.beginPath();
        for (let i = 0; i < hist.length; i++) {
          const x = i * opts.step;
          let y = base - hist[i] * amp;
          if (pointer) {
            const d = Math.abs(x - pointer.x);
            y += (pointer.y - y) * 0.18 * Math.exp(-(d * d) / 9000);
          }
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        const lx = (hist.length - 1) * opts.step;
        const ly = base - hist[hist.length - 1] * amp;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(lx, ly, opts.width + 1.5, 0, 7);
        ctx.fill();
        if (opts.onFrame) opts.onFrame(c);
      }

      return { draw, setPointer: (p) => (pointer = p), size };
    }

    const big = document.getElementById('ecg');
    const heroWord = document.getElementById('heroWord');
    const hint = document.getElementById('hintText');
    const bigTrace = makeTrace(big, {
      step: 3,
      speed: 2,
      dt: (1 / 60 / 2) * 1.0,
      base: 0.62,
      amp: 0.34,
      width: 3,
      glow: 16,
      grid: true,
      hot: '#FF8A73',
      cool: '#7EF0DD',
      onFrame(c) {
        heroWord.classList.toggle('calm', c > 0.45);
      },
    });

    let holding = false;
    function ptr(e) {
      const r = big.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }

    big.addEventListener('pointerdown', (e) => {
      holding = true;
      bigTrace.setPointer(ptr(e));
      hint.textContent = 'Care begins with listening.';
    });
    big.addEventListener('pointermove', (e) => {
      if (holding || e.pointerType === 'mouse') bigTrace.setPointer(ptr(e));
    });

    const release = () => {
      holding = false;
      hint.textContent = 'Thoughtful care, one conversation at a time.';
    };

    big.addEventListener('pointerup', release);
    big.addEventListener('pointercancel', release);
    big.addEventListener('pointerleave', () => {
      release();
      bigTrace.setPointer(null);
    });

    function loop() {
      touchCalm = holding ? Math.min(1, touchCalm + 0.012) : Math.max(0, touchCalm - 0.004);
      bigTrace.draw();
      requestAnimationFrame(loop);
    }

    computeCalm();
    if (reduce) {
      bigTrace.draw();
      setInterval(() => bigTrace.draw(), 500);
    } else {
      requestAnimationFrame(loop);
    }

    const stages = [
      { name: 'Listen', progress: 25, ico: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12h24a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H20l-8 7v-7H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"/><path d="M13 21h.01M20 21h.01M27 21h.01"/><path d="M40 18c3 3 3 9 0 12"/></svg>' },
      { name: 'Understand', progress: 50, ico: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="21" cy="21" r="12"/><path d="M30 30l11 11"/><path d="M14 22h4l2-5 3 9 2-4h3"/></svg>' },
      { name: 'Discuss', progress: 75, ico: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="7" width="30" height="36" rx="5"/><path d="M17 7v-1a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v1"/><path d="M24 18v12M18 24h12"/></svg>' },
      { name: 'Follow up', progress: 100, ico: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 41s-15-9-15-21a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 12-15 21-15 21z"/><path d="M17 23h5l2-4 3 7 2-3h3"/></svg>' },
    ];

    const arrive = { name: 'Start here', progress: 0, ico: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="14" r="6"/><path d="M12 42c0-8 5-14 12-14s12 6 12 14"/><path d="M38 8l2-3M41 13h3"/></svg>' };
    const nodesG = document.getElementById('nodes');
    const R = 128, C = 2 * Math.PI * R;
    stages.forEach((s, i) => {
      const a = -Math.PI / 2 + ((i + 1) / 4) * 2 * Math.PI;
      const x = 150 + R * Math.cos(a), y = 150 + R * Math.sin(a);
      nodesG.insertAdjacentHTML(
        'beforeend',
        `<g class="node" data-i="${i}"><circle cx="${x}" cy="${y}" r="15" fill="var(--surface)" stroke="var(--line)" stroke-width="3"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="var(--ink-2)">${i + 1}</text></g>`
      );
    });

    const ringProg = document.getElementById('ringProg');
    const stageIco = document.getElementById('stageIco');
    const stageName = document.getElementById('stageName');
    const progressBar = document.getElementById('progressBar');
    const progressLabel = document.getElementById('progressLabel');
    const stepEls = [...document.querySelectorAll('.step')];
    let shown = -2;

    function setStage(idx) {
      if (idx === shown) return;
      shown = idx;
      const s = idx < 0 ? arrive : stages[idx];
      stageIco.innerHTML = s.ico;
      stageName.textContent = s.name;
      if (!reduce) {
        stageIco.animate([{ transform: 'scale(.6) rotate(-12deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1.2)' });
      }
      progressLabel.textContent = `${s.progress}%`;
      progressBar.style.width = `${s.progress}%`;
      nodesG.querySelectorAll('.node').forEach((n) => {
        const on = +n.dataset.i <= idx;
        n.querySelector('circle').setAttribute('fill', on ? 'var(--teal)' : 'var(--surface)');
        n.querySelector('circle').setAttribute('stroke', on ? 'var(--teal)' : 'var(--line)');
        n.querySelector('text').setAttribute('fill', on ? 'var(--bg)' : 'var(--ink-2)');
      });
      stepEls.forEach((el, i) => el.classList.toggle('on', i === idx));
    }

    function journeyScroll() {
      const story = document.querySelector('.steps');
      const r = story.getBoundingClientRect();
      const mid = innerHeight * 0.55;
      let idx = -1;
      stepEls.forEach((el, i) => {
        const b = el.getBoundingClientRect();
        if (b.top < mid) idx = i;
      });
      const total = r.height - innerHeight * 0.3;
      const prog = clamp((mid - r.top) / Math.max(1, total), 0, 1);
      ringProg.setAttribute('stroke-dashoffset', (C * (1 - prog)).toFixed(1));
      setStage(idx);
    }

    addEventListener('scroll', journeyScroll, { passive: true });
    addEventListener('resize', journeyScroll);
    setStage(-1);
    journeyScroll();

    const rises = [...document.querySelectorAll('.rise, .step-card, .svc, .doc, .promise-item, .stat, .side-card, .form-card')];
    if (!reduce && 'IntersectionObserver' in window) {
      rises.forEach((el) => {
        el.classList.add('reveal');
        if (el.getBoundingClientRect().top > innerHeight) el.classList.add('below');
      });
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            e.target.classList.remove('below');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      rises.forEach((el) => io.observe(el));
    } else {
      rises.forEach((el) => {
        el.classList.add('reveal', 'is-visible');
      });
    }

    document.querySelectorAll('[data-count]').forEach((el) => {
      if (reduce) return;
      const to = +el.dataset.count;
      const suf = el.dataset.suffix || '';
      const t0 = performance.now();
      const step = (t) => {
        const k = clamp((t - t0) / 1600, 0, 1);
        const e = 1 - (1 - k) ** 3;
        el.textContent = Math.round(to * e).toLocaleString('en-IN') + suf;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    const services = ['Electropathy consultation', 'Yoga', 'Psychological Counselling'];
    const state = { service: null, day: null, slot: null };

    function chipGroup(el, items, key, render) {
      items.forEach((it, i) => {
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'chip';
        c.id = `${key}-${i}`;
        c.setAttribute('aria-pressed', 'false');
        render(c, it);
        c.addEventListener('click', () => {
          el.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', 'false'));
          c.setAttribute('aria-pressed', 'true');
          state[key] = it.value ?? it;
          updateSummary();
        });
        el.appendChild(c);
      });
    }

    chipGroup(document.getElementById('serviceChips'), services, 'service', (c, s) => {
      c.textContent = s;
    });
    document.querySelectorAll('[data-service]').forEach((a) => {
      a.addEventListener('click', () => document.getElementById(`service-${a.dataset.service}`).click());
    });

    const nav = document.querySelector('.nav');
    const menuBtn = document.getElementById('menuBtn');
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));

    const visitDate = document.getElementById('visitDate');
    const now = new Date();
    visitDate.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    visitDate.addEventListener('change', (e) => {
      state.day = e.target.value || null;
      updateSummary();
    });

    function buildSlots() {
      const am = document.getElementById('amSlots');
      am.innerHTML = '';
      state.slot = null;
      chipGroup(am, ['Morning', 'Afternoon', 'Evening'], 'slot', (c, s) => {
        c.textContent = s;
      });
    }

    buildSlots();

    const summary = document.getElementById('summary');
    function updateSummary() {
      const parts = [];
      if (state.service) parts.push(state.service);
      if (state.day) parts.push(new Date(state.day).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));
      if (state.slot) parts.push(state.slot);
      summary.textContent = parts.length ? `Requested: ${parts.join(' · ')}` : 'No date chosen? We will suggest the next available time.';
    }
    document.getElementById('service-0').click();

    const form = document.getElementById('bookForm');
    function setErr(id, msg) {
      const f = document.getElementById(id);
      f.classList.toggle('bad', !!msg);
      f.querySelector('.err').textContent = msg || '';
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.pname.value.trim();
      const phone = form.pphone.value.replace(/\D/g, '');
      let ok = true;
      if (name.length < 2) {
        setErr('f-name', "Please enter the patient's name.");
        ok = false;
      } else setErr('f-name');

      if (!/^[6-9]\d{9}$/.test(phone.slice(-10)) || phone.length < 10) {
        setErr('f-phone', 'Enter a 10-digit mobile number.');
        ok = false;
      } else setErr('f-phone');

      if (!ok) return;
      const mobile = phone.slice(-10);
      const requestedDate = state.day ? new Date(state.day).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Any day';
      const message = [
        'Hello Thiraiyal Health Care, I would like to book an appointment.',
        '',
        `Name: ${name}`,
        `Mobile: ${mobile}`,
        `Age: ${form.page.value || '-'}`,
        `Service: ${state.service || '-'}`,
        `Preferred date: ${requestedDate}`,
        `Preferred time: ${state.slot || 'Any time'}`,
        `Language: ${form.plang.value}`,
        `Concern: ${form.pnote.value.trim() || '-'}`,
      ].join('\n');
      const waLink = `https://wa.me/916382463706?text=${encodeURIComponent(message)}`;
      const safeName = name.replace(/[<>&"]/g, '');
      const card = document.getElementById('formCard');
      card.innerHTML = `<div class="confirm" role="status">
        <svg class="check" viewBox="0 0 92 92" fill="none" stroke="var(--teal)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="46" cy="46" r="40"/><path d="M29 47l11 11 23-24"/></svg>
        <h3>Almost done, ${safeName}!</h3>
        <p>WhatsApp has opened with your booking details. <b>Tap Send</b> to share them with us.<br />Our team will call you on <b>${mobile}</b> to confirm your appointment time.</p>
        <a class="btn btn-wa" href="${waLink}" target="_blank" rel="noopener" style="margin-top:18px">${WA_ICON} Open WhatsApp again</a>
        <p class="preview-note">No WhatsApp? Call us at <a href="tel:+916382463706">+91 63824 63706</a> and we will book it for you.</p>
      </div>`;
      window.open(waLink, '_blank', 'noopener');
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });

    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', () => {
      const txt = document.getElementById('phoneNum').textContent;
      const done = () => {
        copyBtn.textContent = 'Copied';
        setTimeout(() => (copyBtn.textContent = 'Copy'), 1600);
      };
      try {
        navigator.clipboard.writeText(txt).then(done, () => selectNum());
      } catch {
        selectNum();
      }
      function selectNum() {
        const r = document.createRange();
        r.selectNodeContents(document.getElementById('phoneNum'));
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
        copyBtn.textContent = 'Selected';
      }
    });
  }, []);

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <a className="logo" href="#top" aria-label="Thiraiyal Health Care home">
            <img src={logo} alt="Thiraiyal Health Care logo" className="brand-logo" />
            <span className="logo-text"><b>Thiraiyal</b><small>HEALTH CARE</small></span>
          </a>
          <nav className="nav-links" id="navLinks" aria-label="Sections">
            <a href="#services">Services</a><a href="#care">How it works</a><a href="#book">Book appointment</a><a href="#visit">Contact</a>
          </nav>
          <div className="nav-right">
            <a className="nav-call" href={TEL} aria-label={`Call ${PHONE}`}>{phoneIcon}<span>{PHONE}</span></a>
            <a className="btn btn-primary" href="#book">Book<span>&nbsp;appointment</span></a>
            <button className="menu-btn" id="menuBtn" type="button" aria-label="Menu" aria-controls="navLinks" aria-expanded="false">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="rise">
              <div className="eyebrow">Electropathy clinic · Trichy</div>
              <h1>Personal care for you and your family, <em id="heroWord">close to home.</em></h1>
              <p className="lede">Consult Dr. T. Kaviyarasu, Founder &amp; Chairman of Thiraiyal Health Care. Book online in under a minute, and our team will call you to confirm your visit.</p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#book">Book an appointment
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
                <a className="btn btn-ghost" href={TEL}>{phoneIcon} Call {PHONE}</a>
              </div>
              <ul className="hero-trust">
                <li>Consultations in Tamil &amp; English</li>
                <li>Confirmation by phone call</li>
                <li>Book on WhatsApp or by phone</li>
              </ul>
            </div>

            <div className="monitor rise" id="monitor">
              <img src={hero} alt="Doctor consulting a patient" className="hero-photo" />
              <canvas id="ecg" aria-hidden="true"></canvas>
              <div className="monitor-top">
                <div className="doctor-tag">
                  <b>Thiraiyal Health Care</b>
                  <span>Trichy, Tamil Nadu</span>
                </div>
              </div>
              <div className="monitor-hint"><span id="hintText">Thoughtful care, one conversation at a time.</span></div>
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <div className="wrap">
            <div className="section-head rise">
              <div className="eyebrow">Our services</div>
              <h2>Holistic care for body and mind.</h2>
              <p>Alongside our health care services, we offer personalised yoga and professional psychological counselling.</p>
            </div>

            <article className="service-row rise">
              <div className="service-media">
                <img className="media-main" src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80" alt="Woman meditating in a seated yoga pose" loading="lazy" decoding="async" />
                <img className="media-sub" src="https://images.unsplash.com/photo-1758274535230-3641d0632878?auto=format&fit=crop&w=600&q=80" alt="Group yoga class outdoors" loading="lazy" decoding="async" />
              </div>
              <div className="service-body">
                <div className="tagline">Body &amp; breath</div>
                <h3>Yoga Therapy &amp; Classes</h3>
                <p>Guided yoga sessions tailored to each client to improve flexibility, strength, posture and inner calm. Every program starts with an assessment of the client's health, goals and comfort level.</p>
                <ul className="offerings">
                  <li><b>Personal Yoga Sessions</b><span>One-to-one, at your pace.</span></li>
                  <li><b>Therapeutic Yoga</b><span>Gentle practice for back pain, stress, sleep and lifestyle conditions.</span></li>
                  <li><b>Pranayama &amp; Meditation</b><span>Breathing and mindfulness for focus and emotional balance.</span></li>
                  <li><b>Group Classes</b><span>Small batches for beginners and regular practitioners.</span></li>
                </ul>
                <a className="btn btn-primary" href="#book" data-service="1">Book a Yoga Session
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
              </div>
            </article>

            <article className="service-row flip rise">
              <div className="service-media">
                <img className="media-main" src="https://images.unsplash.com/photo-1758273241086-f3585ef8c2f8?auto=format&fit=crop&w=1200&q=80" alt="Counsellor listening to a client" loading="lazy" decoding="async" />
                <img className="media-sub" src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=600&q=80" alt="One-to-one conversation" loading="lazy" decoding="async" />
              </div>
              <div className="service-body">
                <div className="tagline">Mind &amp; wellbeing</div>
                <h3>Psychological Counselling</h3>
                <p>A safe, confidential and non-judgemental space to talk through what you are facing. Sessions help clients understand their thoughts and emotions, build coping skills and move forward with clarity.</p>
                <ul className="offerings">
                  <li><b>Individual Counselling</b><span>Stress, anxiety, low mood, grief and life changes.</span></li>
                  <li><b>Relationship &amp; Family Counselling</b><span>Support for couples, parents and families.</span></li>
                  <li><b>Student &amp; Career Guidance</b><span>Exam stress, motivation and career decisions.</span></li>
                  <li><b>Workplace Wellbeing</b><span>Burnout, resilience and work-life balance.</span></li>
                </ul>
                <a className="btn btn-primary" href="#book" data-service="2">Book a Counselling Session
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
                <p className="service-note">All sessions are strictly confidential. If you are in crisis or immediate danger, please contact your local emergency services.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="journey" id="care">
          <div className="wrap">
            <div className="section-head rise">
              <div className="eyebrow">Your consultation</div>
              <h2>A considered conversation about care.</h2>
              <p>Understand the electropathy approach, ask questions, and discuss what may be appropriate for your situation.</p>
            </div>
            <div className="story">
              <div className="stage-visual" aria-hidden="true">
                <div className="ring-wrap">
                  <svg viewBox="0 0 300 300" id="ring">
                    <circle cx="150" cy="150" r="128" fill="none" stroke="var(--line)" strokeWidth="10" />
                    <circle id="ringProg" cx="150" cy="150" r="128" fill="none" stroke="var(--teal)" strokeWidth="10" strokeLinecap="round" transform="rotate(-90 150 150)" strokeDasharray="804.2" strokeDashoffset="804.2" />
                    <g id="nodes"></g>
                  </svg>
                  <div className="ring-center">
                    <div>
                      <div className="ico" id="stageIco"></div>
                      <div className="stage-name" id="stageName">Start here</div>
                    </div>
                  </div>
                  <div className="worry">CONSULTATION <span className="bar"><i id="progressBar"></i></span> <b id="progressLabel">0%</b></div>
                </div>
              </div>

              <div className="steps">
                <article className="step" data-stage="0">
                  <div className="step-card">
                    <div className="tagline">Step 1 · Listen</div>
                    <h3>Start with your concerns.</h3>
                    <p>Share what has brought you in, your health history, and the questions you want answered.</p>
                  </div>
                </article>
                <article className="step" data-stage="1">
                  <div className="step-card">
                    <div className="tagline">Step 2 · Understand</div>
                    <h3>Learn about the approach.</h3>
                    <p>Discuss what electropathy involves, what is known and what remains uncertain, and how it relates to your current care.</p>
                  </div>
                </article>
                <article className="step" data-stage="2">
                  <div className="step-card">
                    <div className="tagline">Step 3 · Discuss</div>
                    <h3>Make an informed choice.</h3>
                    <p>Talk through suitable next steps and make decisions based on your needs, preferences, and existing medical advice.</p>
                  </div>
                </article>
                <article className="step" data-stage="3">
                  <div className="step-card">
                    <div className="tagline">Step 4 · Follow up</div>
                    <h3>Agree on what comes next.</h3>
                    <p>Before you leave, clarify any follow-up you may need and how to contact the clinic with questions.</p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="booking" id="book">
          <div className="wrap">
            <div className="section-head rise">
              <div className="eyebrow">Appointment</div>
              <h2>Book an appointment.</h2>
              <p>Fill in your details and send them to us on WhatsApp. Our team will call you to confirm the date and time.</p>
            </div>
            <div className="book-grid">
              <div className="form-card" id="formCard">
                <form id="bookForm" noValidate>
                  <div className="form-step">
                    <div className="lbl"><span className="n">1</span>What would you like to book?</div>
                    <div className="chips wrapchips" id="serviceChips" role="group" aria-label="Service"></div>
                  </div>
                  <div className="form-step">
                    <div className="lbl"><span className="n">2</span>Your details</div>
                    <div className="fields">
                      <div className="field" id="f-name"><label htmlFor="pname">Patient name *</label><input id="pname" name="pname" autoComplete="name" placeholder="e.g. Lakshmi R" /><div className="err"></div></div>
                      <div className="field" id="f-phone"><label htmlFor="pphone">Mobile number *</label><input id="pphone" name="pphone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" /><div className="err"></div></div>
                      <div className="field"><label htmlFor="page">Age</label><input id="page" name="page" inputMode="numeric" placeholder="Years" /></div>
                      <div className="field"><label htmlFor="plang">Preferred language</label><select id="plang" name="plang"><option>Tamil</option><option>English</option></select></div>
                    </div>
                  </div>
                  <div className="form-step">
                    <div className="lbl"><span className="n">3</span>When would you like to come? <small className="opt">(optional)</small></div>
                    <div className="field"><input id="visitDate" name="visitDate" type="date" aria-label="Preferred date" /></div>
                    <div className="chips wrapchips" id="amSlots" role="group" aria-label="Preferred time of day"></div>
                  </div>
                  <div className="form-step">
                    <div className="lbl"><span className="n">4</span>Health concern <small className="opt">(optional)</small></div>
                    <div className="field"><textarea id="pnote" name="pnote" rows="3" aria-label="Health concern" placeholder="e.g. Joint pain for 2 weeks"></textarea></div>
                  </div>
                  <div className="submit-row">
                    <button className="btn btn-wa" type="submit" id="submitBtn">{waIcon} Book on WhatsApp</button>
                    <span className="summary-line" id="summary"></span>
                  </div>
                  <p className="preview-note">Prefer to talk? Call <a href={TEL}>{PHONE}</a> and we will book it for you.</p>
                </form>
              </div>

              <aside className="side-card" id="visit">
                <h3>How booking works</h3>
                <ol className="how">
                  <li><b>Send your request</b><span>Fill the form, or simply call or WhatsApp us.</span></li>
                  <li><b>We call you back</b><span>Our team confirms a suitable date and time.</span></li>
                  <li><b>Visit the clinic</b><span>Meet the doctor at your confirmed time.</span></li>
                </ol>
                <h3>Contact us</h3>
                <div className="contact-line"><span>Call</span><a className="num" id="phoneNum" href={TEL}>{PHONE}</a><button className="copy" type="button" id="copyBtn">Copy</button></div>
                <div className="contact-line"><span>WhatsApp</span><a href={WA} target="_blank" rel="noopener">Chat with us</a></div>
                <div className="contact-line"><span>Email</span><a href="mailto:thiraiyalhealthcare@gmail.com">thiraiyalhealthcare@gmail.com</a></div>
                <div className="contact-line"><span>Location</span><span>Trichy, Tamil Nadu</span></div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-main">
            <div className="footer-brand">
              <a className="logo" href="#top" aria-label="Thiraiyal Health Care home">
                <img src={logo} alt="" className="brand-logo" />
                <span className="logo-text"><b>Thiraiyal</b><small>HEALTH CARE</small></span>
              </a>
              <p>Electropathy consultations in Trichy.</p>
            </div>
            <div className="footer-block">
              <h2>Contact</h2>
              <a href="tel:+916382463706">+91 63824 63706</a>
              <a href="mailto:thiraiyalhealthcare@gmail.com">thiraiyalhealthcare@gmail.com</a>
              <span>Trichy, Tamil Nadu</span>
            </div>
            <nav className="footer-block" aria-label="Footer navigation">
              <h2>Explore</h2>
              <a href="#services">Services</a>
              <a href="#care">How it works</a>
              <a href="#book">Book an appointment</a>
              <a href="#top">Back to top</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Thiraiyal Health Care. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <div className="mobile-bar">
        <a className="btn btn-ghost" href={TEL}>{phoneIcon} Call</a>
        <a className="btn btn-wa" href="#book">{waIcon} Book appointment</a>
      </div>
    </>
  );
}
