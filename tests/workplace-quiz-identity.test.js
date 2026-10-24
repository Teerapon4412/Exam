const { test } = require("node:test");
const assert = require("node:assert/strict");
const { quizIdentity } = require("../workplace-quiz-identity");
test("quiz identity keeps legacy defaults compatible and detects graded content changes", () => {
  const original = [
    { text: "Question", choices: ["A", "B", "C", "D"], answer: 0 },
  ];
  assert.equal(
    quizIdentity(original),
    quizIdentity([{ ...original[0], score: 1, imageUrl: "" }]),
  );
  for (const edit of [
    { answer: 1 },
    { score: 2 },
    { text: "Changed" },
    { choices: ["B", "A", "C", "D"] },
    { imageUrl: "https://example.com/new.png" },
  ])
    assert.notEqual(
      quizIdentity(original),
      quizIdentity([{ ...original[0], ...edit }]),
    );
});
