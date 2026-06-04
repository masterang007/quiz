/* =========================================================================
   DCS Awareness Quiz — Shared Application Script
   ------------------------------------------------------------------------
   Exposes the global object `DCSQuiz` with four page bootstraps:
     - DCSQuiz.landing
     - DCSQuiz.quiz
     - DCSQuiz.result
     - DCSQuiz.leaderboard
   Cross-page state is passed via sessionStorage (active session) and
   localStorage (persistent leaderboard).
   ========================================================================= */

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------
  const CONFIG = {
    QUESTIONS_PER_QUIZ: 10,     // how many to draw from the bank
    SECONDS_PER_QUESTION: 20,   // countdown timer per question
    PASS_MARK_PCT: 70,          // pass threshold
    LEADERBOARD_KEY: "dcs_quiz_leaderboard_v1",
    SESSION_KEY: "dcs_quiz_session_v1",
    LAST_RESULT_KEY: "dcs_quiz_last_result_v1",
    MAX_LEADERBOARD: 10
  };

  // ---------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Fisher-Yates shuffle. Returns a new array. */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Escape HTML so user-supplied text can't break the page. */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  }

  /** Format a date as YYYY-MM-DD HH:mm for the leaderboard. */
  function formatDate(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /** Safe JSON read from a Storage object. */
  function readJSON(storage, key, fallback) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  /** Safe JSON write to a Storage object. */
  function writeJSON(storage, key, value) {
    try { storage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  // ---------------------------------------------------------------------
  // Quiz preparation
  // ---------------------------------------------------------------------
  /**
   * Build a randomized quiz session from the question bank:
   *   - pick N questions at random (no repeats)
   *   - shuffle answer order per question, remapping correctAnswer
   *   - return a session object stored in sessionStorage
   */
  function buildSession(participant, department) {
    const bank = window.QUESTIONS || [];
    if (bank.length === 0) {
      throw new Error("Question bank is empty.");
    }

    const count = Math.min(CONFIG.QUESTIONS_PER_QUIZ, bank.length);
    const picked = shuffle(bank).slice(0, count);

    const questions = picked.map((q) => {
      // Pair each option with whether it's correct, shuffle, then find new index
      const paired = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correctAnswer
      }));
      const shuffled = shuffle(paired);
      return {
        category: q.category || "General",
        question: q.question,
        options: shuffled.map(p => p.text),
        correctAnswer: shuffled.findIndex(p => p.isCorrect),
        userAnswer: null,   // index chosen by user, or null/-1 (timeout)
        timedOut: false
      };
    });

    return {
      participant,
      department,
      questions,
      currentIndex: 0,
      startedAt: Date.now()
    };
  }

  // ---------------------------------------------------------------------
  // Landing page
  // ---------------------------------------------------------------------
  const landing = {
    init() {
      const form = $("#start-form");
      if (!form) return;

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("#participant-name").value.trim();
        const dept = $("#department").value;
        if (!name) {
          alert("Please enter your name.");
          return;
        }
        if (!dept) {
          alert("Please select your department.");
          return;
        }

        try {
          const session = buildSession(name, dept);
          writeJSON(sessionStorage, CONFIG.SESSION_KEY, session);
          window.location.href = "quiz.html";
        } catch (err) {
          alert("Could not start the quiz: " + err.message);
        }
      });
    }
  };

  // ---------------------------------------------------------------------
  // Quiz page
  // ---------------------------------------------------------------------
  const quiz = {
    session: null,
    timerId: null,
    secondsLeft: 0,
    lockedThisQuestion: false,

    init() {
      this.session = readJSON(sessionStorage, CONFIG.SESSION_KEY, null);
      if (!this.session) {
        // No active session — bounce back to landing.
        window.location.replace("index.html");
        return;
      }

      $("#participant-banner").textContent =
        `${this.session.participant} · ${this.session.department}`;
      $("#q-total").textContent = this.session.questions.length;

      this.renderQuestion();
    },

    renderQuestion() {
      const idx = this.session.currentIndex;
      const q = this.session.questions[idx];
      this.lockedThisQuestion = false;

      // Header counters + progress
      $("#q-current").textContent = idx + 1;
      const pct = (idx / this.session.questions.length) * 100;
      $("#progress-bar").style.width = pct + "%";

      // Category and question
      $("#category-tag").textContent = q.category;
      $("#question-text").textContent = q.question;

      // Options
      const wrap = $("#options");
      wrap.innerHTML = "";
      const letters = ["A", "B", "C", "D"];
      q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option";
        btn.setAttribute("role", "listitem");
        btn.innerHTML =
          `<span class="letter">${letters[i]}</span>` +
          `<span class="text">${escapeHtml(opt)}</span>`;
        btn.addEventListener("click", () => this.selectAnswer(i, btn));
        wrap.appendChild(btn);
      });

      // Timer
      this.startTimer();
    },

    startTimer() {
      this.stopTimer();
      this.secondsLeft = CONFIG.SECONDS_PER_QUESTION;
      const t = $("#timer");
      t.classList.remove("warn", "crit");
      t.textContent = this.secondsLeft + "s";

      this.timerId = setInterval(() => {
        this.secondsLeft--;
        if (this.secondsLeft <= 5) t.classList.add("crit");
        else if (this.secondsLeft <= 10) t.classList.add("warn");
        t.textContent = Math.max(0, this.secondsLeft) + "s";

        if (this.secondsLeft <= 0) {
          this.stopTimer();
          this.handleTimeout();
        }
      }, 1000);
    },

    stopTimer() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    },

    selectAnswer(choiceIndex, btnEl) {
      if (this.lockedThisQuestion) return;
      this.lockedThisQuestion = true;
      this.stopTimer();

      const q = this.session.questions[this.session.currentIndex];
      q.userAnswer = choiceIndex;
      q.timedOut = false;

      // Visual feedback
      const allBtns = $$("#options .option");
      allBtns.forEach((b, i) => {
        b.disabled = true;
        if (i === q.correctAnswer) b.classList.add("correct");
        if (i === choiceIndex && choiceIndex !== q.correctAnswer) b.classList.add("wrong");
      });
      btnEl.classList.add("selected");

      // Persist and advance
      writeJSON(sessionStorage, CONFIG.SESSION_KEY, this.session);
      setTimeout(() => this.advance(), 800);
    },

    handleTimeout() {
      this.lockedThisQuestion = true;
      const q = this.session.questions[this.session.currentIndex];
      q.userAnswer = -1;
      q.timedOut = true;

      // Reveal correct answer briefly
      const allBtns = $$("#options .option");
      allBtns.forEach((b, i) => {
        b.disabled = true;
        if (i === q.correctAnswer) b.classList.add("correct");
      });

      writeJSON(sessionStorage, CONFIG.SESSION_KEY, this.session);
      setTimeout(() => this.advance(), 1000);
    },

    advance() {
      this.session.currentIndex++;
      if (this.session.currentIndex >= this.session.questions.length) {
        this.finish();
      } else {
        writeJSON(sessionStorage, CONFIG.SESSION_KEY, this.session);
        this.renderQuestion();
      }
    },

    finish() {
      // Compute score
      const total = this.session.questions.length;
      let correct = 0;
      this.session.questions.forEach(q => {
        if (q.userAnswer === q.correctAnswer) correct++;
      });
      const percentage = Math.round((correct / total) * 100);
      const passed = percentage >= CONFIG.PASS_MARK_PCT;
      const finishedAt = Date.now();

      const result = {
        participant: this.session.participant,
        department: this.session.department,
        correct,
        total,
        percentage,
        passed,
        finishedAt,
        questions: this.session.questions
      };

      // Persist result for results/review page
      writeJSON(sessionStorage, CONFIG.LAST_RESULT_KEY, result);

      // Add to leaderboard (localStorage, persistent)
      const board = readJSON(localStorage, CONFIG.LEADERBOARD_KEY, []);
      board.push({
        name: result.participant,
        department: result.department,
        score: result.correct,
        total: result.total,
        percentage: result.percentage,
        date: result.finishedAt
      });
      // Sort by percentage desc, then by date desc (newer wins ties)
      board.sort((a, b) => (b.percentage - a.percentage) || (b.date - a.date));
      writeJSON(localStorage, CONFIG.LEADERBOARD_KEY, board.slice(0, 50));

      // Clear active session
      sessionStorage.removeItem(CONFIG.SESSION_KEY);
      window.location.href = "result.html";
    }
  };

  // ---------------------------------------------------------------------
  // Result page
  // ---------------------------------------------------------------------
  const result = {
    init() {
      const res = readJSON(sessionStorage, CONFIG.LAST_RESULT_KEY, null);
      if (!res) {
        window.location.replace("index.html");
        return;
      }

      $("#r-name").textContent  = res.participant;
      $("#r-dept").textContent  = res.department;
      $("#r-score").textContent = `${res.correct} / ${res.total}`;
      $("#r-date").textContent  = formatDate(res.finishedAt);

      $("#pct-text").textContent = res.percentage + "%";
      $("#score-circle").style.setProperty("--pct", res.percentage + "%");

      const banner = $("#status-banner");
      if (res.passed) {
        banner.textContent = "PASS";
        banner.classList.add("status-pass");
      } else {
        banner.textContent = "FAIL";
        banner.classList.add("status-fail");
      }

      // Message based on band
      let msg;
      const p = res.percentage;
      if (p >= 90) msg = "Excellent — outstanding command of DCS topics.";
      else if (p >= 80) msg = "Very Good — strong understanding with minor gaps.";
      else if (p >= 70) msg = "Pass — solid foundation, keep building on it.";
      else msg = "Needs Improvement — please review the material and try again.";
      $("#message-banner").textContent = msg;

      // Review toggle
      $("#btn-review").addEventListener("click", () => this.renderReview(res));

      // Confetti for > 80%
      if (res.percentage > 80) {
        launchConfetti();
      }
    },

    renderReview(res) {
      const section = $("#review-section");
      const list = $("#review-list");
      list.innerHTML = "";
      res.questions.forEach((q, i) => {
        const card = document.createElement("div");
        card.className = "review-card";
        const userText = q.userAnswer === -1
          ? "(no answer — time ran out)"
          : escapeHtml(q.options[q.userAnswer] ?? "");
        const correctText = escapeHtml(q.options[q.correctAnswer]);
        const userClass = (q.userAnswer === q.correctAnswer) ? "correct" : "wrong";
        card.innerHTML = `
          <div class="category-tag">${escapeHtml(q.category)}</div>
          <div class="rq">Q${i + 1}. ${escapeHtml(q.question)}</div>
          <div class="ra ${userClass}">
            <span class="lbl">Your answer:</span>${userText}
          </div>
          <div class="ra correct">
            <span class="lbl">Correct answer:</span>${correctText}
          </div>
        `;
        list.appendChild(card);
      });
      section.style.display = "block";
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      $("#btn-review").textContent = "Review Shown Below";
      $("#btn-review").disabled = true;
    }
  };

  // ---------------------------------------------------------------------
  // Leaderboard page
  // ---------------------------------------------------------------------
  const leaderboard = {
    init() {
      this.render();
      const clr = $("#btn-clear-lb");
      if (clr) {
        clr.addEventListener("click", () => {
          if (confirm("Clear all leaderboard entries on this device?")) {
            localStorage.removeItem(CONFIG.LEADERBOARD_KEY);
            this.render();
          }
        });
      }
    },

    render() {
      const board = readJSON(localStorage, CONFIG.LEADERBOARD_KEY, []);
      const top = board.slice(0, CONFIG.MAX_LEADERBOARD);
      const table = $("#lb-table");
      const empty = $("#lb-empty");
      const body  = $("#lb-body");

      if (top.length === 0) {
        table.style.display = "none";
        empty.style.display = "block";
        return;
      }

      table.style.display = "table";
      empty.style.display = "none";
      body.innerHTML = "";
      top.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><span class="rank-medal">${i + 1}</span></td>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.department)}</td>
          <td><strong>${row.score}/${row.total}</strong><br>
              <small>${row.percentage}%</small></td>
          <td>${formatDate(row.date)}</td>
        `;
        body.appendChild(tr);
      });
    }
  };

  // ---------------------------------------------------------------------
  // Confetti (lightweight, no library)
  // ---------------------------------------------------------------------
  function launchConfetti() {
    const colors = ["#2a9df4", "#1f9d55", "#d89e00", "#c0392b", "#143a6b", "#ffd54a"];
    const layer = document.createElement("div");
    layer.className = "confetti";
    document.body.appendChild(layer);

    const count = 120;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("i");
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.animationDuration = (2 + Math.random() * 2.5) + "s";
      piece.style.animationDelay = (Math.random() * 0.6) + "s";
      layer.appendChild(piece);
    }
    // Clean up after animation completes
    setTimeout(() => layer.remove(), 6000);
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------
  window.DCSQuiz = {
    config: CONFIG,
    landing,
    quiz,
    result,
    leaderboard
  };
})();
