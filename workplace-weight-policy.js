"use strict";
const { STANDARD_WEIGHTS } = require("./workplace-scoring");
const POLICY = "workplace-standard-weights-4-3-4-4-v1";
function applyStandardWorkplaceWeights(db, writeAudit) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS workplace_schema_migrations (key TEXT PRIMARY KEY,applied_at TEXT NOT NULL)",
  );
  if (
    db
      .prepare("SELECT key FROM workplace_schema_migrations WHERE key=?")
      .get(POLICY)
  )
    return;
  const actor = { user: { employee_code: "SYSTEM_WEIGHT_STANDARD" } };
  db.transaction(() => {
    const config = db
      .prepare(
        "SELECT * FROM workplace_configs WHERE exam_id='__WORKPLACE_ALL__'",
      )
      .get();
    if (config) {
      const before = JSON.parse(config.payload),
        after = {
          ...before,
          groups: before.groups.map((group) => ({
            ...group,
            weight: STANDARD_WEIGHTS[group.key] ?? group.weight,
          })),
        };
      db.prepare("UPDATE workplace_configs SET payload=? WHERE exam_id=?").run(
        JSON.stringify(after),
        config.exam_id,
      );
      writeAudit(
        actor,
        "update",
        "workplace_weight_policy",
        "quiz-defaults",
        before,
        after,
      );
    }
    const rules = db
      .prepare("SELECT * FROM workplace_manual_rules WHERE id=1")
      .get();
    if (rules) {
      const before = JSON.parse(rules.payload),
        after = {
          ...before,
          groups: before.groups.map((group) => ({
            ...group,
            weight: STANDARD_WEIGHTS[group.key] ?? group.weight,
          })),
        };
      db.prepare("UPDATE workplace_manual_rules SET payload=? WHERE id=1").run(
        JSON.stringify(after),
      );
      writeAudit(
        actor,
        "update",
        "workplace_weight_policy",
        "manual-defaults",
        before,
        after,
      );
    }
    for (const record of db
      .prepare("SELECT * FROM evaluations WHERE model_code='__WORKPLACE_ALL__'")
      .all()) {
      const rows = JSON.parse(record.rows_json);
      if (
        rows.length !== 4 ||
        new Set(rows.map((row) => row.key)).size !== 4 ||
        !rows.every(
          (row) =>
            Object.hasOwn(STANDARD_WEIGHTS, row.key) &&
            typeof row.score === "number" &&
            Number.isFinite(row.score) &&
            row.score >= 0 &&
            row.score <= 4,
        )
      )
        continue;
      const updated = rows.map((row) => ({
        ...row,
        weight: STANDARD_WEIGHTS[row.key],
      }));
      const totalScore = updated.reduce(
          (sum, row) => sum + row.score * row.weight,
          0,
        ),
        maxScore = 60;
      const evidence = db
        .prepare("SELECT * FROM workplace_evidence WHERE evaluation_id=?")
        .get(record.id);
      let snapshot = null;
      if (evidence) {
        const configSnapshot = JSON.parse(evidence.config_json),
          inputs = JSON.parse(evidence.evidence_json);
        snapshot = {
          ...evidence,
          config_json: JSON.stringify({
            ...configSnapshot,
            groups: configSnapshot.groups.map((group) => ({
              ...group,
              weight: STANDARD_WEIGHTS[group.key] ?? group.weight,
            })),
          }),
          evidence_json: JSON.stringify({
            ...inputs,
            evidence: {
              ...inputs.evidence,
              weightOverrides: {},
              weightPolicy: POLICY,
            },
          }),
        };
        db.prepare(
          "UPDATE workplace_evidence SET config_json=?,evidence_json=? WHERE evaluation_id=?",
        ).run(snapshot.config_json, snapshot.evidence_json, record.id);
      }
      db.prepare(
        "UPDATE evaluations SET rows_json=?,total_score=?,max_score=? WHERE id=?",
      ).run(JSON.stringify(updated), totalScore, maxScore, record.id);
      writeAudit(
        actor,
        "update",
        "workplace_weight_policy",
        record.id,
        { record, evidence },
        {
          record: {
            ...record,
            rows_json: JSON.stringify(updated),
            total_score: totalScore,
            max_score: maxScore,
          },
          evidence: snapshot,
        },
      );
    }
    db.prepare("INSERT INTO workplace_schema_migrations VALUES (?,?)").run(
      POLICY,
      new Date().toISOString(),
    );
  })();
}
module.exports = { applyStandardWorkplaceWeights, POLICY };
