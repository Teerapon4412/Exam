"use strict";
const crypto = require("node:crypto");
const {
  GROUPS,
  METRICS,
  validateConfig,
  scoreMetrics,
  check,
} = require("./workplace-scoring");
module.exports = function register({
  app,
  db,
  requireAuth,
  requireAdmin,
  getCurrentBankPayload,
  writeAdminAudit,
}) {
  db.exec(`CREATE TABLE IF NOT EXISTS workplace_configs (exam_id TEXT PRIMARY KEY, revision INTEGER NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS workplace_attempts (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,exam_id TEXT NOT NULL,kind TEXT NOT NULL,revision INTEGER NOT NULL,percent REAL NOT NULL,answers_json TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS workplace_attempt_lookup ON workplace_attempts(user_id,exam_id,kind,revision,created_at);
 CREATE TABLE IF NOT EXISTS workplace_evidence (evaluation_id TEXT PRIMARY KEY,config_json TEXT NOT NULL,evidence_json TEXT NOT NULL,updated_at TEXT NOT NULL);`);
  const examById = (id) =>
    (getCurrentBankPayload().examSets || []).find(
      (e) => String(e.id) === String(id),
    );
  const getConfig = (id) => {
    const row = db
      .prepare("SELECT * FROM workplace_configs WHERE exam_id=?")
      .get(id);
    return row ? { ...JSON.parse(row.payload), revision: row.revision } : null;
  };
  const route = (fn) => (req, res) => {
    try {
      return fn(req, res);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };
  app.get(
    "/api/workplace/config",
    requireAdmin,
    route((req, res) =>
      res.json({
        config: getConfig(String(req.query.examId || "")),
        groups: GROUPS,
        metrics: METRICS,
      }),
    ),
  );
  app.put(
    "/api/workplace/config",
    requireAdmin,
    route((req, res) => {
      const examId = String(req.body.examId || "");
      check(examById(examId), "ไม่พบ Model/Part");
      const config = validateConfig(req.body.config);
      const previous = getConfig(examId);
      const revision = (previous?.revision || 0) + 1;
      check(
        (req.body.revision || 0) === (previous?.revision || 0),
        "เกณฑ์ถูกแก้ไขแล้ว กรุณาโหลดใหม่",
      );
      db.transaction(() => {
        db.prepare(
          `INSERT INTO workplace_configs VALUES (?,?,?,?) ON CONFLICT(exam_id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload,updated_at=excluded.updated_at`,
        ).run(
          examId,
          revision,
          JSON.stringify(config),
          new Date().toISOString(),
        );
        writeAdminAudit(req, "update", "workplace_config", examId, previous, {
          ...config,
          revision,
        });
      })();
      res.json({ config: { ...config, revision } });
    }),
  );
  app.get(
    "/api/workplace/quizzes",
    requireAuth,
    route((req, res) => {
      const examId = String(req.query.examId || "");
      check(examById(examId), "ไม่พบ Model/Part");
      const config = getConfig(examId);
      check(config, "Admin ยังไม่ได้ตั้งค่าเกณฑ์และข้อสอบสำหรับ Part นี้");
      const quizzes = {};
      for (const kind of ["preparation", "response"])
        quizzes[kind] = config.quizzes[kind].map(({ text, choices }) => ({
          text,
          choices,
        }));
      res.json({ quizzes, revision: config.revision });
    }),
  );
  app.post(
    "/api/workplace/attempts",
    requireAuth,
    route((req, res) => {
      const examId = String(req.body.examId || "");
      const kind = req.body.kind;
      check(
        ["preparation", "response"].includes(kind),
        "ประเภทข้อสอบไม่ถูกต้อง",
      );
      const config = getConfig(examId);
      check(examById(examId) && config, "ยังไม่มีข้อสอบ");
      check(
        config.revision === req.body.revision,
        "ข้อสอบมีการเปลี่ยนแปลง กรุณาโหลดใหม่",
      );
      const questions = config.quizzes[kind];
      const answers = req.body.answers;
      check(
        Array.isArray(answers) &&
          answers.length === questions.length &&
          answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 3),
        "กรุณาตอบให้ครบทุกข้อ",
      );
      const correct = questions.filter(
        (q, i) => q.answer === answers[i],
      ).length;
      const percent = (correct / questions.length) * 100;
      const id = crypto.randomUUID();
      db.prepare("INSERT INTO workplace_attempts VALUES (?,?,?,?,?,?,?,?)").run(
        id,
        req.user.id,
        examId,
        kind,
        config.revision,
        percent,
        JSON.stringify(answers),
        new Date().toISOString(),
      );
      res.status(201).json({ id, percent, correct, total: questions.length });
    }),
  );
  function calculate(req) {
    const body = req.body;
    const examId = String(body.examId || "");
    const exam = examById(examId);
    const config = getConfig(examId);
    check(exam && config, "Admin ยังไม่ได้ตั้งค่า Part นี้");
    check(
      body.revision === config.revision,
      "เกณฑ์มีการเปลี่ยนแปลง กรุณาโหลดใหม่",
    );
    const employee = db
      .prepare("SELECT * FROM users WHERE employee_code=? AND is_active=1")
      .get(String(body.employeeCode || "").toUpperCase());
    check(employee, "ไม่พบพนักงานที่ใช้งาน");
    const inputs = {};
    const attempts = {};
    for (const kind of ["preparation", "response"]) {
      const attempt = db
        .prepare(
          "SELECT * FROM workplace_attempts WHERE user_id=? AND exam_id=? AND kind=? AND revision=? ORDER BY created_at DESC,rowid DESC LIMIT 1",
        )
        .get(employee.id, examId, kind, config.revision);
      check(
        attempt,
        "พนักงานยังไม่ได้ทำข้อสอบ" +
          (kind === "preparation" ? "เตรียมตัว" : "ติดตามปัญหา") +
          "ตามเกณฑ์ปัจจุบัน",
      );
      inputs[kind + "Percent"] = attempt.percent;
      attempts[kind] = attempt.id;
    }
    const evidence = body.evidence || {};
    for (const key of [
      "actual",
      "target",
      "overCut",
      "undercut",
      "outFlow",
      "nc",
      "car",
    ]) {
      check(
        typeof evidence[key] === "number" &&
          Number.isFinite(evidence[key]) &&
          evidence[key] >= 0,
        "กรอกข้อมูลให้ครบและไม่ติดลบ",
      );
      if (key !== "actual" && key !== "target")
        check(
          Number.isInteger(evidence[key]),
          "จำนวนเหตุการณ์ต้องเป็นจำนวนเต็ม",
        );
    }
    check(evidence.target > 0, "เป้าหมายงานต้องมากกว่า 0");
    inputs.outputPercent = (evidence.actual / evidence.target) * 100;
    for (const key of ["overCut", "undercut", "outFlow", "nc", "car"])
      inputs[key] = evidence[key];
    const rows = scoreMetrics(config, inputs);
    const totalScore = rows.reduce((s, r) => s + r.score * r.weight, 0);
    const maxScore = rows.reduce((s, r) => s + 4 * r.weight, 0);
    return {
      exam,
      config,
      employee,
      rows,
      totalScore,
      maxScore,
      percent: Math.round((totalScore / maxScore) * 10000) / 100,
      evidence,
      attempts,
    };
  }
  app.get(
    "/api/workplace/history",
    requireAdmin,
    route((req, res) => {
      const exam = examById(String(req.query.examId || ""));
      check(exam, "ไม่พบ Model/Part");
      const records = db
        .prepare(
          "SELECT e.*,w.config_json,w.evidence_json FROM evaluations e LEFT JOIN workplace_evidence w ON e.id=w.evaluation_id WHERE e.employee_code=? AND e.model_code=? AND e.part_code=? ORDER BY e.updated_at DESC",
        )
        .all(
          String(req.query.employeeCode || "").toUpperCase(),
          exam.modelCode,
          exam.partCode,
        );
      res.json({
        records: records.map((row) => ({
          id: row.id,
          updatedAt: row.updated_at,
          evaluator: row.evaluator,
          totalScore: row.total_score,
          maxScore: row.max_score,
          rows: JSON.parse(row.rows_json),
          config: row.config_json ? JSON.parse(row.config_json) : null,
          evidence: row.evidence_json ? JSON.parse(row.evidence_json) : null,
        })),
      });
    }),
  );
  app.post(
    "/api/workplace/preview",
    requireAdmin,
    route((req, res) => {
      const result = calculate(req);
      res.json({
        rows: result.rows,
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        percent: result.percent,
      });
    }),
  );
  app.post(
    "/api/workplace/evaluations",
    requireAdmin,
    route((req, res) => {
      const result = calculate(req);
      const {
        exam,
        config,
        employee,
        rows,
        totalScore,
        maxScore,
        evidence,
        attempts,
      } = result;
      const evaluator = String(req.body.evaluator || "").trim();
      check(evaluator, "กรุณากรอกผู้ประเมิน");
      const period = String(req.body.period || "").trim();
      check(
        /^\d{4}-(0[1-9]|1[0-2])$/.test(period),
        "กรุณาเลือกรอบประเมิน (เดือน)",
      );
      const latest = db
        .prepare(
          "SELECT * FROM exam_results WHERE user_id=? AND exam_id=? ORDER BY submitted_at DESC,id DESC LIMIT 1",
        )
        .get(employee.id, String(exam.id));
      const old = db
        .prepare(
          "SELECT * FROM evaluations WHERE employee_id=? AND model_code=? AND part_code=? ORDER BY updated_at DESC LIMIT 1",
        )
        .get(employee.id, exam.modelCode, exam.partCode);
      const id = old?.id || crypto.randomUUID(),
        now = new Date().toISOString();
      const record = {
        id,
        employee_id: employee.id,
        employee_code: employee.employee_code,
        employee_name: employee.full_name,
        evaluator,
        section_title: "ประเมินหน้างานอัตโนมัติ",
        model_code: exam.modelCode,
        model_name: exam.modelName || exam.modelCode,
        part_code: exam.partCode,
        part_name: exam.title || exam.partCode,
        exam_score: latest?.score || 0,
        exam_total_score: latest?.total_score || 0,
        exam_percent: latest?.percent || 0,
        exam_passed: latest?.passed ? 1 : 0,
        total_score: totalScore,
        max_score: maxScore,
        rows_json: JSON.stringify(rows),
        created_at: old?.created_at || now,
        updated_at: now,
      };
      const previousEvidence =
        db
          .prepare("SELECT * FROM workplace_evidence WHERE evaluation_id=?")
          .get(id) || null;
      db.transaction(() => {
        const columns = Object.keys(record);
        db.prepare(
          `INSERT INTO evaluations (${columns.join(",")}) VALUES (${columns.map((k) => "@" + k).join(",")}) ON CONFLICT(id) DO UPDATE SET ${columns
            .filter((k) => k !== "id" && k !== "created_at")
            .map((k) => `${k}=excluded.${k}`)
            .join(",")}`,
        ).run(record);
        db.prepare(
          `INSERT INTO workplace_evidence VALUES (?,?,?,?) ON CONFLICT(evaluation_id) DO UPDATE SET config_json=excluded.config_json,evidence_json=excluded.evidence_json,updated_at=excluded.updated_at`,
        ).run(
          id,
          JSON.stringify(config),
          JSON.stringify({ period, evidence, attempts }),
          now,
        );
        writeAdminAudit(
          req,
          "update",
          "workplace_evaluation",
          id,
          old ? { record: old, snapshot: previousEvidence } : null,
          { record, config, evidence: { period, evidence, attempts } },
        );
      })();
      res
        .status(201)
        .json({ id, rows, totalScore, maxScore, percent: result.percent });
    }),
  );
};
