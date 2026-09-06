/* =========================================================================
   BIRTHDAY WEBSITE — script.js
   Vanilla JS only. Organized into clearly named functions.
========================================================================= */

/* ---------------------------------------------------------------------
   GLOBAL STATE
--------------------------------------------------------------------- */
const state = {
  currentScreen: "archery",
  madhuOpened: false,
  subhaOpened: false,
  soundOn: false,
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  isTouch: matchMedia("(hover: none)").matches,
};

const MADHU_LETTER = [
  "Dear Madhu \u2764\uFE0F,",
  "You are a very good girl and a really friendly sister of mine. We have done so much masti together, teased each other, laughed at silly things, and made so many fun memories.",
  "Thank you for always being such a good sister and for being someone with whom I can be myself and have fun.",
  "You may not realize it, but all those little moments \u2014 the teasing, the jokes, the masti and the random conversations \u2014 are memories that make our bond special.",
  "And Madhu, this website is a little birthday gift from me to you, especially for the Rakhi you tied for me. \uD83C\uDF80\u2764\uFE0F",
  "I hope this birthday brings you lots of happiness, laughter, success and beautiful moments.",
  "Keep smiling, keep being the amazing person you are, and never lose that friendly and fun side of you.",
  "Happy Birthday, Madhu! \uD83C\uDF82\uD83C\uDF89\u2764\uFE0F",
  "Your brother,\nSam"
];

const SUBHA_LETTER = [
  "Dear Subha \u2764\uFE0F,",
  "Okay, I have to admit something...",
  "I don't know you as well as I know Madhu yet \uD83D\uDE05, so I don't have a huge collection of stories and memories to write about you.",
  "But one thing is simple \u2014 you are also a sister of mine, and that alone makes today special. \u2764\uFE0F",
  "So on your birthday, I just want to wish you lots and lots of happiness.",
  "May you always have reasons to smile, people around you who care about you, and beautiful moments that become amazing memories.",
  "Keep smiling, stay happy, enjoy your special day and always remember that you have a brother who wishes the very best for you.",
  "And of course...",
  "God bless both of you and keep you happy always. \u2764\uFE0F",
  "Happy Birthday, Subha! \uD83C\uDF82\uD83C\uDF89",
  "Have an amazing day and enjoy every moment!",
  "Your brother,\nSam"
];

/* ---------------------------------------------------------------------
   INIT
--------------------------------------------------------------------- */
function initWebsite() {
  initBackground();
  initCursorGlow();
  initSoundToggle();
  initRestart();
  initArcheryGame();
  initRevealScreen();
  initBirthdayCards();
  initEnvelope("madhu");
  initEnvelope("subha");
  initFinalAndCake();
  updateProgressNote();
}

document.addEventListener("DOMContentLoaded", initWebsite);

/* ---------------------------------------------------------------------
   SCREEN TRANSITION SYSTEM
--------------------------------------------------------------------- */
function showScreen(name) {
  const next = document.querySelector(`[data-screen="${name}"]`);
  const current = document.querySelector(`.screen.active`);
  if (!next || next === current) return;

  if (current) {
    current.classList.add("leaving");
    current.classList.remove("active");
    window.setTimeout(() => current.classList.remove("leaving"), 650);
  }
  // small delay lets the leaving transition begin before the new screen pops in
  window.requestAnimationFrame(() => {
    next.classList.add("active");
  });
  state.currentScreen = name;
  next.scrollTop = 0;
}

/* ---------------------------------------------------------------------
   AMBIENT BACKGROUND (stars + soft drifting orbs) — canvas, cheap draw
--------------------------------------------------------------------- */
function initBackground() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  let stars = [];
  let parallax = { x: 0, y: 0 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const count = state.isTouch ? 50 : 90;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.4 + 0.4) * dpr,
      tw: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.1,
    }));
  }
  window.addEventListener("resize", resize);
  resize();

  if (!state.isTouch) {
    window.addEventListener("mousemove", (e) => {
      parallax.x = (e.clientX / window.innerWidth - 0.5) * 14;
      parallax.y = (e.clientY / window.innerHeight - 0.5) * 14;
    });
  }

  let t = 0;
  function draw() {
    t += 0.01;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(parallax.x * dpr, parallax.y * dpr);
    for (const s of stars) {
      const twinkle = 0.55 + Math.sin(t * s.speed * 4 + s.tw) * 0.45;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${(0.5 + twinkle * 0.4).toFixed(2)})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (!state.reducedMotion) {
      requestAnimationFrame(draw);
    }
  }
  draw();
}

