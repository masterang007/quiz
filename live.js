/* =========================================================================
   DCS Awareness Quiz — Live host/player mode
   ========================================================================= */
(function () {
  "use strict";

  const CONFIG = {
    ROOM_ID: "main",
    QUESTION_SECONDS: 100,
    ROOM_KEY: "dcs_live_room_id_v1",
    PLAYER_KEY: "dcs_live_player_id_v1"
  };

  const ROOM_ID =
    new URLSearchParams(window.location.search).get("room") ||
    localStorage.getItem(CONFIG.ROOM_KEY) ||
    CONFIG.ROOM_ID;
  localStorage.setItem(CONFIG.ROOM_KEY, ROOM_ID);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = id => document.getElementById(id);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function slugify(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  function now() { return Date.now(); }

  function optionLetter(i) { return ["A","B","C","D","E","F"][i] || String(i+1); }

  function questionBank() {
    return (window.QUESTIONS || []).map((q, i) => ({
      id: `q${i+1}`,
      category: q.category || "General",
      question: q.question,
      options: q.options,
      correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : q.answer
    })).filter(q =>
      q.question && Array.isArray(q.options) &&
      q.options.length >= 2 && Number.isInteger(q.correctAnswer)
    );
  }

  function buildGameQuestions(chapter) {
    let bank = questionBank();
    if (chapter && chapter !== "all") bank = bank.filter(q => q.category === chapter);
    return shuffle(bank).slice(0, bank.length).map(q => {
      const paired = q.options.map((text, i) => ({ text, isCorrect: i === q.correctAnswer }));
      const opts = shuffle(paired);
      return {
        id: q.id,
        category: q.category,
        question: q.question,
        options: opts.map(o => o.text),
        correctAnswer: opts.findIndex(o => o.isCorrect)
      };
    });
  }

  function firebaseReady() {
    return window.firebase && window.FIREBASE_CONFIG &&
      !String(window.FIREBASE_CONFIG.apiKey || "").startsWith("PASTE_");
  }

  function db() {
    if (!firebaseReady()) {
      const w = el("config-warning");
      if (w) w.hidden = false;
      return null;
    }
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    return firebase.database();
  }

  function roomRef(path) {
    const database = db();
    if (!database) return null;
    return database.ref(`rooms/${ROOM_ID}${path ? "/" + path : ""}`);
  }

  function scorePlayers(players, questions, excludeIndex = -1) {
    const rows = Object.entries(players || {}).map(([id, p]) => {
      let score = 0;
      let totalAnswerTime = 0; // sum of ms taken to answer each question (lower = faster)
      const answers = p.answers || {};
      (questions || []).forEach((q, i) => {
        if (i === excludeIndex) return;
        if (!answers[i]) return;
        if (answers[i].answer === q.correctAnswer) score++;
        // answeredAt minus questionStartedAt gives response time per question
        if (answers[i].answeredAt) totalAnswerTime += answers[i].answeredAt;
      });
      return { id, name: p.name || "Player", department: p.department || "", score, totalAnswerTime };
    });

    // De-duplicate by name+department: keep the entry with the highest score
    const best = {};
    rows.forEach(r => {
      const key = `${r.name}||${r.department}`;
      if (!best[key] || r.score > best[key].score) best[key] = r;
    });

    return Object.values(best).sort((a, b) =>
      b.score - a.score ||                         // 1st: highest score
      a.totalAnswerTime - b.totalAnswerTime ||      // 2nd: fastest total answer time
      a.name.localeCompare(b.name)                 // 3rd: alphabetical
    );
  }

  function answerCount(players, index) {
    return Object.values(players || {})
      .filter(p => p.answers && p.answers[index]).length;
  }

  function timerText(room) {
    if (!room || room.status !== "question" || !room.questionEndsAt) return "--";
    const left = Math.max(0, Math.ceil((room.questionEndsAt - now()) / 1000));
    return `${left}s`;
  }

  function playerId() {
    let id = localStorage.getItem(CONFIG.PLAYER_KEY);
    if (!id) {
      id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(CONFIG.PLAYER_KEY, id);
    }
    return id;
  }

  /* ================================================================
     HOST
     ================================================================ */
  const host = {
    room: null,
    timerId: null,

    init() {
      const url = joinUrl();
      const qrEl = el("join-qr");
      const urlEl = el("join-url");
      if (qrEl) qrEl.src = qrUrl(url);
      if (urlEl) urlEl.textContent = url;
      if (el("room-code")) el("room-code").textContent = ROOM_ID;

      // Live timer tick
      setInterval(() => {
        if (this.room && this.room.status === "question") {
          const t = el("host-timer");
          if (t) t.textContent = timerText(this.room);
        }
      }, 500);

      // Chapter selector: populate question preview on change
      const chapterSel = el("chapter-select");
      if (chapterSel) {
        chapterSel.addEventListener("change", () => this.renderQuestionPreview());
        this.renderQuestionPreview();
      }

      if (!db()) return;

      // Bind buttons
      const on = (id, fn) => { const b = el(id); if (b) b.addEventListener("click", fn); };
      on("btn-start-quiz",     () => this.startQuiz());
      on("btn-show-answer",    () => this.showAnswer());
      on("btn-next-question",  () => this.nextQuestion());
      on("btn-end-game",       () => this.endGame());
      on("btn-new-game",       () => this.newGame());

      // Ensure a lobby room exists so players can join immediately
      this.ensureLobby();

      roomRef().on("value", snap => {
        this.room = snap.val();
        this.render();
      });
    },

    ensureLobby() {
      roomRef().once("value").then(snap => {
        if (!snap.val()) {
          roomRef().set({
            status: "lobby",
            currentIndex: 0,
            questionStartedAt: null,
            questionEndsAt: null,
            showAnswer: false,
            chapter: null,
            questions: null,
            players: {}
          }).catch(err => console.error("Lobby init:", err));
        }
      });
    },

    // Show questions for the selected chapter in the lobby preview
    renderQuestionPreview() {
      const preview = el("question-preview");
      if (!preview) return;
      const chapterSel = el("chapter-select");
      const chapter = chapterSel ? chapterSel.value : "all";

      let bank = questionBank();
      if (chapter !== "all") {
        // Single chapter — simple numbered list
        bank = bank.filter(q => q.category === chapter);
        if (bank.length === 0) {
          preview.innerHTML = `<div style="color:var(--red);font-size:13px;padding:8px 0;">No questions found.</div>`;
          return;
        }
        preview.innerHTML = `
          <div class="q-preview-header">${bank.length} questions in this chapter:</div>
          <ol class="q-preview-list">
            ${bank.map(q => `<li>${escapeHtml(q.question)}</li>`).join("")}
          </ol>
        `;
      } else {
        // All chapters — group by chapter
        const groups = {};
        bank.forEach(q => {
          if (!groups[q.category]) groups[q.category] = [];
          groups[q.category].push(q);
        });
        const sections = Object.entries(groups).map(([cat, qs]) => `
          <div style="margin-bottom:14px;">
            <div style="font-size:12px;font-weight:800;color:var(--navy-700);text-transform:uppercase;
                        letter-spacing:0.6px;margin-bottom:6px;padding:4px 0;
                        border-bottom:2px solid var(--gray-200);">
              ${escapeHtml(cat)} &nbsp;<span style="font-weight:400;color:var(--gray-700);">(${qs.length} questions)</span>
            </div>
            <ol class="q-preview-list" style="margin:0;">
              ${qs.map(q => `<li>${escapeHtml(q.question)}</li>`).join("")}
            </ol>
          </div>
        `).join("");
        preview.innerHTML = `
          <div class="q-preview-header">${bank.length} questions total across ${Object.keys(groups).length} chapters:</div>
          ${sections}
        `;
      }
    },

    /* ── Game control ──────────────────────────────────── */

    startQuiz() {
      const chapterSel = el("chapter-select");
      const chapter = chapterSel ? chapterSel.value : "all";
      const chapterLabel = chapter === "all" ? "All Chapters" : chapter;

      const questions = buildGameQuestions(chapter);
      if (questions.length === 0) {
        alert("No questions found for this chapter. Please check your question bank.");
        return;
      }

      const startedAt = now();
      const updates = {
        status: "question",
        currentIndex: 0,
        questionStartedAt: startedAt,
        questionEndsAt: startedAt + CONFIG.QUESTION_SECONDS * 1000,
        showAnswer: false,
        chapter: chapterLabel,
        questions
      };

      // Clear answers from any previous game without removing player names
      if (this.room && this.room.players) {
        Object.keys(this.room.players).forEach(id => {
          updates[`players/${id}/answers`] = null;
        });
      }

      roomRef().update(updates).catch(this.reportError("Start quiz"));
      this.startLocalTimer();
    },

    showAnswer() {
      roomRef().update({ status: "review", showAnswer: true })
        .catch(this.reportError("Show answer"));
      this.stopLocalTimer();
    },

    nextQuestion() {
      if (!this.room || !this.room.questions) return;
      const next = (this.room.currentIndex || 0) + 1;
      if (next >= this.room.questions.length) {
        this.endGame();
        return;
      }
      const startedAt = now();
      roomRef().update({
        status: "question",
        currentIndex: next,
        questionStartedAt: startedAt,
        questionEndsAt: startedAt + CONFIG.QUESTION_SECONDS * 1000,
        showAnswer: false
      }).catch(this.reportError("Next question"));
      this.startLocalTimer();
    },

    endGame() {
      roomRef().update({ status: "ended", showAnswer: true })
        .catch(this.reportError("End game"));
      this.stopLocalTimer();
      // Save to persistent leaderboard after Firebase propagates
      setTimeout(() => this.saveLeaderboard(), 800);
    },

    clearPlayers() {
      if (!confirm("Remove all joined players? They will need to scan and join again.")) return;
      roomRef("players").set({}).catch(this.reportError("Clear players"));
    },

    clearLeaderboard() {
      if (!confirm("Delete the entire leaderboard for ALL chapters? This cannot be undone.")) return;
      const database = db();
      if (!database) return;
      database.ref("leaderboard").remove().catch(this.reportError("Clear leaderboard"));
    },

    newGame() {
      // Return to lobby — keep players so they don't need to re-join
      roomRef().update({
        status: "lobby",
        currentIndex: 0,
        questionStartedAt: null,
        questionEndsAt: null,
        showAnswer: false,
        chapter: null,
        questions: null
      }).catch(this.reportError("New game"));
      this.stopLocalTimer();
    },

    saveLeaderboard() {
      const room = this.room;
      if (!room || !room.players || !room.questions) return;
      const database = db();
      if (!database) return;

      const chapter = room.chapter || "All Chapters";
      const chapterKey = slugify(chapter);
      const completedAt = now();
      const updates = {};

      Object.entries(room.players).forEach(([id, p]) => {
        if (!p.name) return;
        let score = 0;
        const answers = p.answers || {};
        room.questions.forEach((q, i) => {
          if (answers[i] && answers[i].answer === q.correctAnswer) score++;
        });
        updates[`leaderboard/${chapterKey}/${completedAt}_${id.slice(0,8)}`] = {
          name: p.name,
          department: p.department || "",
          score,
          total: room.questions.length,
          chapter,
          completedAt
        };
      });

      if (!Object.keys(updates).length) return;
      database.ref().update(updates)
        .then(() => console.log("Leaderboard saved."))
        .catch(err => console.error("Leaderboard save failed:", err));
    },

    startLocalTimer() {
      this.stopLocalTimer();
      this.timerId = setInterval(() => {
        if (this.room && this.room.questionEndsAt && this.room.questionEndsAt <= now()) {
          this.showAnswer();
        }
      }, 500);
    },
    stopLocalTimer() {
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = null;
    },

    reportError(action) {
      return function (err) {
        console.error(`${action} failed:`, err);
        alert(`${action} failed: ${err && err.message ? err.message : err}\n\nCheck your Firebase Database rules.`);
      };
    },

    /* ── Render ──────────────────────────────────────── */

    render() {
      const room = this.room;
      const status = room ? room.status : "lobby";

      // Route to correct phase div
      ["lobby","question","review","ended"].forEach(s => {
        const phaseEl = el(`${s === "ended" ? "end" : s}-phase`);
        if (phaseEl) phaseEl.hidden = s !== status;
      });

      if (!room || status === "lobby") {
        this.renderLobby(room);
      } else if (status === "question") {
        this.startLocalTimer();
        this.renderQuestionPhase(room);
      } else if (status === "review") {
        this.stopLocalTimer();
        this.renderReviewPhase(room);
      } else if (status === "ended") {
        this.renderEndPhase(room);
      }
    },

    renderLobby(room) {
      const players = room ? (room.players || {}) : {};
      const entries = Object.values(players).filter(p => p.name);

      const badge = el("player-count-badge");
      if (badge) badge.textContent = entries.length;

      const list = el("player-list-lobby");
      if (!list) return;

      if (entries.length === 0) {
        list.innerHTML = `<div class="empty-state" style="padding:14px 0;font-size:13px;">Waiting for players to scan and join…</div>`;
      } else {
        list.innerHTML = entries.map(p => `
          <div class="player-row">
            <span class="player-dot"></span>
            <strong>${escapeHtml(p.name)}</strong>
            <span class="player-dept">${escapeHtml(p.department || "")}</span>
          </div>
        `).join("");
      }
    },

    renderQuestionPhase(room) {
      const q = (room.questions || [])[room.currentIndex || 0];
      if (!q) return;

      const idx = room.currentIndex || 0;
      const total = room.questions.length;
      const answered = answerCount(room.players || {}, idx);
      const playerCount = Object.keys(room.players || {}).length;

      if (el("host-category")) el("host-category").textContent = q.category;
      if (el("q-progress")) el("q-progress").textContent = `Question ${idx + 1} / ${total}`;
      if (el("host-timer")) el("host-timer").textContent = timerText(room);
      if (el("host-question")) el("host-question").textContent = q.question;
      if (el("answer-count-text")) el("answer-count-text").textContent = `${answered} / ${playerCount} players answered`;

      if (el("host-options")) {
        el("host-options").innerHTML = q.options.map((opt, i) => `
          <div class="live-option">
            <span>${optionLetter(i)}</span>
            <strong>${escapeHtml(opt)}</strong>
          </div>
        `).join("");
      }

      this.renderScores(scorePlayers(room.players || {}, room.questions), "scoreboard-live");
    },

    renderReviewPhase(room) {
      const q = (room.questions || [])[room.currentIndex || 0];
      if (!q) return;

      const idx = room.currentIndex || 0;
      const total = room.questions.length;
      const isLast = idx >= total - 1;

      if (el("review-category")) el("review-category").textContent = q.category;
      if (el("review-progress")) el("review-progress").textContent = `Question ${idx + 1} / ${total}`;
      if (el("review-question")) el("review-question").textContent = q.question;

      if (el("review-options")) {
        el("review-options").innerHTML = q.options.map((opt, i) => {
          const correct = i === q.correctAnswer;
          return `
            <div class="live-option ${correct ? "correct" : ""}">
              <span>${optionLetter(i)}</span>
              <strong>${escapeHtml(opt)}</strong>
            </div>
          `;
        }).join("");
      }

      const nextBtn = el("btn-next-question");
      if (nextBtn) nextBtn.textContent = isLast ? "Show Final Scores" : "Next Question →";

      this.renderScores(scorePlayers(room.players || {}, room.questions), "scoreboard-review");
    },

    renderEndPhase(room) {
      const chapter = room.chapter || "";
      if (el("chapter-name-end")) {
        el("chapter-name-end").textContent = chapter ? `Chapter: ${chapter}` : "";
      }

      const scores = scorePlayers(room.players || {}, room.questions || []);
      const total = room.questions ? room.questions.length : "?";
      const medals = ["🥇","🥈","🥉"];
      const finalEl = el("final-scoreboard");
      if (!finalEl) return;

      if (scores.length === 0) {
        finalEl.innerHTML = `<div class="empty-state">No players completed the quiz.</div>`;
        return;
      }

      finalEl.innerHTML = `<div class="final-scores-list">` +
        scores.map((p, i) => {
          const pct = total > 0 ? Math.round((p.score / total) * 100) : 0;
          return `
            <div class="final-score-row ${i === 0 ? "winner" : ""}">
              <span class="medal">${medals[i] || i + 1}</span>
              <span class="f-name">${escapeHtml(p.name)}</span>
              <span class="f-dept">${escapeHtml(p.department)}</span>
              <span class="f-score">${p.score} / ${total}</span>
              <span class="f-pct">${pct}%</span>
            </div>
          `;
        }).join("") + `</div>`;
    },

    renderScores(scores, containerId) {
      const wrap = el(containerId);
      if (!wrap) return;
      if (scores.length === 0) {
        wrap.innerHTML = `<div class="empty-state" style="padding:10px 0;font-size:13px;">No players yet.</div>`;
        return;
      }
      wrap.innerHTML = scores.slice(0, 8).map((row, i) => `
        <div class="score-row">
          <span class="rank-medal">${i + 1}</span>
          <span>${escapeHtml(row.name)}</span>
          <strong>${row.score}</strong>
        </div>
      `).join("");
    }
  };

  /* ================================================================
     PLAYER
     ================================================================ */
  const player = {
    room: null,
    id: playerId(),
    pendingAnswer: null,

    init() {
      if (el("room-code")) el("room-code").textContent = ROOM_ID;

      setInterval(() => {
        if (this.room && el("player-timer")) {
          el("player-timer").textContent = timerText(this.room);
        }
      }, 500);

      if (!db()) return;

      const savedName = localStorage.getItem(`${CONFIG.PLAYER_KEY}_name`) || "";
      const savedDept = localStorage.getItem(`${CONFIG.PLAYER_KEY}_dept`) || "";
      if (el("player-name")) el("player-name").value = savedName;
      if (el("player-department")) el("player-department").value = savedDept;

      const joinForm = el("join-form");
      if (joinForm) joinForm.addEventListener("submit", e => { e.preventDefault(); this.join(); });

      const optionsWrap = el("player-options");
      if (optionsWrap) {
        optionsWrap.addEventListener("change", e => {
          const input = e.target;
          if (!input || input.name !== "player-answer") return;
          if (optionsWrap.hasAttribute("data-locked")) return;
          const idx = Number(input.value);
          if (Number.isInteger(idx)) this.answer(idx);
        });
      }

      roomRef().on("value", snap => {
        this.room = snap.val();
        this.render();
      });
    },

    join() {
      const name = (el("player-name") && el("player-name").value.trim()) || "";
      const department = (el("player-department") && el("player-department").value) || "";
      if (!name) { alert("Please enter your name."); return; }
      if (!department) { alert("Please select your department."); return; }
      localStorage.setItem(`${CONFIG.PLAYER_KEY}_name`, name);
      localStorage.setItem(`${CONFIG.PLAYER_KEY}_dept`, department);
      roomRef(`players/${this.id}`).update({ name, department, joinedAt: now() })
        .catch(err => alert("Could not join: " + (err && err.message ? err.message : err)));
    },

    answer(index) {
      if (!this.room || this.room.status !== "question") return;
      const currentIndex = this.room.currentIndex || 0;
      this.pendingAnswer = index;
      this.markSelectedLocally(index);
      roomRef(`players/${this.id}/answers/${currentIndex}`)
        .set({ answer: index, answeredAt: now() })
        .then(() => { if (this.pendingAnswer === index) this.pendingAnswer = null; })
        .catch(err => {
          if (this.pendingAnswer === index) this.pendingAnswer = null;
          if (el("player-message")) el("player-message").textContent =
            "Could not send answer. " + (err && err.message ? err.message : "");
        });
    },

    markSelectedLocally(index) {
      $$("#player-options .answer-btn").forEach((label, i) => {
        const input = label.querySelector("input[type=radio]");
        label.classList.toggle("selected", i === index);
        if (input) input.checked = (i === index);
      });
      if (el("player-message")) el("player-message").textContent =
        "Answer locked in. You can change it until the host moves on.";
    },

    render() {
      const room = this.room;
      if (!room) {
        if (el("player-state")) el("player-state").textContent = "Waiting for host to create a game.";
        return;
      }
      const joined = !!room.players?.[this.id];
      if (el("join-card")) el("join-card").hidden = joined;
      if (el("answer-card")) el("answer-card").hidden = !joined;
      if (el("player-state")) el("player-state").textContent = statusText(room.status);
      if (!joined) return;
      this.renderQuestion(room);
      this.renderPlayerScore(room);
    },

    renderQuestion(room) {
      const questions = room.questions || [];
      const currentIndex = room.currentIndex || 0;
      const q = questions[currentIndex];

      if (!q) {
        // No question yet — show waiting screen
        const waitScreen = el("player-waiting-screen");
        const wrap = el("player-options");
        if (waitScreen) waitScreen.style.display = "flex";
        if (wrap) { wrap.hidden = true; wrap.innerHTML = ""; }
        return;
      }

      const playerData = room.players?.[this.id] || {};
      const answered = playerData.answers?.[currentIndex];
      const isLive = room.status === "question";
      const locked = !isLive || !!room.showAnswer;

      if (el("player-category")) el("player-category").textContent = q.category || "General";
      if (el("player-question-number"))
        el("player-question-number").textContent = `${currentIndex + 1} / ${questions.length}`;
      if (el("player-question")) el("player-question").textContent = q.question;
      if (el("player-timer")) el("player-timer").textContent = timerText(room);

      // Show chapter name on player screen
      if (el("player-chapter")) el("player-chapter").textContent = room.chapter || "";

      // Toggle waiting screen vs answer buttons
      // Note: waitScreen has inline display:flex so we must use style.display, not hidden attribute
      const waitScreen = el("player-waiting-screen");
      const wrap = el("player-options");
      const showButtons = isLive || room.showAnswer || !!answered;
      if (waitScreen) waitScreen.style.display = showButtons ? "none" : "flex";
      if (wrap) wrap.hidden = !showButtons;

      if (!showButtons) return; // nothing more to render while waiting
      if (!wrap) return;
      wrap.toggleAttribute("data-locked", locked);

      const letterColors = ["answer-a", "answer-b", "answer-c", "answer-d"];
      wrap.innerHTML = q.options.map((option, index) => {
        const selected = (answered && answered.answer === index) || (this.pendingAnswer === index);
        const correct = room.showAnswer && index === q.correctAnswer;
        const wrong = room.showAnswer && selected && index !== q.correctAnswer;
        const waiting = !isLive && !answered && !correct && !wrong;
        const cls = [
          "answer-btn",
          letterColors[index] || "",
          selected ? "selected" : "",
          correct  ? "correct"  : "",
          wrong    ? "wrong"    : "",
          waiting  ? "is-waiting" : ""
        ].filter(Boolean).join(" ");
        const radioId = `opt-${currentIndex}-${index}`;
        return `
          <label class="${cls}" for="${radioId}">
            <input type="radio" id="${radioId}" name="player-answer" value="${index}"
              ${selected ? "checked" : ""} ${locked ? "disabled" : ""} />
            ${optionLetter(index)}
          </label>
        `;
      }).join("");

      if (el("player-message")) el("player-message").textContent = messageForPlayer(room, answered);
    },

    renderPlayerScore(room) {
      const questions = room.questions || [];
      const hideCurrent = room.status === "question" && !room.showAnswer;
      const excludeIndex = hideCurrent ? (room.currentIndex || 0) : -1;
      const scores = scorePlayers(room.players || {}, questions, excludeIndex);
      const mine = scores.find(r => r.id === this.id);
      if (el("player-score"))
        el("player-score").textContent = mine ? `${mine.score} point${mine.score === 1 ? "" : "s"}` : "0 points";
      if (el("player-rank")) {
        const rank = mine ? scores.findIndex(r => r.id === this.id) + 1 : "-";
        el("player-rank").textContent = `Rank ${rank}`;
      }
    }
  };

  /* ── Helpers ─────────────────────────────────────────── */

  function statusText(status) {
    if (status === "question") return "Question live";
    if (status === "review") return "Reviewing answer";
    if (status === "ended") return "Quiz ended";
    return "Lobby — waiting to start";
  }

  function messageForPlayer(room, answered) {
    if (room.status === "ended") return "Quiz ended. Check the host screen for your results!";
    if (room.status === "review") return "Answer revealed — see the host screen.";
    if (room.status === "question") {
      return answered ? "Answer selected. You can change it until the host moves on." : "Choose your answer.";
    }
    return "Wait for the host to start the quiz.";
  }

  function joinUrl() {
    return `${location.origin}/join.html?room=${encodeURIComponent(ROOM_ID)}`;
  }

  function qrUrl(url) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
  }

  window.DCSLiveQuiz = { host, player };
})();
