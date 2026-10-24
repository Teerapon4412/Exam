const { test } = require("node:test");
const assert = require("node:assert/strict");
const Database = require("better-sqlite3");
const {
  applyStandardWorkplaceWeights,
  POLICY,
} = require("../workplace-weight-policy");
const { STANDARD_WEIGHTS } = require("../workplace-scoring");
function fixture() {
  const db = new Database(":memory:");
  db.exec(
    "CREATE TABLE workplace_configs (exam_id TEXT PRIMARY KEY,payload TEXT,revision INTEGER);CREATE TABLE workplace_manual_rules (id INTEGER PRIMARY KEY,payload TEXT,revision INTEGER);CREATE TABLE evaluations (id TEXT PRIMARY KEY,model_code TEXT,rows_json TEXT,total_score REAL,max_score REAL);CREATE TABLE workplace_evidence(evaluation_id TEXT PRIMARY KEY,config_json TEXT,evidence_json TEXT)",
  );
  const keys = ["preparation", "quantity", "quality", "response"];
  const groups = keys.map((key, index) => ({ key, weight: index + 1 }));
  const config = {
    groups,
    quizzes: { preparation: [{ text: "unchanged" }] },
    revision: 7,
  };
  db.prepare("INSERT INTO workplace_configs VALUES (?,?,?)").run(
    "__WORKPLACE_ALL__",
    JSON.stringify(config),
    7,
  );
  db.prepare("INSERT INTO workplace_manual_rules VALUES (1,?,4)").run(
    JSON.stringify({ groups: groups.slice(1, 3) }),
  );
  for (const [id, scores] of [
    ["worker-a", [4, 3, 2, 4]],
    ["worker-b", [4, 4, 4, 4]],
  ]) {
    const rows = groups.map((g, i) => ({
      ...g,
      score: scores[i],
      evidence: { raw: 85 },
    }));
    db.prepare("INSERT INTO evaluations VALUES (?,?,?,?,?)").run(
      id,
      "__WORKPLACE_ALL__",
      JSON.stringify(rows),
      rows.reduce((n, r) => n + r.score * r.weight, 0),
      40,
    );
    db.prepare("INSERT INTO workplace_evidence VALUES (?,?,?)").run(
      id,
      JSON.stringify(config),
      JSON.stringify({
        period: "2026-10",
        evidence: { weightOverrides: { quality: 6 }, manualScoreRevision: 2 },
        attempts: { preparation: "quiz-result" },
      }),
    );
  }
  db.prepare("INSERT INTO evaluations VALUES (?,?,?,?,?)").run(
    "practical",
    "practical",
    "[]",
    18,
    20,
  );
  return db;
}
test("all saved overall assessments use 4/3/4/4, keep earned levels and source evidence, and record original values", () => {
  const db = fixture(),
    audits = [];
  try {
    applyStandardWorkplaceWeights(db, (...args) => audits.push(args));
    assert.deepEqual(STANDARD_WEIGHTS, {
      preparation: 4,
      quantity: 3,
      quality: 4,
      response: 4,
    });
    const first = db
      .prepare("SELECT * FROM evaluations WHERE id=?")
      .get("worker-a");
    assert.equal(first.total_score, 49);
    assert.equal(first.max_score, 60);
    assert.deepEqual(
      JSON.parse(first.rows_json).map((r) => r.score),
      [4, 3, 2, 4],
    );
    assert.deepEqual(
      JSON.parse(first.rows_json).map((r) => r.weight),
      [4, 3, 4, 4],
    );
    assert.equal(
      db
        .prepare("SELECT total_score FROM evaluations WHERE id=?")
        .get("worker-b").total_score,
      60,
    );
    assert.equal(
      db
        .prepare("SELECT total_score FROM evaluations WHERE id=?")
        .get("practical").total_score,
      18,
    );
    const config = db.prepare("SELECT * FROM workplace_configs").get();
    assert.equal(config.revision, 7);
    assert.deepEqual(
      JSON.parse(config.payload).groups.map((g) => g.weight),
      [4, 3, 4, 4],
    );
    const snapshot = JSON.parse(
      db
        .prepare(
          "SELECT evidence_json FROM workplace_evidence WHERE evaluation_id=?",
        )
        .get("worker-a").evidence_json,
    );
    assert.deepEqual(snapshot.evidence.weightOverrides, {});
    assert.equal(snapshot.evidence.manualScoreRevision, 2);
    assert.equal(snapshot.attempts.preparation, "quiz-result");
    assert.equal(snapshot.period, "2026-10");
    const audit = audits.find((args) => args[3] === "worker-a");
    assert.equal(audit[0].user.employee_code, "SYSTEM_WEIGHT_STANDARD");
    assert.equal(audit[4].record.total_score, 32);
    assert.equal(audit[5].record.total_score, 49);
    const count = audits.length;
    db.prepare("UPDATE evaluations SET total_score=55 WHERE id=?").run(
      "worker-a",
    );
    applyStandardWorkplaceWeights(db, (...args) => audits.push(args));
    assert.equal(audits.length, count);
    assert.equal(
      db
        .prepare("SELECT total_score FROM evaluations WHERE id=?")
        .get("worker-a").total_score,
      55,
    );
  } finally {
    db.close();
  }
});
test("weight migration is atomic if recording its audit fails", () => {
  const db = fixture();
  try {
    assert.throws(
      () =>
        applyStandardWorkplaceWeights(db, () => {
          throw new Error("audit unavailable");
        }),
      /audit unavailable/,
    );
    assert.equal(
      db
        .prepare("SELECT total_score FROM evaluations WHERE id=?")
        .get("worker-a").total_score,
      32,
    );
    assert.equal(
      db
        .prepare("SELECT * FROM workplace_schema_migrations WHERE key=?")
        .get(POLICY),
      undefined,
    );
  } finally {
    db.close();
  }
});