function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (state.isTouch || state.reducedMotion) {
    glow.style.display = "none";
    return;
  }
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty;
  window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
  function loop() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------------------------------------------------------------------
   SOUND (Web Audio API — no external files, no autoplay)
--------------------------------------------------------------------- */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playSound(type) {
  if (!state.soundOn) return;
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const presets = {
    shoot: { wave: "triangle", freq: 380, end: 620, dur: 0.14, vol: 0.06 },
    hit: { wave: "sine", freq: 520, end: 880, dur: 0.28, vol: 0.09 },
    miss: { wave: "sine", freq: 220, end: 140, dur: 0.2, vol: 0.05 },
    envelope: { wave: "sine", freq: 300, end: 500, dur: 0.3, vol: 0.06 },
    celebrate: { wave: "triangle", freq: 440, end: 980, dur: 0.5, vol: 0.08 },
    candle: { wave: "sine", freq: 600, end: 90, dur: 0.35, vol: 0.07 },
  };
  const p = presets[type] || presets.hit;
  osc.type = p.wave;
  osc.frequency.setValueAtTime(p.freq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(p.end, 1), now + p.dur);
  gain.gain.setValueAtTime(p.vol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);
  osc.start(now);
  osc.stop(now + p.dur + 0.02);
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  const btn = document.getElementById("sound-toggle");
  btn.textContent = state.soundOn ? "\uD83D\uDD0A" : "\uD83D\uDD07";
  btn.setAttribute("aria-label", state.soundOn ? "Mute sound" : "Unmute sound");
  if (state.soundOn) {
    // resume context on user gesture
    getAudioCtx().resume?.();
  }
}

function initSoundToggle() {
  document.getElementById("sound-toggle").addEventListener("click", toggleSound);
}

/* ---------------------------------------------------------------------
   RESTART
--------------------------------------------------------------------- */
function initRestart() {
  document.getElementById("restart-btn").addEventListener("click", restartExperience);
}

function restartExperience() {
  state.madhuOpened = false;
  state.subhaOpened = false;

  ["madhu", "subha"].forEach((who) => {
    const envelope = document.getElementById(`${who}-envelope`);
    const letter = document.getElementById(`${who}-letter`);
    const nav = document.getElementById(`${who}-nav`);
    envelope.classList.remove("opened");
    envelope.disabled = false;
    letter.hidden = true;
    letter.classList.remove("visible");
    document.getElementById(`${who}-letter-text`).innerHTML = "";
    nav.hidden = true;
  });

  resetArcheryGame();
  resetCake();
  updateProgressNote();
  updateLetterNavButtons();
  showScreen("archery");
}

/* ---------------------------------------------------------------------
   ARCHERY MINI-GAME
--------------------------------------------------------------------- */
let archeryReady = true;

