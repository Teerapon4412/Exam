const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  GROUPS,
  validateConfig,
  scoreMetrics,
} = require("../workplace-scoring");
function fixture() {
  return {
    groups: GROUPS.map((group, index) => ({
      key: group.key,
      weight: index + 1,
      metrics: Object.fromEntries(
        group.metrics.map((key) => [
          key,
          key.endsWith("Percent") ? [50, 75, 90] : [5, 2, 0],
        ]),
      ),
    })),
    quizzes: {
      preparation: [{ text: "Q", choices: ["a", "b", "c", "d"], answer: 0 }],
      response: [{ text: "Q", choices: ["a", "b", "c", "d"], answer: 1 }],
    },
  };
}
test("threshold boundaries, weakest metric, weighted score and no repeated exam inflation", () => {
  const config = validateConfig(fixture());
  const rows = scoreMetrics(config, {
    preparationPercent: 75,
    outputPercent: 100,
    overCut: 0,
    undercut: 3,
    outFlow: 0,
    nc: 2,
    car: 8,
    responsePercent: 90,
  });
  assert.deepEqual(
    rows.map((row) => row.score),
    [3, 2, 1, 4],
  );
  assert.equal(
    rows.reduce((sum, row) => sum + row.score * row.weight, 0),
    26,
  );
  assert.equal(
    rows.reduce((sum, row) => sum + 4 * row.weight, 0),
    40,
  );
});
test("rejects missing evidence, negative counts and fractional counts", () => {
  const config = validateConfig(fixture());
  for (const bad of [
    {},
    { preparationPercent: -1 },
    { preparationPercent: 1, outputPercent: 100, overCut: 0.5 },
  ])
    assert.throws(() => scoreMetrics(config, bad));
});
test("rejects ambiguous thresholds, absent quiz, invalid weight and invalid answer", () => {
  let f = fixture();
  f.groups[0].metrics.preparationPercent = [50, 50, 90];
  assert.throws(() => validateConfig(f));
  f = fixture();
  f.groups[2].metrics.nc = [0, 2, 5];
  assert.throws(() => validateConfig(f));
  f = fixture();
  f.groups[1].weight = 0;
  assert.throws(() => validateConfig(f));
  f = fixture();
  f.quizzes.response = [];
  assert.throws(() => validateConfig(f));
  f = fixture();
  f.quizzes.response[0].answer = 5;
  assert.throws(() => validateConfig(f));
});
module.exports = { fixture };
