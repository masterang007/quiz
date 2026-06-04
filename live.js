/* =========================================================================
   DCS Awareness Quiz - Live host/player mode
   ------------------------------------------------------------------------
   Uses Firebase Realtime Database so one host screen controls the question
   while players answer from their phones.
   ========================================================================= */

(function () {
  "use strict";

  const CONFIG = {
    ROOM_ID: "main",
    QUESTION_SECONDS: 20,
    QUESTIONS_PER_GAME: 10,
    ROOM_KEY: "dcs_live_room_id_v1",
    PLAYER_KEY: "dcs_live_player_id_v1"
  };

  const ROOM_ID = new URLSearchParams(window.location.search).get("room") ||
    localStorage.getItem(CONFIG.ROOM_KEY) ||
    CONFIG.ROOM_ID;
  localStorage.setItem(CONFIG.ROOM_KEY, ROOM_ID);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function questionBank() {
    const bank = window.QUESTIONS || [];
    return bank.map((q, index) => ({
      id: `q${index + 1}`,
      category: q.category || "General",
      question: q.question,
      options: q.options,
      correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : q.answer
    })).filter(q =>
      q.question &&
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      Number.isInteger(q.correctAnswer)
    );
  }

  function buildGameQuestions() {
    return shuffle(questionBank()).slice(0, CONFIG.QUESTIONS_PER_GAME).map((q) => {
      const paired = q.options.map((text, index) => ({
        text,
        isCorrect: index === q.correctAnswer
      }));
      const options = shuffle(paired);
      return {
        id: q.id,
        category: q.category,
        question: q.question,
        options: options.map(o => o.text),
        correctAnswer: options.findIndex(o => o.isCorrect)
      };
    });
  }

  function firebaseReady() {
    return window.firebase &&
      window.FIREBASE_CONFIG &&
      !String(window.FIREBASE_CONFIG.apiKey || "").startsWith("PASTE_");
  }

  function showConfigWarning() {
    const warning = $("#config-warning");
    if (warning) warning.hidden = false;
  }

  function db() {
    if (!firebaseReady()) {
      showConfigWarning();
      return null;
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }
    return firebase.database();
  }

  function roomRef(path = "") {
    const database = db();
    if (!database) return null;
    return database.ref(`rooms/${ROOM_ID}${path ? "/" + path : ""}`);
  }

  function optionLetter(index) {
    return ["A", "B", "C", "D", "E", "F"][index] || String(index + 1);
  }

  function playerId() {
    let id = localStorage.getItem(CONFIG.PLAYER_KEY);
    if (!id) {
      id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(CONFIG.PLAYER_KEY, id);
    }
    return id;
  }

  function now() {
    return Date.now();
  }

  function scorePlayers(players, questions) {
    return Object.entries(players || {}).map(([id, player]) => {
      let score = 0;
      const answers = player.answers || {};
      questions.forEach((q, index) => {
        if (answers[index] && answers[index].answer === q.correctAnswer) score++;
      });
      return {
        id,
        name: player.name || "Player",
        department: player.department || "",
        score,
        answered: Object.keys(answers).length
      };
    }).sort((a, b) => (b.score - a.score) || a.name.localeCompare(b.name));
  }

  const host = {
    room: null,
    timerId: null,

    init() {
      $("#room-code").textContent = ROOM_ID;
      $("#join-url").textContent = joinUrl();
      $("#join-qr").src = qrUrl(joinUrl());
      setInterval(() => {
        if (this.room) $("#host-timer").textContent = timerText(this.room);
      }, 500);

      if (!db()) return;
      this.bindControls();
      roomRef().on("value", snap => {
        this.room = snap.val();
        this.render();
      });
    },

    bindControls() {
      $("#btn-new-game").addEventListener("click", () => this.newGame());
      $("#btn-start-question").addEventListener("click", () => this.startQuestion());
      $("#btn-show-answer").addEventListener("click", () => this.showAnswer());
      $("#btn-next-question").addEventListener("click", () => this.nextQuestion());
      $("#btn-end-game").addEventListener("click", () => this.endGame());
    },

    newGame() {
      const questions = buildGameQuestions();
      if (questions.length === 0) {
        alert("Question bank is empty or invalid.");
        return;
      }
      roomRef().set({
        status: "lobby",
        currentIndex: 0,
        questionStartedAt: null,
        questionEndsAt: null,
        showAnswer: false,
        createdAt: now(),
        questions,
        players: {}
      }).catch(reportHostError("Create game"));
    },

    startQuestion() {
      if (!this.room || !this.room.questions) return;
      const startedAt = now();
      roomRef().update({
        status: "question",
        showAnswer: false,
        questionStartedAt: startedAt,
        questionEndsAt: startedAt + CONFIG.QUESTION_SECONDS * 1000
      }).catch(reportHostError("Start question"));
      this.startLocalTimer();
    },

    showAnswer() {
      roomRef().update({ status: "review", showAnswer: true })
        .catch(reportHostError("Show answer"));
      this.stopLocalTimer();
    },

    nextQuestion() {
      if (!this.room || !this.room.questions) return;
      const next = (this.room.currentIndex || 0) + 1;
      if (next >= this.room.questions.length) {
        this.endGame();
        return;
      }
      roomRef().update({
        status: "lobby",
        currentIndex: next,
        questionStartedAt: null,
        questionEndsAt: null,
        showAnswer: false
      }).catch(reportHostError("Next question"));
      this.stopLocalTimer();
    },

    endGame() {
      roomRef().update({ status: "ended", showAnswer: true })
        .catch(reportHostError("End game"));
      this.stopLocalTimer();
    },

    startLocalTimer() {
      this.stopLocalTimer();
      this.timerId = setInterval(() => {
        if (!this.room || !this.room.questionEndsAt) return;
        if (this.room.questionEndsAt <= now()) {
          this.showAnswer();
        }
      }, 500);
    },

    stopLocalTimer() {
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = null;
    },

    render() {
      const room = this.room;
      if (!room) {
        $("#host-state").textContent = "No live game. Create a new game.";
        this.renderWaiting();
        return;
      }
      if (room.status === "question") this.startLocalTimer();
      else this.stopLocalTimer();

      const questions = room.questions || [];
      const q = questions[room.currentIndex || 0];
      const players = room.players || {};
      const scores = scorePlayers(players, questions);

      $("#host-state").textContent = statusText(room.status);
      $("#player-count").textContent = Object.keys(players).length;
      $("#answer-count").textContent = answerCount(players, room.currentIndex || 0);
      $("#question-count").textContent = questions.length;
      $("#current-number").textContent = Math.min((room.currentIndex || 0) + 1, questions.length || 1);

      this.renderQuestion(q, room);
      this.renderScores(scores);
      this.renderControls(room);
    },

    renderWaiting() {
      $("#host-question").textContent = "Create a game, then ask users to scan the QR code.";
      $("#host-options").innerHTML = "";
      $("#scoreboard").innerHTML = "";
      $("#answer-count").textContent = "0";
      $("#player-count").textContent = "0";
      $("#btn-start-question").disabled = true;
      $("#btn-show-answer").disabled = true;
      $("#btn-next-question").disabled = true;
      $("#btn-end-game").disabled = true;
    },

    renderQuestion(q, room) {
      if (!q) {
        this.renderWaiting();
        return;
      }
      $("#host-category").textContent = q.category || "General";
      $("#host-question").textContent = q.question;
      $("#host-timer").textContent = timerText(room);

      $("#host-options").innerHTML = q.options.map((option, index) => {
        const isCorrect = room.showAnswer && index === q.correctAnswer;
        return `
          <div class="live-option ${isCorrect ? "correct" : ""}">
            <span>${optionLetter(index)}</span>
            <strong>${escapeHtml(option)}</strong>
          </div>
        `;
      }).join("");
    },

    renderScores(scores) {
      const wrap = $("#scoreboard");
      if (scores.length === 0) {
        wrap.innerHTML = `<div class="empty-state">Waiting for players to join.</div>`;
        return;
      }
      wrap.innerHTML = scores.slice(0, 10).map((row, index) => `
        <div class="score-row">
          <span class="rank-medal">${index + 1}</span>
          <span>${escapeHtml(row.name)}</span>
          <strong>${row.score}</strong>
        </div>
      `).join("");
    },

    renderControls(room) {
      $("#btn-start-question").disabled = room.status === "question" || room.status === "ended";
      $("#btn-show-answer").disabled = room.status !== "question";
      $("#btn-next-question").disabled = !["review", "lobby"].includes(room.status);
      $("#btn-end-game").disabled = room.status === "ended";
    }
  };

  const player = {
    room: null,
    id: playerId(),
    pendingAnswer: null, // optimistic UI: index user just tapped, before DB confirms

    init() {
      $("#room-code").textContent = ROOM_ID;
      setInterval(() => {
        if (this.room) $("#player-timer").textContent = timerText(this.room);
      }, 500);

      if (!db()) return;

      const savedName = localStorage.getItem(`${CONFIG.PLAYER_KEY}_name`) || "";
      const savedDept = localStorage.getItem(`${CONFIG.PLAYER_KEY}_dept`) || "";
      $("#player-name").value = savedName;
      $("#player-department").value = savedDept;

      $("#join-form").addEventListener("submit", (e) => {
        e.preventDefault();
        this.join();
      });

      // Delegated change listener for the radio inputs — attached ONCE,
      // survives every re-render. We listen for `change` on the wrapper so
      // re-rendering the radio markup never tears the listener down.
      const optionsWrap = $("#player-options");
      optionsWrap.addEventListener("change", (e) => {
        const input = e.target;
        if (!input || input.name !== "player-answer") return;
        if (optionsWrap.hasAttribute("data-locked")) return;
        const idx = Number(input.value);
        if (Number.isInteger(idx)) this.answer(idx);
      });

      roomRef().on("value", snap => {
        this.room = snap.val();
        this.render();
      });
    },

    join() {
      const name = $("#player-name").value.trim();
      const department = $("#player-department").value;
      if (!name) {
        alert("Please enter your name.");
        return;
      }
      if (!department) {
        alert("Please select your department.");
        return;
      }
      localStorage.setItem(`${CONFIG.PLAYER_KEY}_name`, name);
      localStorage.setItem(`${CONFIG.PLAYER_KEY}_dept`, department);
      roomRef(`players/${this.id}`).update({
        name,
        department,
        joinedAt: now()
      }).catch(err => {
        console.error("Join failed:", err);
        alert("Could not join the quiz: " + (err && err.message ? err.message : err) +
              "\n\nThe host may need to relax the database rules.");
      });
    },

    answer(index) {
      if (!this.room) return;
      if (this.room.status !== "question") return;
      const currentIndex = this.room.currentIndex || 0;
      const answers = this.room.players?.[this.id]?.answers || {};
      if (answers[currentIndex] || this.pendingAnswer !== null) return;

      // Optimistic UI: mark immediately so the user sees feedback even
      // before the Firebase round-trip completes.
      this.pendingAnswer = index;
      this.markSelectedLocally(index);

      roomRef(`players/${this.id}/answers/${currentIndex}`)
        .set({ answer: index, answeredAt: now() })
        .then(() => {
          this.pendingAnswer = null;
        })
        .catch(err => {
          console.error("Answer write failed:", err);
          this.pendingAnswer = null;
          $("#player-message").textContent =
            "Could not send your answer. " + (err && err.message ? err.message : "");
          // Re-enable the buttons so the user can retry.
          this.unmarkSelectedLocally();
        });
    },

    markSelectedLocally(index) {
      const wrap = $("#player-options");
      if (wrap) wrap.setAttribute("data-locked", "");
      $$("#player-options .option").forEach((label, i) => {
        const input = label.querySelector("input[type=radio]");
        if (input) input.disabled = true;
        if (i === index) {
          label.classList.add("selected");
          if (input) input.checked = true;
        }
      });
      $("#player-message").textContent = "Answer submitted. Wait for the host.";
    },

    unmarkSelectedLocally() {
      const wrap = $("#player-options");
      if (wrap) wrap.removeAttribute("data-locked");
      $$("#player-options .option").forEach((label) => {
        const input = label.querySelector("input[type=radio]");
        if (input) {
          input.disabled = false;
          input.checked = false;
        }
        label.classList.remove("selected");
      });
    },

    render() {
      const room = this.room;
      if (!room) {
        $("#player-state").textContent = "Waiting for host to create a game.";
        return;
      }

      const joined = !!room.players?.[this.id];
      $("#join-card").hidden = joined;
      $("#answer-card").hidden = !joined;
      $("#player-state").textContent = statusText(room.status);

      if (!joined) return;
      this.renderQuestion(room);
      this.renderPlayerScore(room);
    },

    renderQuestion(room) {
      const questions = room.questions || [];
      const currentIndex = room.currentIndex || 0;
      const q = questions[currentIndex];
      if (!q) {
        $("#player-question").textContent = "Waiting for question.";
        $("#player-options").innerHTML = "";
        return;
      }

      const playerData = room.players?.[this.id] || {};
      const answered = playerData.answers?.[currentIndex];
      const isLive = room.status === "question";
      const locked = !isLive || !!answered || this.pendingAnswer !== null;

      $("#player-category").textContent = q.category || "General";
      $("#player-question-number").textContent = `${currentIndex + 1} / ${questions.length}`;
      $("#player-question").textContent = q.question;
      $("#player-timer").textContent = timerText(room);

      // Render answer options as radio inputs wrapped in <label>s.
      // Tapping the radio or the label triggers a `change` event which our
      // delegated listener on #player-options handles. We disable the radio
      // itself when the question is locked (waiting for host, already
      // answered, etc.) so the OS-native radio behaves correctly.
      const wrap = $("#player-options");
      wrap.toggleAttribute("data-locked", locked);
      wrap.innerHTML = q.options.map((option, index) => {
        const selected = (answered && answered.answer === index) ||
                         (this.pendingAnswer === index);
        const correct = room.showAnswer && index === q.correctAnswer;
        const wrong = room.showAnswer && selected && index !== q.correctAnswer;
        const cls = [
          "option",
          selected ? "selected" : "",
          correct  ? "correct"  : "",
          wrong    ? "wrong"    : "",
          locked && !answered && !correct && !wrong ? "is-waiting" : ""
        ].filter(Boolean).join(" ");
        const radioId = `opt-${currentIndex}-${index}`;
        const checkedAttr  = selected ? "checked" : "";
        const disabledAttr = locked   ? "disabled" : "";
        return `
          <label class="${cls}" for="${radioId}">
            <input
              type="radio"
              id="${radioId}"
              name="player-answer"
              value="${index}"
              ${checkedAttr}
              ${disabledAttr}
            />
            <span class="letter">${optionLetter(index)}</span>
            <span class="text">${escapeHtml(option)}</span>
          </label>
        `;
      }).join("");

      // Make the "waiting for host" state visually unmistakable on the card.
      const card = $("#answer-card");
      if (card) card.classList.toggle("is-waiting", !isLive && !answered);

      $("#player-message").textContent = messageForPlayer(room, answered);
    },

    renderPlayerScore(room) {
      const questions = room.questions || [];
      const scores = scorePlayers(room.players || {}, questions);
      const mine = scores.find(row => row.id === this.id);
      $("#player-score").textContent = mine ? `${mine.score} point${mine.score === 1 ? "" : "s"}` : "0 points";
      $("#player-rank").textContent = mine ? `Rank ${scores.findIndex(row => row.id === this.id) + 1}` : "Rank -";
    }
  };

  function reportHostError(action) {
    return function (err) {
      console.error(`${action} failed:`, err);
      const msg = err && err.message ? err.message : String(err);
      alert(`${action} failed: ${msg}\n\n` +
            "Check your Firebase Realtime Database rules. For testing you " +
            "can use { \".read\": true, \".write\": true }.");
    };
  }

  function statusText(status) {
    if (status === "question") return "Question live";
    if (status === "review") return "Reviewing answer";
    if (status === "ended") return "Game ended";
    return "Lobby";
  }

  function answerCount(players, index) {
    return Object.values(players || {}).filter(player =>
      player.answers && player.answers[index]
    ).length;
  }

  function timerText(room) {
    if (!room || room.status !== "question" || !room.questionEndsAt) return "--";
    const left = Math.max(0, Math.ceil((room.questionEndsAt - now()) / 1000));
    return `${left}s`;
  }

  function messageForPlayer(room, answered) {
    if (room.status === "ended") return "Quiz ended. Check your score.";
    if (room.status === "review") return "Answer shown on the host screen.";
    if (answered) return "Answer submitted. Wait for the host.";
    if (room.status === "question") return "Choose your answer.";
    return "Wait for the host to start the question.";
  }

  function joinUrl() {
    return `${location.origin}/join.html?room=${encodeURIComponent(ROOM_ID)}`;
  }

  function qrUrl(url) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
  }

  window.DCSLiveQuiz = {
    host,
    player
  };
})();
