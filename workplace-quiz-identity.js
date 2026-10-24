"use strict";
const crypto = require("node:crypto");
function quizIdentity(questions) {
  if (!Array.isArray(questions)) return "";
  const normalized = questions.map((q) => ({
    text: String(q.text || "").trim(),
    choices: (q.choices || []).map((c) => String(c).trim()),
    answer: q.answer,
    score: q.score ?? 1,
    imageUrl: String(q.imageUrl || "").trim(),
  }));
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");
}
module.exports = { quizIdentity };