function initArcheryGame() {
  const stage = document.getElementById("archery-stage");
  const crosshair = document.getElementById("crosshair");
  const arrow = document.getElementById("arrow");
  const message = document.getElementById("archery-message");

  function pointerMove(clientX, clientY) {
    if (state.isTouch) return; // no hover crosshair needed on touch
    const rect = stage.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    crosshair.style.left = x + "px";
    crosshair.style.top = y + "px";
    crosshair.style.opacity = 1;
  }

  stage.addEventListener("mousemove", (e) => pointerMove(e.clientX, e.clientY));
  stage.addEventListener("mouseleave", () => { crosshair.style.opacity = 0; });

  function handleShot(clientX, clientY) {
    if (!archeryReady) return;
    const rect = stage.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    shootArrow(x, y, rect);
  }

  stage.addEventListener("click", (e) => handleShot(e.clientX, e.clientY));
  stage.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      pointerMove(t.clientX, t.clientY);
      handleShot(t.clientX, t.clientY);
    },
    { passive: false }
  );

  function shootArrow(targetX, targetY, rect) {
    archeryReady = false;
    playSound("shoot");

    const startX = rect.width / 2;
    const startY = rect.height + 10;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const distance = Math.hypot(dx, dy);
    const duration = Math.min(650, Math.max(320, distance * 1.4));

    arrow.style.transition = "none";
    arrow.style.left = startX + "px";
    arrow.style.top = startY + "px";
    arrow.style.transform = `translate(-50%,-50%) rotate(${angleDeg}deg)`;
    arrow.style.opacity = 1;

    // force reflow so the transition below actually animates
    // eslint-disable-next-line no-unused-expressions
    arrow.offsetHeight;

    arrow.style.transition = `left ${duration}ms cubic-bezier(.22,.7,.3,1), top ${duration}ms cubic-bezier(.22,.7,.3,1)`;
    arrow.style.left = targetX + "px";
    arrow.style.top = targetY + "px";

    window.setTimeout(() => {
      checkTargetHit(targetX, targetY, rect);
      window.setTimeout(() => {
        arrow.style.opacity = 0;
        archeryReady = true;
      }, 260);
    }, duration);
  }

  function checkTargetHit(x, y, rect) {
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dist = Math.hypot(x - cx, y - cy);
    // ring radii proportional to the 220 viewBox scaled to actual rect size
    const scale = rect.width / 220;
    const bullseyeR = 20 * scale;
    const ring2R = 46 * scale;
    const ring3R = 72 * scale;
    const outerR = 100 * scale;

    if (dist <= bullseyeR) {
      celebrateBullseye(x, y);
    } else if (dist <= outerR) {
      playSound("miss");
      showArcheryMessage("Almost! \uD83C\uDFAF");
      spawnImpactRing(x, y, "rgba(244,200,105,0.55)");
    } else {
      playSound("miss");
      showArcheryMessage("Oops! Try again \uD83D\uDE04");
    }
  }

  function showArcheryMessage(text) {
    message.textContent = text;
    message.style.animation = "none";
    // eslint-disable-next-line no-unused-expressions
    message.offsetHeight;
    message.style.animation = "fadeInUp .4s ease both";
    window.setTimeout(() => {
      if (message.textContent === text) message.textContent = "";
    }, 1600);
  }
}

function resetArcheryGame() {
  archeryReady = true;
  const arrow = document.getElementById("arrow");
  arrow.style.opacity = 0;
  document.getElementById("archery-message").textContent = "";
}

function spawnImpactRing(x, y, color) {
  const stage = document.getElementById("archery-stage");
  const ring = document.createElement("div");
  ring.style.position = "absolute";
  ring.style.left = x + "px";
  ring.style.top = y + "px";
  ring.style.width = "10px";
  ring.style.height = "10px";
  ring.style.borderRadius = "50%";
  ring.style.border = `2px solid ${color}`;
  ring.style.transform = "translate(-50%,-50%)";
  ring.style.pointerEvents = "none";
  ring.style.transition = "width .5s ease-out, height .5s ease-out, opacity .5s ease-out";
  stage.appendChild(ring);
  requestAnimationFrame(() => {
    ring.style.width = "70px";
    ring.style.height = "70px";
    ring.style.opacity = "0";
  });
  window.setTimeout(() => ring.remove(), 550);
}

function celebrateBullseye(x, y) {
  playSound("hit");
  showArcheryMessage_global("Perfect Shot! \uD83C\uDFAF\u2728");
  spawnImpactRing(x, y, "rgba(255,246,200,0.9)");
  createConfetti(24);
  createFloatingHearts(8);
  createSparkles(14);
  const stage = document.getElementById("archery-stage");
  if (!state.reducedMotion) {
    stage.style.animation = "burstPulse .4s ease";
    window.setTimeout(() => (stage.style.animation = ""), 400);
  }
  window.setTimeout(() => {
    showScreen("reveal");
    triggerRevealCelebration();
  }, 900);
}

function showArcheryMessage_global(text) {
  const message = document.getElementById("archery-message");
  message.textContent = text;
}

/* ---------------------------------------------------------------------
   REVEAL SCREEN
--------------------------------------------------------------------- */
function initRevealScreen() {
  document.getElementById("enter-surprise-btn").addEventListener("click", () => {
    showScreen("birthday");
  });
}

function triggerRevealCelebration() {
  createConfetti(36);
  createFloatingHearts(10);
  createSparkles(18);
}

