# 100 Reasons — Interactive Anniversary Web Application

A lightweight, beautifully crafted, mobile-first web application designed as a private digital keepsake and love letter. Features a secure date-gated entrance, smooth-scrolling typography, celebratory canvas animations, and an interactive "Make a Wish" candle with real microphone blow-detection.

---

## Key Features

- **Private Entrance Gate**:
  - Soft client-side date verification matching a custom birthdate or anniversary (`DD.MM.YYYY`).
  - Passcode is evaluated using one-way **SHA-256 cryptographic hashing** — no plain-text dates are exposed in the source code.
  - Automatic digit formatting and keyboard input masking.
  - Session persistence (`sessionStorage`) ensures seamless navigation on refresh.

- **Hero & Heart Clip-Path**:
  - Responsive hero section utilizing an inline SVG `<clipPath>` for custom heart-shaped portrait masking.
  - Organic drop-shadow and smooth downward scroll cue.

- **Progressive Staggered Reasons**:
  - 100 distinct reasons rendered dynamically via `reasons.js`.
  - Driven by the **Intersection Observer API** for high-performance, scroll-triggered fade-in animations with minimal CPU/GPU overhead.

- **Celebratory Confetti Engine**:
  - Physics-based HTML5 Canvas particle system triggered upon unlocking.
  - Features custom pastel palette matching the site theme, random rotatory velocity, air resistance, and opacity falloff.

- **"Make a Wish" Interactive Candle**:
  - **Flickering Flame**: Multi-stage organic CSS animation with ambient radial warmth glow.
  - **Dual Extinguish Triggers**:
    - **Touch / Click**: Instant and reliable extinguish on mobile and desktop.
    - **Microphone Blow Detection**: Uses the **Web Audio API** and Fast Fourier Transform (FFT) analysis to detect low-frequency breath acoustics when blown into the microphone.
  - **Dynamic Particle Effects**:
    - Procedural wisps of translucent smoke rising lazily with organic sinusoidal drift.
    - Sparkling golden and rose stardust burst radiating outward.
  - **Zero-Asset Audio Synthesis**:
    - Breath whoosh and delicate 4-note fairy chimes synthesized procedurally via `AudioContext` oscillators and filtered noise buffers — no external audio assets required.
  - **Relight Functionality**: Allows the recipient to make new wishes anytime.

- **Accessibility & Privacy**:
  - Respects `prefers-reduced-motion` media queries across all animations and transitions.
  - Strict privacy headers and search engine exclusion directives (`robots.txt`, `noindex`, `nofollow`, `noarchive`, `nosnippet`, `noimageindex`, `no-referrer`).
  - Zero build step, zero dependencies, completely offline-capable.

---

## File Structure

```text
├── index.html            # Main semantic markup, SVG definitions & modal structures
├── styles.css            # Responsive layout, CSS variables, typography & keyframes
├── script.js             # Core logic: authentication, canvas engines, audio synthesis & mic detector
├── reasons.js            # Extensible data file containing the 100 reasons
├── images/               # Image assets directory (hero portraits and backups)
├── robots.txt            # Search engine crawl restrictions
└── README.md             # Project documentation
```

---

## Getting Started

### Local Preview

Because this project is built entirely on vanilla web standards, no compilation, transpilation, or package installation is required.

You can launch a local HTTP server using any of the following:

**Using Python 3:**
```bash
python -m http.server 8000
```

**Using Node.js (`npx`):**
```bash
npx serve
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your web browser.

> **Note on Direct File Opening (`file://`):**
> The application includes an internal fallback SHA-256 engine for non-secure contexts, allowing the page to open directly by double-clicking `index.html`. However, microphone access requires a secure context (`https://` or `localhost`).

---

## Customization Guide

### 1. Setting a Custom Passcode (Date)

The unlock code is verified by comparing the SHA-256 hash of the 8 digits (`DDMMYYYY`).

1. Choose your 8-digit date string (e.g., `13022005` for February 13, 2005).
2. Generate its SHA-256 hash:
   - **Terminal (macOS/Linux):**
     ```bash
     echo -n "14092002" | sha256sum
     ```
   - **Terminal (Windows PowerShell):**
     ```powershell
     [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes('13022005'))).Replace('-', '').ToLower()
     ```
3. In `script.js`, replace the `SECRET_HASH` constant:
   ```javascript
   const SECRET_HASH = "your_generated_sha256_hash_here";
   ```

### 2. Editing the Reasons

Open `reasons.js` to modify, add, or customize any of the entries in the `reasons` array:

```javascript
var reasons = [
  "Because your smile can save my entire day.",
  "Because you make the world a little softer.",
  // ... add or edit items here
];
```

### 3. Replacing the Hero Image

Place your image inside the `images/` folder as `anna.png` (or update the `src` attribute in `index.html`):

```html
<div class="hero__photo">
  <img src="images/your_photo.png" alt="Hero Portrait" />
</div>
```

The heart clip automatically crops the image into a heart shape. You can adjust the focal point inside `styles.css` using `object-position`:

```css
.hero__photo img {
  object-fit: cover;
  object-position: center 22%; /* Adjust vertical focus */
}
```

### 4. Customizing Colors & Typography

All primary colors and fonts are declared as CSS custom properties at the top of `styles.css`:

```css
:root {
  --bg: #faf3f5;
  --ink: #2a1f22;
  --soft: #8a6f78;
  --rosa: #e8a0b4;
  --rosa-deep: #d4849c;
  --rosa-soft: #f3c5d2;
  --line: rgba(212, 132, 156, 0.22);
  --display: "Fraunces", Georgia, serif;
  --body: "Manrope", sans-serif;
}
```

---

## Deployment

Deploy for free on any static hosting provider:

### Vercel
```bash
npx vercel
```

### Netlify
Drag and drop the project folder directly into the [Netlify Drop](https://app.netlify.com/drop) console.

### GitHub Pages
1. Push the repository to GitHub.
2. In your repository settings, navigate to **Pages** > **Build and deployment** > **Source** > Select `Deploy from a branch` (`main` / root).

---

## Technology Stack

- **Markup**: Semantic HTML5 with embedded SVG clip-path geometry
- **Styles**: Modern CSS3 (Grid, Flexbox, Custom Properties, Keyframe Animations)
- **Scripting**: Vanilla JavaScript (ES6+)
- **APIs Used**:
  - Web Audio API (`AudioContext`, `BiquadFilterNode`, `OscillatorNode`)
  - MediaStreams / `getUserMedia` (Acoustic blowing detection)
  - HTML5 Canvas API (Particle physics & stardust rendering)
  - Intersection Observer API (Viewport entry detection)
- **Fonts**: Google Fonts (`Fraunces` & `Manrope`)

---

## License

This project is created for personal and educational use. Feel free to customize and share it with someone special.
