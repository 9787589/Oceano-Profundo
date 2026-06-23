/* =============================================
   OCÉANO PROFUNDO — script.js
   ============================================= */

"use strict";

/* =============================================
   1. CANVAS — ANIMACIÓN DEL OCÉANO
   ============================================= */
(function initOceanCanvas() {
  const canvas = document.getElementById("ocean-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, time = 0;
  const waves = [
    { amplitude: 28, frequency: 0.012, speed: 0.012, color: "rgba(0,119,182,0.10)", yBase: 0.45 },
    { amplitude: 20, frequency: 0.018, speed: 0.018, color: "rgba(0,150,199,0.09)", yBase: 0.52 },
    { amplitude: 14, frequency: 0.025, speed: 0.022, color: "rgba(0,180,216,0.07)", yBase: 0.60 },
    { amplitude: 10, frequency: 0.035, speed: 0.028, color: "rgba(72,202,228,0.06)", yBase: 0.70 },
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0.0, "#000d2e");
    grad.addColorStop(0.25, "#020f42");
    grad.addColorStop(0.55, "#01206b");
    grad.addColorStop(0.85, "#013474");
    grad.addColorStop(1.0,  "#012550");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawWave(wave) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) {
      const y = wave.yBase * H +
        Math.sin(x * wave.frequency + time * wave.speed * 60) * wave.amplitude +
        Math.sin(x * wave.frequency * 1.7 + time * wave.speed * 40) * (wave.amplitude * 0.4);
      if (x === 0) ctx.moveTo(x, y);
      else         ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = wave.color;
    ctx.fill();
  }

  function drawCaustics() {
    const numRipples = 6;
    for (let i = 0; i < numRipples; i++) {
      const x = (i / numRipples) * W + Math.sin(time * 0.3 + i) * 80;
      const y = 0.1 * H + Math.sin(time * 0.2 + i * 1.5) * 40;
      const r = 60 + Math.sin(time * 0.5 + i) * 25;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0,   "rgba(144,224,239,0.05)");
      grad.addColorStop(0.5, "rgba(72,202,228,0.02)");
      grad.addColorStop(1,   "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(ts) {
    time = ts * 0.001;
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawCaustics();
    waves.forEach(drawWave);
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);
})();


/* =============================================
   2. BURBUJAS
   ============================================= */
(function initBubbles() {
  const container = document.getElementById("bubbles-container");
  if (!container) return;

  const BUBBLE_COUNT = 28;

  function createBubble() {
    const el = document.createElement("div");
    el.className = "bubble";

    const size = Math.random() * 22 + 5;
    const left = Math.random() * 100;
    const duration = Math.random() * 14 + 10;
    const delay = Math.random() * 18;
    const drift = (Math.random() - 0.5) * 80;
    const scaleEnd = 0.9 + Math.random() * 0.4;

    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      --drift: ${drift}px;
      --scale-end: ${scaleEnd};
    `;

    container.appendChild(el);
  }

  for (let i = 0; i < BUBBLE_COUNT; i++) createBubble();

  // Periodically add new bubbles
  setInterval(() => {
    if (container.children.length < 40) createBubble();
  }, 3000);
})();


/* =============================================
   3. PARTÍCULAS SUBMARINAS (react a cursor)
   ============================================= */
(function initParticles() {
  const container = document.getElementById("particles-container");
  if (!container) return;

  const particles = [];
  const PARTICLE_COUNT = 50;
  let mouseX = -9999, mouseY = -9999;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const el = document.createElement("div");
    el.className = "particle";
    const size = Math.random() * 5 + 1.5;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = (Math.random() * 8 + 5).toFixed(1);
    const delay = -(Math.random() * 10).toFixed(1);
    const dx = ((Math.random() - 0.5) * 30).toFixed(0);
    const dy = ((Math.random() - 0.5) * 30).toFixed(0);
    el.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${x}%; top: ${y}%;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      --dx: ${dx}px; --dy: ${dy}px;
    `;
    container.appendChild(el);
    particles.push({ el, baseX: x, baseY: y });
  }

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const wW = window.innerWidth;
    const wH = window.innerHeight;
    particles.forEach((p) => {
      const pxX = (p.baseX / 100) * wW;
      const pxY = (p.baseY / 100) * wH;
      const dist = Math.hypot(pxX - mouseX, pxY - mouseY);
      if (dist < 180) {
        const force = (180 - dist) / 180;
        const angle = Math.atan2(pxY - mouseY, pxX - mouseX);
        const ox = Math.cos(angle) * force * 30;
        const oy = Math.sin(angle) * force * 30;
        p.el.style.transform = `translate(${ox}px, ${oy}px)`;
      } else {
        p.el.style.transform = "";
      }
    });
  });
})();


