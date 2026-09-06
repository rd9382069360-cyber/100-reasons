(() => {
  const GATE_KEY = "lishy-unlocked";
  // SHA-256 of the correct date digits (DDMMYYYY) — not stored in plain text
  const SECRET_HASH =
    "dedf6927d825b0dbd3580f57b128cedcbef2851d1c881339f9a7eb5fa624c027";

  const gate = document.getElementById("gate");
  const site = document.getElementById("site");
  const form = document.getElementById("gate-form");
  const input = document.getElementById("birthdate");
  const error = document.getElementById("gate-error");
  const canvas = document.getElementById("confetti");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let reasonsList = [];

  function readUnlocked() {
    try {
      return (
        sessionStorage.getItem(GATE_KEY) === "1" ||
        sessionStorage.getItem("anna-unlocked") === "1"
      );
    } catch (_) {
      return false;
    }
  }

  function saveUnlocked() {
    try {
      sessionStorage.setItem(GATE_KEY, "1");
    } catch (_) {
      /* ignore */
    }
  }

  function normalizeDigits(value) {
    const raw = String(value || "").trim();
    const parts = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (parts) {
      return `${parts[1].padStart(2, "0")}${parts[2].padStart(2, "0")}${parts[3]}`;
    }
    const digits = raw.replace(/\D/g, "");
    return digits.length === 8 ? digits : "";
  }

  async function sha256Hex(text) {
    if (window.crypto && window.crypto.subtle) {
      try {
        const data = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest("SHA-256", data);
        return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
      } catch (_) {
        /* fall through for file:// */
      }
    }
    return sha256Fallback(text);
  }

  // Minimal SHA-256 for non-secure contexts (e.g. opening the file locally)
  function sha256Fallback(message) {
    function rotr(n, x) {
      return (x >>> n) | (x << (32 - n));
    }
    function toWords(bytes) {
      const words = [];
      for (let i = 0; i < bytes.length; i += 1) {
        words[i >> 2] = (words[i >> 2] || 0) | (bytes[i] << (24 - (i % 4) * 8));
      }
      return words;
    }

    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];

    const bytes = [...new TextEncoder().encode(message)];
    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i -= 1) bytes.push(Math.floor(bitLen / Math.pow(2, i * 8)) & 0xff);

    let [h0, h1, h2, h3, h4, h5, h6, h7] = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];

    for (let i = 0; i < bytes.length; i += 64) {
      const w = toWords(bytes.slice(i, i + 64));
      for (let t = 16; t < 64; t += 1) {
        const s0 = rotr(7, w[t - 15]) ^ rotr(18, w[t - 15]) ^ (w[t - 15] >>> 3);
        const s1 = rotr(17, w[t - 2]) ^ rotr(19, w[t - 2]) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }

      let [a, b, c, d, e, f, g, h] = [h0, h1, h2, h3, h4, h5, h6, h7];
      for (let t = 0; t < 64; t += 1) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      h0 = (h0 + a) >>> 0;
      h1 = (h1 + b) >>> 0;
      h2 = (h2 + c) >>> 0;
      h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0;
      h5 = (h5 + f) >>> 0;
      h6 = (h6 + g) >>> 0;
      h7 = (h7 + h) >>> 0;
    }

    return [h0, h1, h2, h3, h4, h5, h6, h7]
      .map((n) => n.toString(16).padStart(8, "0"))
      .join("");
  }

  async function isCorrectDate(value) {
    const digits = normalizeDigits(value);
    if (!digits) return false;
    const hash = await sha256Hex(digits);
    return hash === SECRET_HASH;
  }

  function loadReasons() {
    return new Promise((resolve, reject) => {
      if (Array.isArray(window.reasons) && window.reasons.length) {
        reasonsList = window.reasons;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "reasons.js";
      script.onload = () => {
        reasonsList = Array.isArray(window.reasons) ? window.reasons : [];
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function burstConfetti() {
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#e8a0b4", "#d4849c", "#f3c5d2", "#fff0f4", "#f7dde6", "#c97b92"];
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.3,
      w: 6 + Math.random() * 7,
      h: 8 + Math.random() * 10,
      vy: 2.2 + Math.random() * 3.2,
      vx: -1.5 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vr: -0.12 + Math.random() * 0.24,
      color: colors[(Math.random() * colors.length) | 0],
    }));

    let frame = 0;
    const maxFrames = 140;

    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    canvas.style.opacity = "1";

    function tick() {
      frame += 1;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.035;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        canvas.style.opacity = "0";
      }
    }

    requestAnimationFrame(tick);
  }

  async function unlock(withConfetti) {
    await loadReasons();
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-unlocked");
    gate.hidden = true;
    site.hidden = false;
    document.title = "Lishy · 100 Reasons";
    initReasons();
    initWishCandle();
    if (withConfetti) burstConfetti();
  }

  function initReasons() {
    const list = document.getElementById("reasons-list");
    if (!list || list.childElementCount || !Array.isArray(reasonsList)) return;

    reasonsList.forEach((text, i) => {
      const li = document.createElement("li");
      const num = String(i + 1).padStart(2, "0");
      li.innerHTML = `<span class="list__num">${num}</span><p class="list__text">${text}</p>`;
      if (reduceMotion) li.classList.add("is-visible");
      list.appendChild(li);
    });

    if (reduceMotion) return;

    const items = list.querySelectorAll("li");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
    );

    items.forEach((item) => observer.observe(item));
  }

  /* --- Interactive Wish Candle --- */
  function initWishCandle() {
    const wrapper = document.getElementById("candle-wrapper");
    const canvas = document.getElementById("candle-canvas");
    const prompt = document.getElementById("candle-prompt");
    const hint = document.getElementById("candle-hint");
    const micBtn = document.getElementById("mic-toggle-btn");
    const message = document.getElementById("wish-message");
    const relightBtn = document.getElementById("relight-btn");

    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    let isExtinguished = false;
    let micStream = null;
    let audioCtx = null;
    let micAnimId = null;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Audio effects: soft breath whoosh + gentle fairy chime chords
    function playWishSound() {
      try {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return;
        const ac = new AudioCtor();

        // 1. Soft breath whoosh
        const bufferSize = Math.floor(ac.sampleRate * 0.4);
        const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const whiteNoise = ac.createBufferSource();
        whiteNoise.buffer = buffer;
        const filter = ac.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 650;
        filter.Q.value = 1.8;

        const noiseGain = ac.createGain();
        noiseGain.gain.setValueAtTime(0.08, ac.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);

        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ac.destination);
        whiteNoise.start();

        // 2. Chime notes (C6, E6, G6, C7)
        const notes = [1046.5, 1318.5, 1567.98, 2093.0];
        notes.forEach((freq, idx) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ac.currentTime + 0.15 + idx * 0.12);

          gain.gain.setValueAtTime(0.0001, ac.currentTime + 0.15 + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.18 + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.9 + idx * 0.12);

          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(ac.currentTime + 0.15 + idx * 0.12);
          osc.stop(ac.currentTime + 1.2 + idx * 0.12);
        });
      } catch (_) {}
    }

    let particles = [];
    let animFrame = null;

    function createEffects() {
      particles = [];
      const rect = canvas.getBoundingClientRect();
      const originX = rect.width / 2;
      const originY = rect.height - 85;

      const starColors = ["#ffd700", "#fff3b0", "#ffecb3", "#f3c5d2", "#e8a0b4", "#ffffff"];
      for (let i = 0; i < 65; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 4.5;
        particles.push({
          type: "star",
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: 1.5 + Math.random() * 3,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          alpha: 1,
          decay: 0.012 + Math.random() * 0.016,
          sparkle: Math.random() * Math.PI * 2,
        });
      }

      for (let i = 0; i < 18; i++) {
        particles.push({
          type: "smoke",
          x: originX + (Math.random() * 8 - 4),
          y: originY - (Math.random() * 10),
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.0 - Math.random() * 1.6,
          size: 4 + Math.random() * 5,
          maxSize: 18 + Math.random() * 14,
          growth: 0.28 + Math.random() * 0.25,
          alpha: 0.55,
          decay: 0.007 + Math.random() * 0.006,
          wiggle: Math.random() * Math.PI * 2,
        });
      }

      if (animFrame) cancelAnimationFrame(animFrame);
      animateParticles();
    }

    function animateParticles() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      let alive = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;
        alive = true;

        if (p.type === "star") {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.045;
          p.vx *= 0.98;
          p.alpha -= p.decay;
          p.sparkle += 0.25;

          const twinkle = 0.6 + Math.sin(p.sparkle) * 0.4;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha * twinkle);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === "smoke") {
          p.x += p.vx + Math.sin(p.wiggle) * 0.45;
          p.y += p.vy;
          p.wiggle += 0.05;
          p.size = Math.min(p.maxSize, p.size + p.growth);
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = "rgba(220, 205, 212, 0.4)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (alive) {
        animFrame = requestAnimationFrame(animateParticles);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    }

    function stopMicrophone() {
      if (micAnimId) {
        cancelAnimationFrame(micAnimId);
        micAnimId = null;
      }
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
        micStream = null;
      }
      if (micBtn) {
        micBtn.classList.remove("is-active");
        micBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
          <span>Enable mic to blow</span>
        `;
      }
    }

    async function toggleMicrophone() {
      if (micStream) {
        stopMicrophone();
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone detection is not supported in this browser. You can tap the flame directly!");
        return;
      }

      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micBtn.classList.add("is-active");
        micBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
          <span>Listening... blow now! 💨</span>
        `;

        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioCtor();
        const source = audioCtx.createMediaStreamSource(micStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function checkBlow() {
          if (!micStream || isExtinguished) return;
          analyser.getByteFrequencyData(dataArray);

          let lowFreqEnergy = 0;
          for (let i = 0; i < 8; i++) {
            lowFreqEnergy += dataArray[i];
          }
          const avgEnergy = lowFreqEnergy / 8;

          if (avgEnergy > 90) {
            extinguish();
            return;
          }
          micAnimId = requestAnimationFrame(checkBlow);
        }

        checkBlow();
      } catch (err) {
        stopMicrophone();
        alert("Could not access microphone. You can tap the flame directly to make your wish!");
      }
    }

    function extinguish() {
      if (isExtinguished) return;
      isExtinguished = true;
      stopMicrophone();

      wrapper.classList.add("is-extinguished");
      wrapper.setAttribute("aria-disabled", "true");

      createEffects();
      playWishSound();

      if (prompt) prompt.style.opacity = "0";
      if (hint) hint.style.opacity = "0";
      if (micBtn) micBtn.style.display = "none";

      setTimeout(() => {
        if (message) {
          message.hidden = false;
        }
      }, 700);
    }

    function relight() {
      isExtinguished = false;
      wrapper.classList.remove("is-extinguished");
      wrapper.removeAttribute("aria-disabled");

      if (message) message.hidden = true;
      if (prompt) prompt.style.opacity = "1";
      if (hint) hint.style.opacity = "1";
      if (micBtn) micBtn.style.display = "inline-flex";

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    wrapper.addEventListener("click", extinguish);
    wrapper.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        extinguish();
      }
    });

    if (micBtn) micBtn.addEventListener("click", toggleMicrophone);
    if (relightBtn) relightBtn.addEventListener("click", relight);
  }

  async function tryUnlock(event) {
    if (event) event.preventDefault();

    if (await isCorrectDate(input.value)) {
      error.hidden = true;
      saveUnlocked();
      await unlock(true);
      return;
    }

    error.hidden = false;
    input.focus();
  }

  if (readUnlocked()) {
    unlock(false);
  }

  form.addEventListener("submit", tryUnlock);

  input.addEventListener("input", () => {
    error.hidden = true;
    let v = input.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 4) v = `${v.slice(0, 2)}.${v.slice(2, 4)}.${v.slice(4)}`;
    else if (v.length > 2) v = `${v.slice(0, 2)}.${v.slice(2)}`;
    input.value = v;
  });
})();
