# DCS Awareness Quiz

A professional, mobile-first web app for industrial plant training. Participants scan a QR code, enter their name and department, take a randomized multiple-choice quiz on DCS topics, and get an instant score with a leaderboard.

Built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools. Deploys directly to Netlify as a static site.

## Features

- **Landing page** — name input, department dropdown (Operations, Process, Instrument, Electrical, Maintenance, Engineering), QR code section.
- **Randomized quiz** — 10 questions drawn from a bank of 30+, with answer order shuffled per question.
- **20-second timer** per question with visual warning/critical states.
- **Progress bar** and question counter.
- **Auto-advance** after the user selects an answer (or the timer expires).
- **Instant scoring** — 1 point per correct answer, 70% pass mark.
- **Result page** showing name, department, score, percentage, pass/fail, and a banded performance message (Excellent / Very Good / Pass / Needs Improvement).
- **Review Answers** page — correct answers in green, wrong answers in red.
- **Confetti** animation for scores above 80%.
- **Top 10 leaderboard** persisted in `localStorage`.
- **Restart Quiz** and **Leaderboard** navigation.
- **Industrial / DeltaV-inspired theme** in dark blue, white, and light gray.
- Fully responsive — works on phones, tablets, and desktop.

## Project structure

```
/
├── index.html         # Landing page
├── quiz.html          # Quiz engine
├── result.html        # Score + review
├── leaderboard.html   # Top 10
├── style.css          # All styles
├── script.js          # All logic (DCSQuiz namespace)
├── questions.js       # 30+ question bank
├── netlify.toml       # Netlify static publish config
└── README.md
```

## Question bank

Edit [`questions.js`](questions.js) to add or modify questions. Each entry:

```js
{
  category: "DCS Fundamentals",
  question: "What does DCS stand for?",
  options: [
    "Digital Control System",
    "Distributed Control System",
    "Direct Communication System",
    "Data Control Station"
  ],
  correctAnswer: 1   // 0-based index
}
```

Categories included: DCS Fundamentals, Emerson DeltaV, Siemens PCS7, PLC Basics, HMI, I/O, Field Devices, Process Control, Alarm Management, SIS, Cybersecurity, PI System.

## Configuration

Tweak the quiz behavior at the top of [`script.js`](script.js):

```js
const CONFIG = {
  QUESTIONS_PER_QUIZ: 10,     // how many drawn per session
  SECONDS_PER_QUESTION: 20,   // countdown timer
  PASS_MARK_PCT: 70,          // pass threshold
  MAX_LEADERBOARD: 10
};
```

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Deploy

### GitHub
```bash
cd Quiz
git init
git add .
git commit -m "DCS Awareness Quiz"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### Netlify
1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Build command: *(leave empty)*. Publish directory: `.` (already set in `netlify.toml`).
3. Deploy. You'll get a `https://<random>.netlify.app/` URL.

Or drag the project folder onto https://app.netlify.com/drop for an instant URL.

## QR code

The landing page renders a placeholder QR using the public `qrserver.com` API. Once you have your deployed URL, edit the `<img>` `src` in [`index.html`](index.html):

```html
<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fyour-site.netlify.app%2F" />
```

URL-encode the destination (e.g., `https://` → `https%3A%2F%2F`).

## Customization

- **Company logo** — replace the text node in `<div class="logo">DCS</div>` (in each HTML file) with an `<img src="logo.png" alt="Company">` tag.
- **Theme colors** — change the CSS variables at the top of [`style.css`](style.css) (`--navy-900`, `--accent`, etc.).
- **Pass mark / question count / timer** — see CONFIG in [`script.js`](script.js).

## Notes

- The leaderboard is stored in each browser's `localStorage`; it is per-device and not shared across users. For a shared leaderboard, point the result submission at a backend (Netlify Functions + a database, Firebase, Supabase, etc.).
- Active quiz state lives in `sessionStorage` so a reload mid-quiz cleanly bounces back to the landing page.
- No external libraries — confetti and timers are hand-rolled.