/* =============================================
   4. CRIATURAS MARINAS SVG (peces, tortugas, medusas)
   ============================================= */
(function initCreatures() {
  const container = document.getElementById("creatures-container");
  if (!container) return;

  const fishSVG = (color) => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40" width="80" height="40">
      <ellipse cx="35" cy="20" rx="28" ry="13" fill="${color}" opacity="0.9"/>
      <polygon points="63,20 80,8 80,32" fill="${color}" opacity="0.8"/>
      <circle cx="16" cy="17" r="2.5" fill="rgba(202,240,248,0.95)"/>
      <path d="M 44 14 Q 52 8 55 14" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none"/>
    </svg>`;

  const seahorseSVG = () => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 70" width="40" height="70">
      <ellipse cx="20" cy="35" rx="8" ry="12" fill="rgba(0,180,216,0.9)" opacity="0.85"/>
      <circle cx="20" cy="15" r="6" fill="rgba(0,150,199,0.9)"/>
      <path d="M20 21 Q18 28 20 35" stroke="rgba(0,180,216,0.8)" stroke-width="1.5" fill="none"/>
      <path d="M17 32 Q15 45 14 60" stroke="rgba(72,202,228,0.7)" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M20 35 Q20 50 20 65" stroke="rgba(72,202,228,0.75)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M23 32 Q25 45 26 60" stroke="rgba(72,202,228,0.7)" stroke-width="1" fill="none" stroke-linecap="round"/>
      <circle cx="19" cy="13" r="1.5" fill="rgba(202,240,248,0.95)"/>
    </svg>`;

  const starfishSVG = () => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70" width="70" height="70">
      <g fill="rgba(0,180,216,0.85)">
        <ellipse cx="35" cy="15" rx="10" ry="15"/>
        <ellipse cx="55" cy="27" rx="10" ry="15" transform="rotate(72,35,35)"/>
        <ellipse cx="50" cy="55" rx="10" ry="15" transform="rotate(144,35,35)"/>
        <ellipse cx="20" cy="55" rx="10" ry="15" transform="rotate(216,35,35)"/>
        <ellipse cx="15" cy="27" rx="10" ry="15" transform="rotate(288,35,35)"/>
        <circle cx="35" cy="35" r="8" fill="rgba(72,202,228,0.8)"/>
      </g>
    </svg>`;

  const octopusSVG = () => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80" width="60" height="80">
      <ellipse cx="30" cy="25" rx="18" ry="20" fill="rgba(0,119,182,0.9)"/>
      <circle cx="22" cy="22" r="2" fill="rgba(202,240,248,0.95)"/>
      <circle cx="38" cy="22" r="2" fill="rgba(202,240,248,0.95)"/>
      <path d="M15 45 Q12 60 10 75" stroke="rgba(0,150,199,0.85)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M22 48 Q20 63 19 76" stroke="rgba(0,150,199,0.8)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M30 50 Q30 65 30 78" stroke="rgba(0,150,199,0.85)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M38 48 Q40 63 41 76" stroke="rgba(0,150,199,0.8)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M45 45 Q48 60 50 75" stroke="rgba(0,150,199,0.85)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>`;

  const turtleSVG = () => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70" width="100" height="70">
      <ellipse cx="50" cy="35" rx="30" ry="20" fill="#0096C7" opacity="0.9"/>
      <ellipse cx="50" cy="35" rx="23" ry="15" fill="#00B4D8" opacity="0.7"/>
      <ellipse cx="22" cy="35" rx="8" ry="6" fill="#0077B6" opacity="0.9"/>
      <ellipse cx="68" cy="20" rx="12" ry="5" fill="#0077B6" opacity="0.8" transform="rotate(-20,68,20)"/>
      <ellipse cx="68" cy="50" rx="12" ry="5" fill="#0077B6" opacity="0.8" transform="rotate(20,68,50)"/>
      <ellipse cx="38" cy="18" rx="10" ry="4" fill="#0077B6" opacity="0.75" transform="rotate(-30,38,18)"/>
      <ellipse cx="38" cy="52" rx="10" ry="4" fill="#0077B6" opacity="0.75" transform="rotate(30,38,52)"/>
      <circle cx="18" cy="33" r="1.8" fill="rgba(202,240,248,0.95)"/>
    </svg>`;

  const jellyfishSVG = () => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80" width="60" height="80">
      <ellipse cx="30" cy="28" rx="22" ry="18" fill="rgba(72,202,228,0.5)" stroke="rgba(144,224,239,0.6)" stroke-width="1.5"/>
      <path d="M16 42 Q14 60 12 72" stroke="rgba(144,224,239,0.7)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M22 44 Q20 58 19 70" stroke="rgba(144,224,239,0.6)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path d="M30 45 Q30 60 30 72" stroke="rgba(144,224,239,0.7)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M38 44 Q40 58 41 70" stroke="rgba(144,224,239,0.6)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path d="M44 42 Q46 60 48 72" stroke="rgba(144,224,239,0.7)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`;

  const fishColors = [
    "rgba(0,180,216,0.85)",
    "rgba(72,202,228,0.85)",
    "rgba(0,150,199,0.85)",
    "rgba(144,224,239,0.8)",
    "rgba(0,119,182,0.85)",
    "rgba(0,180,216,0.9)",
    "rgba(72,202,228,0.9)",
  ];

  function spawnFish() {
    const el = document.createElement("div");
    el.className = "creature";
    const color = fishColors[Math.floor(Math.random() * fishColors.length)];
    el.innerHTML = fishSVG(color);

    const size = 0.6 + Math.random() * 1.2;
    const startY = 15 + Math.random() * 70;
    const dur = 22 + Math.random() * 28;
    const delay = -(Math.random() * dur);
    const swimY = (Math.random() - 0.5) * 70;
    const swimY2 = (Math.random() - 0.5) * 50;
    const tilt = (Math.random() - 0.5) * 10;

    el.style.cssText = `
      right: -120px;
      left: auto;
      top: ${startY}%;
      transform: scaleX(-1) scale(${size});
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      --swim-x: ${70 + Math.random() * 50}vw;
      --swim-y: ${swimY}px;
      --swim-y2: ${swimY2}px;
      --tilt: ${tilt}deg;
      opacity: 0.9;
    `;
    container.appendChild(el);

    el.addEventListener("animationend", () => el.remove());
    setTimeout(() => { if (el.parentNode) el.remove(); }, (dur + 5) * 1000);
  }

  function spawnSeahorse() {
    const el = document.createElement("div");
    el.className = "creature";
    el.innerHTML = seahorseSVG();

    const size = 0.7 + Math.random() * 0.8;
    const startY = 20 + Math.random() * 60;
    const dur = 20 + Math.random() * 25;
    const delay = -(Math.random() * dur);

    el.style.cssText = `
      right: -60px;
      left: auto;
      top: ${startY}%;
      transform: scale(${size});
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      --swim-x: ${60 + Math.random() * 50}vw;
      --swim-y: ${(Math.random() - 0.5) * 40}px;
      --swim-y2: ${(Math.random() - 0.5) * 25}px;
      opacity: 0.85;
    `;
    container.appendChild(el);

    el.addEventListener("animationend", () => el.remove());
    setTimeout(() => { if (el.parentNode) el.remove(); }, (dur + 5) * 1000);
  }

  function spawnTurtle() {
    const el = document.createElement("div");
    el.className = "creature";
    el.innerHTML = turtleSVG();

    const startY = 25 + Math.random() * 50;
    const dur = 40 + Math.random() * 35;
    const delay = -(Math.random() * 15);

    el.style.cssText = `
      right: -130px;
      left: auto;
      top: ${startY}%;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      --swim-x: ${55 + Math.random() * 45}vw;
      --swim-y: ${(Math.random() - 0.5) * 35}px;
      --swim-y2: ${(Math.random() - 0.5) * 20}px;
      opacity: 0.85;
    `;
    container.appendChild(el);

    el.addEventListener("animationend", () => el.remove());
    setTimeout(() => { if (el.parentNode) el.remove(); }, (dur + 5) * 1000);
  }

  function placeJellyfish() {
    const el = document.createElement("div");
    el.className = "creature creature-jellyfish";
    el.innerHTML = jellyfishSVG();

    const x = 5 + Math.random() * 90;
    const y = 15 + Math.random() * 65;
    const dur = 6 + Math.random() * 7;
    const delay = -(Math.random() * dur);

    el.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      opacity: 0.7;
    `;
    container.appendChild(el);
  }

  function placeStarfish() {
    const el = document.createElement("div");
    el.className = "creature creature-jellyfish";
    el.innerHTML = starfishSVG();

    const x = 8 + Math.random() * 84;
    const y = 45 + Math.random() * 45;

    el.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      opacity: 0.7;
      animation: gentle-float 8s ease-in-out infinite;
      animation-delay: ${-(Math.random() * 8)}s;
    `;
    container.appendChild(el);
  }

  function placeOctopus() {
    const el = document.createElement("div");
    el.className = "creature creature-jellyfish";
    el.innerHTML = octopusSVG();

    const x = 10 + Math.random() * 80;
    const y = 50 + Math.random() * 40;
    const dur = 8 + Math.random() * 6;
    const delay = -(Math.random() * dur);

    el.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      opacity: 0.75;
    `;
    container.appendChild(el);
  }

  // Initial spawn - más criaturas
  for (let i = 0; i < 8; i++) spawnFish();
  for (let i = 0; i < 3; i++) spawnSeahorse();
  for (let i = 0; i < 3; i++) spawnTurtle();
  for (let i = 0; i < 6; i++) placeJellyfish();
  for (let i = 0; i < 4; i++) placeStarfish();
  for (let i = 0; i < 2; i++) placeOctopus();

  // Continuous spawn - más frecuente
  setInterval(spawnFish, 6000);
  setInterval(spawnSeahorse, 9000);
  setInterval(spawnTurtle, 18000);
  setInterval(placeJellyfish, 5000);
})();


/* =============================================
   5. NAVBAR SCROLL
   ============================================= */
(function initNavbar() {
  const nav = document.getElementById("navbar");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });

    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => links.classList.remove("open"));
    });
  }
})();


/* =============================================
   6. SCROLL REVEAL
   ============================================= */
(function initReveal() {
  const items = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  items.forEach(el => observer.observe(el));
})();


/* =============================================
   7. ANIMACIÓN CONTADORES (stats)
   ============================================= */
(function initCounters() {
  const counters = document.querySelectorAll(".stat-number[data-target]");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* =============================================
   8. BARRAS DE AMENAZA (threat fills)
   ============================================= */
(function initThreatBars() {
  const fills = document.querySelectorAll(".threat-fill");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.style.getPropertyValue("--fill") ||
          getComputedStyle(entry.target).getPropertyValue("--fill");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(f => observer.observe(f));
})();


/* =============================================
   9. PARALLAX
   ============================================= */
(function initParallax() {
  const sections = document.querySelectorAll(".parallax-section");

  function onScroll() {
    const scrollY = window.scrollY;
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.12;
      sec.style.backgroundPositionY = `calc(50% + ${offset}px)`;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();


/* =============================================
   10. GALERÍA — LIGHTBOX
   ============================================= */
(function initGallery() {
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbCaption = document.getElementById("lightbox-caption");
  const lbClose = document.getElementById("lightbox-close");

  if (!lightbox) return;

  function openLightbox(src, alt, caption) {
    lbImg.src = src;
    lbImg.alt = alt;
    lbCaption.textContent = caption || alt;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => { lbImg.src = ""; }, 400);
  }

  items.forEach(item => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      const caption = item.dataset.caption || img.alt;
      openLightbox(img.src, img.alt, caption);
    });
  });

  lbClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
})();


/* =============================================
   11. FORMULARIO DE CONTACTO
   ============================================= */
(function initContactForm() {
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type='submit']");
    btn.textContent = "Enviando…";
    btn.disabled = true;

    setTimeout(() => {
      note.textContent = "✓ Mensaje enviado. Te responderemos pronto.";
      note.style.color = "var(--c6)";
      form.reset();
      btn.textContent = "Enviar mensaje";
      btn.disabled = false;
    }, 1600);
  });
})();


/* =============================================
   12. SMOOTH SCROLL PARA LINKS INTERNOS
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const navH = document.getElementById("navbar")?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});


/* =============================================
   13. INDICADOR DE PROFUNDIDAD (parallax hero)
   ============================================= */
(function initDepthIndicator() {
  const label = document.querySelector(".depth-label");
  if (!label) return;

  window.addEventListener("scroll", () => {
    const maxDepth = 11034;
    const progress = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight), 1);
    const depth = Math.round(progress * maxDepth);
    label.textContent = depth > 0 ? `${depth.toLocaleString()} m` : "0 m";
  }, { passive: true });
})();