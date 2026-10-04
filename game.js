(function attachStampShift(global) {
  "use strict";

  const PRACTICE_PHRASES = [
    { cue: "ba ba STAMP", beats: 4 },
    { cue: "doo doo STAMP", beats: 4 },
    { cue: "pa-ra STAMP", beats: 4 },
    { cue: "ready set STAMP", beats: 4 }
  ];

  const SCORED_PHRASES = [
    { cue: "ba ba STAMP", beats: 4 },
    { cue: "doo STAMP", beats: 3 },
    { cue: "pa-ra pa STAMP", beats: 4 },
    { cue: "ba ba STAMP", beats: 4 },
    { cue: "doo doo STAMP", beats: 4 },
    { cue: "ready set STAMP", beats: 4 },
    { cue: "pa-ra STAMP", beats: 3 },
    { cue: "ba ba ba STAMP", beats: 4 },
    { cue: "doo STAMP", beats: 3 },
    { cue: "ready set STAMP", beats: 4 },
    { cue: "pa-ra pa STAMP", beats: 4 },
    { cue: "ba ba STAMP", beats: 4 }
  ];

  const MODES = {
    READY: "Ready",
    PRACTICE: "Practice",
    SCORED: "Scored Run",
    RANK: "Rank"
  };

  function createGame(options) {
    const callbacks = options || {};
    return {
      mode: MODES.READY,
      phraseIndex: 0,
      phrases: [],
      lastJudgment: "-",
      rank: null,
      timer: null,
      onChange: callbacks.onChange || function noop() {},
      onCue: callbacks.onCue || function noop() {},
      onStamp: callbacks.onStamp || function noop() {},
      onRank: callbacks.onRank || function noop() {}
    };
  }

  function startPractice(game) {
    stopTimer(game);
    game.mode = MODES.PRACTICE;
    game.phrases = PRACTICE_PHRASES.slice();
    game.phraseIndex = 0;
    game.lastJudgment = "-";
    game.rank = null;
    game.onChange(game);
    playCurrentPhrase(game);
  }

  function startScoredRun(game) {
    stopTimer(game);
    game.mode = MODES.SCORED;
    game.phrases = SCORED_PHRASES.slice();
    game.phraseIndex = 0;
    game.lastJudgment = "-";
    game.onChange(game);
    playCurrentPhrase(game);
  }

  function restart(game) {
    startPractice(game);
  }

  function stamp(game) {
    if (game.mode !== MODES.PRACTICE && game.mode !== MODES.SCORED) {
      return;
    }

    game.lastJudgment = game.mode === MODES.PRACTICE ? "Good" : "Ace";
    game.onStamp(game.lastJudgment);
    game.onChange(game);
  }

  function playCurrentPhrase(game) {
    if (game.phraseIndex >= game.phrases.length) {
      if (game.mode === MODES.PRACTICE) {
        startScoredRun(game);
        return;
      }

      finishRun(game);
      return;
    }

    const phrase = game.phrases[game.phraseIndex];
    game.onCue(phrase);
    game.onChange(game);
    game.timer = global.setTimeout(function advancePhrase() {
      game.phraseIndex += 1;
      playCurrentPhrase(game);
    }, 1150);
  }

  function finishRun(game) {
    stopTimer(game);
    game.mode = MODES.RANK;
    game.rank = "Solid";
    game.onRank(game.rank);
    game.onChange(game);
  }

  function stopTimer(game) {
    if (game.timer) {
      global.clearTimeout(game.timer);
      game.timer = null;
    }
  }

  function bootDocument(doc) {
    const startPanel = doc.getElementById("startPanel");
    const rankPanel = doc.getElementById("rankPanel");
    const startButton = doc.getElementById("startButton");
    const restartButton = doc.getElementById("restartButton");
    const modeLabel = doc.getElementById("modeLabel");
    const phraseLabel = doc.getElementById("phraseLabel");
    const lastJudgment = doc.getElementById("lastJudgment");
    const cueBubble = doc.getElementById("cueBubble");
    const forms = doc.getElementById("forms");
    const worker = doc.getElementById("worker");
    const impactZone = doc.getElementById("impactZone");
    const impactText = doc.getElementById("impactText");
    const rankTitle = doc.getElementById("rankTitle");
    const rankSummary = doc.getElementById("rankSummary");

    const game = createGame({
      onChange: render,
      onCue: showCue,
      onStamp: showStamp,
      onRank: showRank
    });

    function render(state) {
      modeLabel.textContent = state.mode;
      phraseLabel.textContent = `${Math.min(state.phraseIndex + 1, state.phrases.length)}/${state.phrases.length}`;
      lastJudgment.textContent = state.lastJudgment;
      forms.classList.toggle("moving", state.mode === MODES.PRACTICE || state.mode === MODES.SCORED);
      startPanel.classList.toggle("hidden", state.mode !== MODES.READY);
      rankPanel.classList.toggle("hidden", state.mode !== MODES.RANK);
    }

    function showCue(phrase) {
      cueBubble.textContent = phrase.cue;
      cueBubble.classList.remove("active");
      void cueBubble.offsetWidth;
      cueBubble.classList.add("active");
    }

    function showStamp(judgment) {
      worker.classList.remove("stamping");
      void worker.offsetWidth;
      worker.classList.add("stamping");
      impactZone.className = `impact-zone ${judgment.toLowerCase()}`;
      impactText.textContent = judgment;
    }

    function showRank(rank) {
      rankTitle.textContent = rank;
      rankSummary.textContent = "You kept the forms moving. Tighten the beat for a Superb.";
    }

    function handlePrimaryAction(event) {
      if (event.type === "keydown" && event.code !== "Space") {
        return;
      }

      if (event.type === "keydown") {
        event.preventDefault();
      }

      stamp(game);
    }

    startButton.addEventListener("click", function start() {
      startPractice(game);
    });
    restartButton.addEventListener("click", function reset() {
      restart(game);
    });
    doc.addEventListener("keydown", handlePrimaryAction);
    doc.addEventListener("pointerdown", function pointerStamp(event) {
      if (event.target.closest("button")) {
        return;
      }
      handlePrimaryAction(event);
    });

    render(game);
    return game;
  }

  const api = {
    MODES,
    PRACTICE_PHRASES,
    SCORED_PHRASES,
    createGame,
    startPractice,
    startScoredRun,
    restart,
    stamp,
    bootDocument
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.StampShift = api;

  if (global.document) {
    global.document.addEventListener("DOMContentLoaded", function onReady() {
      bootDocument(global.document);
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
