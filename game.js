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

  const TIMING_WINDOWS = {
    ace: 55,
    good: 110,
    near: 180
  };

  const JUDGMENT_WEIGHT = {
    Ace: 3,
    Good: 2,
    Early: 1,
    Late: 1,
    Miss: 0
  };

  const RANKS = ["Try Again", "Almost", "Solid", "Superb"];
  const BEST_RANK_KEY = "stamp-shift-best-rank";

  function createGame(options) {
    const callbacks = options || {};
    return {
      mode: MODES.READY,
      phraseIndex: 0,
      phrases: [],
      expectedAt: null,
      judgedPhrase: false,
      judgments: [],
      lastJudgment: "-",
      rank: null,
      bestRank: readBestRank(callbacks.storage),
      storage: callbacks.storage || null,
      timer: null,
      audio: callbacks.audio || null,
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
    game.expectedAt = null;
    game.judgedPhrase = false;
    game.judgments = [];
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
    game.expectedAt = null;
    game.judgedPhrase = false;
    game.judgments = [];
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

    if (game.judgedPhrase) {
      return;
    }

    const now = currentTime(game);
    const judgment = judgeOffset(now - game.expectedAt);
    game.judgedPhrase = true;
    game.lastJudgment = judgment;
    if (game.mode === MODES.SCORED) {
      game.judgments.push(judgment);
    }
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
    game.expectedAt = currentTime(game) + 820;
    game.judgedPhrase = false;
    scheduleCueAudio(game, phrase);
    game.onCue(phrase);
    game.onChange(game);
    game.timer = global.setTimeout(function advancePhrase() {
      if (!game.judgedPhrase) {
        game.lastJudgment = "Miss";
        if (game.mode === MODES.SCORED) {
          game.judgments.push("Miss");
        }
        game.onStamp("Miss");
      }
      game.phraseIndex += 1;
      playCurrentPhrase(game);
    }, phrase.beats * 480);
  }

  function finishRun(game) {
    stopTimer(game);
    game.mode = MODES.RANK;
    game.rank = calculateRank(game.judgments);
    game.bestRank = updateBestRank(game.storage, game.bestRank, game.rank);
    game.onRank(game.rank);
    game.onChange(game);
  }

  function stopTimer(game) {
    if (game.timer) {
      global.clearTimeout(game.timer);
      game.timer = null;
    }
  }

  function judgeOffset(offsetMs) {
    const distance = Math.abs(offsetMs);
    if (distance <= TIMING_WINDOWS.ace) {
      return "Ace";
    }
    if (distance <= TIMING_WINDOWS.good) {
      return "Good";
    }
    if (distance <= TIMING_WINDOWS.near) {
      return offsetMs < 0 ? "Early" : "Late";
    }
    return "Miss";
  }

  function calculateScore(judgments) {
    const max = judgments.length * JUDGMENT_WEIGHT.Ace;
    const total = judgments.reduce(function sum(score, judgment) {
      return score + JUDGMENT_WEIGHT[judgment];
    }, 0);

    return {
      total,
      max,
      percent: max === 0 ? 0 : Math.round((total / max) * 100)
    };
  }

  function calculateRank(judgments) {
    const score = calculateScore(judgments);
    if (score.percent >= 89) {
      return "Superb";
    }
    if (score.percent >= 65) {
      return "Solid";
    }
    if (score.percent >= 30) {
      return "Almost";
    }
    return "Try Again";
  }

  function compareRanks(left, right) {
    return RANKS.indexOf(left) - RANKS.indexOf(right);
  }

  function readBestRank(storage) {
    if (!storage) {
      return null;
    }

    try {
      const rank = storage.getItem(BEST_RANK_KEY);
      return RANKS.includes(rank) ? rank : null;
    } catch (error) {
      return null;
    }
  }

  function updateBestRank(storage, currentBest, rank) {
    const best = currentBest && compareRanks(currentBest, rank) > 0 ? currentBest : rank;
    if (storage) {
      try {
        storage.setItem(BEST_RANK_KEY, best);
      } catch (error) {
        return best;
      }
    }
    return best;
  }

  function currentTime(game) {
    if (game.audio && typeof game.audio.now === "function") {
      return game.audio.now();
    }
    return global.performance && global.performance.now ? global.performance.now() : Date.now();
  }

  function scheduleCueAudio(game, phrase) {
    if (game.audio && typeof game.audio.cue === "function") {
      game.audio.cue(phrase);
    }
  }

  function bootDocument(doc) {
    let audio = null;
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
    const bestRankLabel = doc.getElementById("bestRank");

    const game = createGame({
      storage: global.localStorage,
      audio: {
        now: function now() {
          return audio ? audio.context.currentTime * 1000 : currentPerformanceTime();
        },
        cue: function cue(phrase) {
          if (audio) {
            playCue(audio, phrase);
          }
        }
      },
      onChange: render,
      onCue: showCue,
      onStamp: showStamp,
      onRank: showRank
    });

    function render(state) {
      modeLabel.textContent = state.mode;
      phraseLabel.textContent = `${Math.min(state.phraseIndex + 1, state.phrases.length)}/${state.phrases.length}`;
      lastJudgment.textContent = state.lastJudgment;
      bestRankLabel.textContent = state.bestRank || "-";
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
      const score = calculateScore(game.judgments);
      rankTitle.textContent = rank;
      rankSummary.textContent = `Weighted Score: ${score.percent}%. Best Rank: ${game.bestRank || rank}.`;
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
      audio = ensureAudio(audio);
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

  function currentPerformanceTime() {
    return global.performance && global.performance.now ? global.performance.now() : Date.now();
  }

  function ensureAudio(existing) {
    if (existing) {
      if (existing.context.state === "suspended") {
        existing.context.resume();
      }
      return existing;
    }

    const AudioContext = global.AudioContext || global.webkitAudioContext;
    if (!AudioContext) {
      return null;
    }

    const context = new AudioContext();
    return { context };
  }

  function playTone(audio, at, frequency, duration, type) {
    const oscillator = audio.context.createOscillator();
    const gain = audio.context.createGain();
    oscillator.type = type || "square";
    oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.12, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain);
    gain.connect(audio.context.destination);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.025);
  }

  function playCue(audio, phrase) {
    const now = audio.context.currentTime;
    const step = 0.18;
    const syllables = phrase.cue.split(" ");
    syllables.forEach(function scheduleSyllable(syllable, index) {
      const isStamp = syllable.toUpperCase().includes("STAMP");
      playTone(audio, now + index * step, isStamp ? 440 : 280 + index * 40, isStamp ? 0.12 : 0.08, isStamp ? "triangle" : "square");
    });
    playTone(audio, now + 0.82, 135, 0.05, "sawtooth");
  }

  const api = {
    MODES,
    TIMING_WINDOWS,
    JUDGMENT_WEIGHT,
    RANKS,
    BEST_RANK_KEY,
    PRACTICE_PHRASES,
    SCORED_PHRASES,
    createGame,
    startPractice,
    startScoredRun,
    restart,
    stamp,
    judgeOffset,
    calculateScore,
    calculateRank,
    updateBestRank,
    ensureAudio,
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