/* ---------------------------------------------------------------------
   MAIN BIRTHDAY PAGE — CARDS
--------------------------------------------------------------------- */
function initBirthdayCards() {
  document.getElementById("card-madhu").addEventListener("click", () => openSisterCard("madhu"));
  document.getElementById("card-subha").addEventListener("click", () => openSisterCard("subha"));

  document.getElementById("madhu-to-birthday").addEventListener("click", () => showScreen("birthday"));
  document.getElementById("subha-to-birthday").addEventListener("click", () => showScreen("birthday"));

  // "continue to the other letter" buttons start with their default
  // behaviour; updateLetterNavButtons() swaps them once both are opened.
  updateLetterNavButtons();
}

function openSisterCard(who) {
  const card = document.getElementById(`card-${who}`);
  card.classList.add("selecting");
  window.setTimeout(() => {
    card.classList.remove("selecting");
    showScreen(who);
  }, 320);
}

/* ---------------------------------------------------------------------
   ENVELOPE + LETTER
--------------------------------------------------------------------- */
function initEnvelope(who) {
  const envelope = document.getElementById(`${who}-envelope`);
  envelope.addEventListener("click", () => openEnvelope(who));
}

function openEnvelope(who) {
  const envelope = document.getElementById(`${who}-envelope`);
  if (envelope.classList.contains("opened")) return;
  playSound("envelope");
  envelope.classList.add("opened");
  envelope.disabled = true;
  createFloatingHearts(5);

  window.setTimeout(() => {
    revealLetter(who);
  }, 520);
}

function revealLetter(who) {
  const letter = document.getElementById(`${who}-letter`);
  const textEl = document.getElementById(`${who}-letter-text`);
  const lines = who === "madhu" ? MADHU_LETTER : SUBHA_LETTER;

  letter.hidden = false;
  textEl.innerHTML = "";
  const paras = lines.map((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    textEl.appendChild(p);
    return p;
  });

  requestAnimationFrame(() => letter.classList.add("visible"));

  const stepDelay = state.reducedMotion ? 0 : 260;
  paras.forEach((p, i) => {
    window.setTimeout(() => p.classList.add("shown"), 200 + i * stepDelay);
  });

  const totalDelay = 200 + paras.length * stepDelay + 200;
  window.setTimeout(() => {
    trackLetterProgress(who);
    document.getElementById(`${who}-nav`).hidden = false;
  }, totalDelay);
}

function trackLetterProgress(who) {
  if (who === "madhu") state.madhuOpened = true;
  if (who === "subha") state.subhaOpened = true;
  updateProgressNote();
  updateLetterNavButtons();
}

function updateProgressNote() {
  const note = document.getElementById("progress-note");
  if (!note) return;
  if (state.madhuOpened && state.subhaOpened) {
    note.textContent = "Both letters opened \u2014 something special awaits below \u2728";
  } else if (state.madhuOpened || state.subhaOpened) {
    note.textContent = "One more letter to open \uD83D\uDC9D";
  } else {
    note.textContent = "";
  }
}

// When both letters have been opened, we no longer force-navigate the
// visitor anywhere. Instead the "go to the other letter" buttons quietly
// turn into a "Continue to the celebration" button on BOTH letter screens,
// so the user reads at their own pace and moves on only when they choose to.
function updateLetterNavButtons() {
  const bothOpen = state.madhuOpened && state.subhaOpened;

  const madhuBtn = document.getElementById("madhu-to-subha");
  const subhaBtn = document.getElementById("subha-to-madhu");

  if (bothOpen) {
    setNavButton(madhuBtn, "Continue to the celebration \uD83C\uDF89", goToFinalCelebration);
    setNavButton(subhaBtn, "Continue to the celebration \uD83C\uDF89", goToFinalCelebration);
    // a small celebratory hint (no screen change) so it still feels rewarding
    createSparkles(10);
  } else {
    setNavButton(madhuBtn, "Now check Subha's letter \uD83C\uDF37", () => showScreen("subha"));
    setNavButton(subhaBtn, "Now check Madhu's letter \uD83C\uDF38", () => showScreen("madhu"));
  }
}

function setNavButton(btn, text, handler) {
  if (!btn) return;
  btn.textContent = text;
  btn.onclick = handler;
}

