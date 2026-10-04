const assert = require("node:assert/strict");
const test = require("node:test");
const {
  BEST_RANK_KEY,
  calculateRank,
  calculateScore,
  judgeOffset,
  updateBestRank
} = require("../game.js");

test("judgeOffset classifies strict rhythm windows", () => {
  assert.equal(judgeOffset(0), "Ace");
  assert.equal(judgeOffset(55), "Ace");
  assert.equal(judgeOffset(-100), "Good");
  assert.equal(judgeOffset(-150), "Early");
  assert.equal(judgeOffset(150), "Late");
  assert.equal(judgeOffset(240), "Miss");
});

test("calculateScore weights judgments without flattening near hits", () => {
  assert.deepEqual(calculateScore(["Ace", "Good", "Early", "Late", "Miss"]), {
    total: 7,
    max: 15,
    percent: 47
  });
});

test("calculateRank maps weighted score to accepted ranks", () => {
  assert.equal(calculateRank(["Miss", "Miss", "Early"]), "Try Again");
  assert.equal(calculateRank(["Good", "Early", "Miss"]), "Almost");
  assert.equal(calculateRank(["Good", "Good", "Good"]), "Solid");
  assert.equal(calculateRank(["Ace", "Ace", "Good"]), "Superb");
});

test("updateBestRank keeps the strongest local rank", () => {
  const writes = new Map();
  const storage = {
    setItem(key, value) {
      writes.set(key, value);
    }
  };

  assert.equal(updateBestRank(storage, "Solid", "Almost"), "Solid");
  assert.equal(writes.get(BEST_RANK_KEY), "Solid");
  assert.equal(updateBestRank(storage, "Solid", "Superb"), "Superb");
  assert.equal(writes.get(BEST_RANK_KEY), "Superb");
});