function goToFinalCelebration() {
  showScreen("final");
  createConfetti(30);
  createFloatingHearts(12);
  createSparkles(16);
  playSound("celebrate");
}

/* ---------------------------------------------------------------------
   FINAL SECTION + CAKE
--------------------------------------------------------------------- */
function initFinalAndCake() {
  document.getElementById("to-cake-btn").addEventListener("click", () => showScreen("cake"));
  document.getElementById("wish-btn").addEventListener("click", makeWish);
}

function makeWish() {
  const btn = document.getElementById("wish-btn");
  if (btn.disabled) return;
  btn.disabled = true;
  playSound("candle");

  const candles = document.querySelectorAll(".candle");
  candles.forEach((candle, i) => {
    window.setTimeout(() => {
      candle.classList.add("out");
      const smoke = document.createElement("span");
      smoke.className = "smoke";
      candle.appendChild(smoke);
      window.setTimeout(() => smoke.remove(), 1500);
    }, i * 180);
  });

  window.setTimeout(() => {
    createConfetti(40);
    createSparkles(20);
    createFloatingHearts(10);
    document.getElementById("cake-heading").textContent = "You made a wish \u2728";
    document.getElementById("final-message").hidden = false;
  }, candles.length * 180 + 400);
}

function resetCake() {
  document.getElementById("wish-btn").disabled = false;
  document.getElementById("cake-heading").textContent = "Make a wish before you blow the candles \uD83C\uDF82";
  document.getElementById("final-message").hidden = true;
  document.querySelectorAll(".candle").forEach((c) => c.classList.remove("out"));
}

/* ---------------------------------------------------------------------
   FX: CONFETTI / PARTICLES / FLOATING HEARTS / SPARKLES
   Kept lightweight: elements are removed after their animation ends.
--------------------------------------------------------------------- */
const FX_COLORS = ["#f472b6", "#d946ef", "#a78bfa", "#f4c869", "#ffb199", "#67e8f9"];

function createConfetti(count = 24) {
  if (state.reducedMotion) count = Math.min(count, 8);
  const layer = document.getElementById("fx-layer");
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "fx-piece fx-confetti";
    const left = Math.random() * 100;
    const color = FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
    const duration = 2.4 + Math.random() * 1.6;
    const delay = Math.random() * 0.4;
    el.style.left = left + "vw";
    el.style.background = color;
    el.style.animation = `fxFall ${duration}s ease-in ${delay}s forwards`;
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(el);
    window.setTimeout(() => el.remove(), (duration + delay) * 1000 + 100);
  }
}

function createFloatingHearts(count = 8) {
  if (state.reducedMotion) count = Math.min(count, 4);
  const layer = document.getElementById("fx-layer");
  const hearts = ["\u2764\uFE0F", "\uD83D\uDC96", "\uD83D\uDC95"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "fx-piece fx-heart";
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    const left = 10 + Math.random() * 80;
    const bottom = Math.random() * 20;
    const duration = 2.6 + Math.random() * 1.6;
    const drift = (Math.random() - 0.5) * 80;
    el.style.left = left + "vw";
    el.style.bottom = bottom + "vh";
    el.style.top = "auto";
    el.style.setProperty("--drift", drift + "px");
    el.style.animation = `fxFloatUp ${duration}s ease-out forwards`;
    layer.appendChild(el);
    window.setTimeout(() => el.remove(), duration * 1000 + 100);
  }
}

function createSparkles(count = 12) {
  if (state.reducedMotion) count = Math.min(count, 5);
  const layer = document.getElementById("fx-layer");
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "fx-piece fx-sparkle";
    el.textContent = "\u2728";
    const left = Math.random() * 100;
    const top = Math.random() * 60;
    const duration = 1.2 + Math.random() * 1;
    el.style.left = left + "vw";
    el.style.top = top + "vh";
    el.style.opacity = "0";
    el.style.transition = `opacity ${duration}s ease-in-out`;
    layer.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      window.setTimeout(() => (el.style.opacity = "0"), duration * 500);
    });
    window.setTimeout(() => el.remove(), duration * 1000 + 200);
  }
}

/* ---------------------------------------------------------------------
   KEYBOARD ACCESSIBILITY: allow Enter/Space to activate custom buttons
   (native <button> elements already handle this; kept minimal by design)
--------------------------------------------------------------------- */
