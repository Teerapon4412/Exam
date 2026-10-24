"use strict";
const crypto = require("node:crypto");
const { quizIdentity } = require("./workplace-quiz-identity");
const {
  GROUPS,
  METRICS,
  validateConfig,
  validateManualRules,
  scoreMetrics,
  check,
} = require("./workplace-scoring");
module.exports = function register({
  app,
  db,
  requireAuth,
  requireAdmin,
  writeAdminAudit,
}) {
  db.exec(`CREATE TABLE IF NOT EXISTS workplace_configs (exam_id TEXT PRIMARY KEY, revision INTEGER NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS workplace_attempts (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,exam_id TEXT NOT NULL,kind TEXT NOT NULL,revision INTEGER NOT NULL,percent REAL NOT NULL,answers_json TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS workplace_attempt_lookup ON workplace_attempts(user_id,exam_id,kind,revision,created_at);
 CREATE TABLE IF NOT EXISTS workplace_evidence (evaluation_id TEXT PRIMARY KEY,config_json TEXT NOT NULL,evidence_json TEXT NOT NULL,updated_at TEXT NOT NULL);`);
  const columns = db.pragma("table_info(workplace_attempts)");
  if (!columns.some((column) => column.name === "period"))
    db.exec(
      "ALTER TABLE workplace_attempts ADD COLUMN period TEXT NOT NULL DEFAULT ''",
    );
  if (
    !db
      .pragma("table_info(evaluations)")
      .some((column) => column.name === "period")
  )
    db.exec(
      "ALTER TABLE evaluations ADD COLUMN period TEXT NOT NULL DEFAULT ''",
    );
  db.exec(
    `CREATE TABLE IF NOT EXISTS workplace_manual_rules (id INTEGER PRIMARY KEY CHECK(id=1),payload TEXT NOT NULL,revision INTEGER NOT NULL);`,
  );
  db.exec(
    "UPDATE evaluations SET period=COALESCE((SELECT json_extract(evidence_json,'$.period') FROM workplace_evidence WHERE evaluation_id=evaluations.id),'') WHERE period=''",
  );
  db.exec(
    "CREATE INDEX IF NOT EXISTS workplace_attempt_period_lookup ON workplace_attempts(user_id,exam_id,kind,revision,period,created_at); CREATE INDEX IF NOT EXISTS workplace_evaluation_period_lookup ON evaluations(employee_id,model_code,period)",
  );
  const validPeriod = (period) =>
    typeof period === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
  const getManualRules = () => {
    const row = db
      .prepare("SELECT * FROM workplace_manual_rules WHERE id=1")
      .get();
    return row ? { ...JSON.parse(row.payload), revision: row.revision } : null;
  };
  app.get("/api/workplace/manual-rules", requireAdmin, (req, res) =>
    res.json({ rules: getManualRules() }),
  );
  app.put("/api/workplace/manual-rules", requireAdmin, (req, res) => {
    try {
      const rules = validateManualRules(req.body.rules),
        old = getManualRules();
      if (req.body.revision !== (old?.revision || 0))
        return res
          .status(409)
          .json({ error: "เกณฑ์คะแนนดิบถูกแก้ไขแล้ว กรุณาโหลดใหม่" });
      const revision = (old?.revision || 0) + 1;
      db.transaction(() => {
        db.prepare(
          "INSERT INTO workplace_manual_rules VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,revision=excluded.revision",
        ).run(JSON.stringify(rules), revision);
        writeAdminAudit(req, "update", "workplace_manual_rules", "1", old, {
          ...rules,
          revision,
        });
      })();
      res.json({ rules: { ...rules, revision } });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  const GLOBAL_ID = "__WORKPLACE_ALL__";
  const globalExam = {
    id: GLOBAL_ID,
    modelCode: GLOBAL_ID,
    modelName: "ประเมินหน้างานรวม",
    partCode: GLOBAL_ID,
    title: "ประเมินหน้างานรวมรายพนักงาน",
  };
  const getConfig = (id) => {
    const row = db
      .prepare("SELECT * FROM workplace_configs WHERE exam_id=?")
      .get(id);
    return row ? { ...JSON.parse(row.payload), revision: row.revision } : null;
  };
  // Criteria revisions and question content are different: only changed questions require retakes.
  if (
    !db
      .pragma("table_info(workplace_attempts)")
      .some((column) => column.name === "quiz_hash")
  )
    db.exec(
      "ALTER TABLE workplace_attempts ADD COLUMN quiz_hash TEXT NOT NULL DEFAULT ''",
    );
  db.exec(
    "CREATE TABLE IF NOT EXISTS workplace_quiz_versions (revision INTEGER PRIMARY KEY,payload TEXT NOT NULL); CREATE INDEX IF NOT EXISTS workplace_compatible_quiz_lookup ON workplace_attempts(user_id,exam_id,kind,period,quiz_hash,created_at)",
  );
  function rememberVersion(config) {
    if (config && Number.isInteger(config.revision) && config.quizzes)
      db.prepare(
        "INSERT OR IGNORE INTO workplace_quiz_versions VALUES (?,?)",
      ).run(config.revision, JSON.stringify(config));
  }
  for (const log of db
    .prepare(
      "SELECT before_json,after_json FROM admin_audit_log WHERE entity_type='workplace_config' AND entity_id=? ORDER BY id",
    )
    .all(GLOBAL_ID))
    for (const value of [log.before_json, log.after_json]) {
      try {
        rememberVersion(JSON.parse(value));
      } catch {}
    }
  rememberVersion(getConfig(GLOBAL_ID));
  for (const row of db.prepare("SELECT * FROM workplace_quiz_versions").all()) {
    const saved = JSON.parse(row.payload);
    for (const kind of ["preparation", "response"])
      if (saved.quizzes?.[kind])
        db.prepare(
          "UPDATE workplace_attempts SET quiz_hash=? WHERE exam_id=? AND revision=? AND kind=? AND quiz_hash=''",
        ).run(quizIdentity(saved.quizzes[kind]), GLOBAL_ID, row.revision, kind);
  }
  const quizHashes = new Map();
  function configQuizHash(config, kind) {
    const key = config.revision + ":" + kind;
    if (!quizHashes.has(key))
      quizHashes.set(key, quizIdentity(config.quizzes[kind]));
    return quizHashes.get(key);
  }
  function compatibleAttempt(userId, kind, period, config) {
    // Recover only versions proven by saved configuration/audit evidence; never guess a period.
    for (const row of db
      .prepare(
        "SELECT DISTINCT revision FROM workplace_attempts WHERE user_id=? AND exam_id=? AND kind=? AND period=? AND quiz_hash=''",
      )
      .all(userId, GLOBAL_ID, kind, period)) {
      const version = db
        .prepare("SELECT payload FROM workplace_quiz_versions WHERE revision=?")
        .get(row.revision);
      if (version) {
        const saved = JSON.parse(version.payload);
        if (saved.quizzes?.[kind])
          db.prepare(
            "UPDATE workplace_attempts SET quiz_hash=? WHERE user_id=? AND exam_id=? AND kind=? AND period=? AND revision=? AND quiz_hash=''",
          ).run(
            quizIdentity(saved.quizzes[kind]),
            userId,
            GLOBAL_ID,
            kind,
            period,
            row.revision,
          );
      }
    }
    return db
      .prepare(
        "SELECT * FROM workplace_attempts WHERE user_id=? AND exam_id=? AND kind=? AND period=? AND quiz_hash=? ORDER BY created_at DESC,rowid DESC LIMIT 1",
      )
      .get(userId, GLOBAL_ID, kind, period, configQuizHash(config, kind));
  }
  function missingQuizMessage(employee, kind, period) {
    const title =
      kind === "preparation" ? "ข้อสอบเตรียมตัว" : "ข้อสอบติดตามปัญหา";
    const latest = db
      .prepare(
        "SELECT * FROM workplace_attempts WHERE user_id=? AND exam_id=? AND kind=? ORDER BY created_at DESC,rowid DESC LIMIT 1",
      )
      .get(employee.id, GLOBAL_ID, kind);
    const prefix = employee.employee_code + " · งวด " + period + ": ";
    const samePeriod = db
      .prepare(
        "SELECT * FROM workplace_attempts WHERE user_id=? AND exam_id=? AND kind=? AND period=? ORDER BY created_at DESC,rowid DESC LIMIT 1",
      )
      .get(employee.id, GLOBAL_ID, kind, period);
    if (samePeriod)
      return (
        prefix +
        (samePeriod.quiz_hash
          ? "พบผล" +
            title +
            "แล้ว แต่เนื้อหาหรือเฉลยของชุดนี้เปลี่ยน กรุณาทำชุดปัจจุบันใหม่"
          : "พบผล" +
            title +
            "เก่า แต่ยังยืนยันชุดคำถามเดิมไม่ได้ กรุณาทำชุดปัจจุบันใหม่")
      );
    if (latest)
      return (
        prefix +
        (latest.period
          ? "ยังไม่มีผล" +
            title +
            "ในงวดนี้ พบผลล่าสุดงวด " +
            latest.period +
            " กรุณาเลือกงวดให้ตรงกัน"
          : "พบผล" + title + "เดิมที่ไม่ระบุงวด กรุณาทำข้อสอบในงวดที่เลือก")
      );
    return (
      prefix + "ยังไม่พบผล" + title + " กรุณาทำข้อสอบด้วยบัญชีของพนักงานคนนี้"
    );
  }
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
        config: getConfig(GLOBAL_ID),
        groups: GROUPS.filter((group) =>
          ["preparation", "response"].includes(group.key),
        ),
        metrics: METRICS,
      }),
    ),
  );
  app.put(
    "/api/workplace/config",
    requireAdmin,
    route((req, res) => {
      const examId = GLOBAL_ID;
      const previous = getConfig(examId);
      const incoming = req.body.config;
      const preserved = (previous?.groups || []).filter(
        (group) =>
          ["quantity", "quality"].includes(group.key) &&
          !incoming?.groups?.some((candidate) => candidate.key === group.key),
      );
      const config = validateConfig({
        ...incoming,
        groups: Array.isArray(incoming?.groups)
          ? [...incoming.groups, ...preserved]
          : incoming?.groups,
      });
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
        rememberVersion({ ...config, revision });
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
      const examId = GLOBAL_ID;
      const config = getConfig(examId);
      check(config, "Admin ยังไม่ได้ตั้งค่าเกณฑ์และข้อสอบรวม");
      const quizzes = {};
      for (const kind of ["preparation", "response"])
        quizzes[kind] = config.quizzes[kind].map(
          ({ text, choices, score = 1, imageUrl = "" }) => ({
            text,
            choices,
            score,
            imageUrl,
          }),
        );
      res.json({ quizzes, revision: config.revision });
    }),
  );
  app.post(
    "/api/workplace/attempts",
    requireAuth,
    route((req, res) => {
      const examId = GLOBAL_ID;
      const kind = req.body.kind;
      check(
        ["preparation", "response"].includes(kind),
        "ประเภทข้อสอบไม่ถูกต้อง",
      );
      const config = getConfig(examId);
      check(config, "ยังไม่มีข้อสอบ");
      const started = db
        .prepare("SELECT payload FROM workplace_quiz_versions WHERE revision=?")
        .get(Number.isInteger(req.body.revision) ? req.body.revision : -1);
      check(
        started &&
          quizIdentity(JSON.parse(started.payload).quizzes[kind]) ===
            configQuizHash(config, kind),
        "คำถามหรือเฉลยมีการเปลี่ยนแปลง กรุณาโหลดข้อสอบชุดปัจจุบันใหม่",
      );
      check(validPeriod(req.body.period), "กรุณาเลือกงวดประเมินก่อนทำข้อสอบ");
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
      const score = questions.reduce(
        (sum, q, index) =>
          sum + (q.answer === answers[index] ? (q.score ?? 1) : 0),
        0,
      );
      const totalScore = questions.reduce((sum, q) => sum + (q.score ?? 1), 0);
      const percent = (score / totalScore) * 100;
      const id = crypto.randomUUID();
      db.prepare(
        "INSERT INTO workplace_attempts (id,user_id,exam_id,kind,revision,percent,answers_json,created_at,period,quiz_hash) VALUES (?,?,?,?,?,?,?,?,?,?)",
      ).run(
        id,
        req.user.id,
        examId,
        kind,
        config.revision,
        percent,
        JSON.stringify(answers),
        new Date().toISOString(),
        req.body.period,
        configQuizHash(config, kind),
      );
      res.status(201).json({
        id,
        percent,
        correct,
        total: questions.length,
        score,
        totalScore,
      });
    }),
  );
  function calculate(req) {
    const body = req.body;
    const examId = GLOBAL_ID;
    const exam = globalExam;
    const config = getConfig(examId);
    check(config, "Admin ยังไม่ได้ตั้งค่าเกณฑ์รวม");
    check(
      body.revision === config.revision,
      "เกณฑ์มีการเปลี่ยนแปลง กรุณาโหลดใหม่",
    );
    const employee = db
      .prepare("SELECT * FROM users WHERE employee_code=? AND is_active=1")
      .get(String(body.employeeCode || "").toUpperCase());
    check(employee, "ไม่พบพนักงานที่ใช้งาน");
    check(validPeriod(body.period), "กรุณาเลือกงวดประเมิน");
    const manual = db
      .prepare(
        "SELECT * FROM workplace_manual_scores WHERE employee_id=? AND period=?",
      )
      .get(employee.id, body.period);
    check(manual, "ยังไม่มีคะแนนปริมาณงานและคุณภาพงานในงวดนี้");
    const manualRules = getManualRules();
    check(manualRules, "Admin ยังไม่ได้ตั้งเกณฑ์แปลงคะแนนดิบข้อ 2–3");
    const inputs = {};
    const attempts = {};
    for (const kind of ["preparation", "response"]) {
      const attempt = compatibleAttempt(employee.id, kind, body.period, config);
      check(attempt, missingQuizMessage(employee, kind, body.period));
      inputs[kind + "Percent"] = attempt.percent;
      attempts[kind] = attempt.id;
    }
    inputs.quantityRaw = manual.quantity;
    inputs.qualityRaw = manual.quality;
    const normalizedGroups = [
      config.groups.find((group) => group.key === "preparation"),
      manualRules.groups.find((group) => group.key === "quantity"),
      manualRules.groups.find((group) => group.key === "quality"),
      config.groups.find((group) => group.key === "response"),
    ];
    let weightOverrides = body.weights;
    if (weightOverrides === undefined || weightOverrides === null) {
      const stored = db
        .prepare(
          "SELECT w.evidence_json FROM evaluations e JOIN workplace_evidence w ON e.id=w.evaluation_id WHERE e.employee_id=? AND e.model_code=? AND e.period=? ORDER BY e.updated_at DESC LIMIT 1",
        )
        .get(employee.id, GLOBAL_ID, body.period);
      weightOverrides = stored
        ? JSON.parse(stored.evidence_json).evidence?.weightOverrides || {}
        : {};
    }
    check(
      weightOverrides &&
        typeof weightOverrides === "object" &&
        !Array.isArray(weightOverrides),
      "น้ำหนักต้องเป็นข้อมูลรายหัวข้อ",
    );
    for (const [key, weight] of Object.entries(weightOverrides))
      check(
        ["preparation", "quantity", "quality", "response"].includes(key) &&
          typeof weight === "number" &&
          Number.isFinite(weight) &&
          weight > 0 &&
          weight <= 100,
        "น้ำหนักรายหัวข้อต้องมากกว่า 0 และไม่เกิน 100",
      );
    const effectiveGroups = normalizedGroups.map((group) => ({
      ...group,
      weight: weightOverrides[group.key] ?? group.weight,
    }));
    const combinedConfig = {
      ...config,
      groups: effectiveGroups,
      manualRevision: manualRules.revision,
    };
    const evidence = {
      quantityRaw: manual.quantity,
      qualityRaw: manual.quality,
      manualScoreRevision: manual.revision,
      manualRulesRevision: manualRules.revision,
      weightOverrides,
    };
    const rows = scoreMetrics(combinedConfig, inputs);
    const totalScore = rows.reduce((s, r) => s + r.score * r.weight, 0);
    const maxScore = rows.reduce((s, r) => s + 4 * r.weight, 0);
    return {
      exam,
      config: combinedConfig,
      employee,
      rows,
      totalScore,
      maxScore,
      percent: Math.round((totalScore / maxScore) * 10000) / 100,
      evidence,
      attempts,
      weightOverrides,
    };
  }
  app.get(
    "/api/workplace/overview",
    requireAuth,
    route((req, res) => {
      const period = String(req.query.period || "");
      check(validPeriod(period), "กรุณาเลือกงวดประเมิน");
      const config = getConfig(GLOBAL_ID),
        rules = getManualRules();
      const people =
        req.user.role === "admin"
          ? db
              .prepare(
                "SELECT * FROM users WHERE is_active=1 AND role<>'admin' ORDER BY full_name",
              )
              .all()
          : [req.user];
      const entries = people.map((employee) => {
        const quiz = {};
        for (const kind of ["preparation", "response"])
          quiz[kind] = config
            ? compatibleAttempt(employee.id, kind, period, config) || null
            : null;
        const manual =
          db
            .prepare(
              "SELECT quantity,quality,revision FROM workplace_manual_scores WHERE employee_id=? AND period=?",
            )
            .get(employee.id, period) || null;
        const saved = db
          .prepare(
            "SELECT e.*,w.evidence_json,w.config_json FROM evaluations e LEFT JOIN workplace_evidence w ON e.id=w.evaluation_id WHERE employee_id=? AND model_code=? AND e.period=? ORDER BY updated_at DESC LIMIT 1",
          )
          .get(employee.id, GLOBAL_ID, period);
        const ready = !!(quiz.preparation && quiz.response && manual && rules);
        let calculated = null;
        if (ready) {
          const value = calculate({
            body: {
              employeeCode: employee.employee_code,
              period,
              revision: config.revision,
            },
          });
          calculated = {
            rows: value.rows,
            percent: value.percent,
            totalScore: value.totalScore,
            maxScore: value.maxScore,
          };
        }
        let needsUpdate = false;
        if (saved) {
          const snapshot = JSON.parse(saved.evidence_json || "{}"),
            savedConfig = JSON.parse(saved.config_json || "{}");
          needsUpdate = !(
            config &&
            rules &&
            manual &&
            snapshot.attempts?.preparation === quiz.preparation?.id &&
            snapshot.attempts?.response === quiz.response?.id &&
            snapshot.evidence?.manualScoreRevision === manual.revision &&
            savedConfig.revision === config.revision &&
            savedConfig.manualRevision === rules.revision
          );
        }
        return {
          employeeCode: employee.employee_code,
          fullName: employee.full_name,
          quiz,
          manual,
          ready,
          calculated,
          saved: saved
            ? {
                percent: (saved.total_score / saved.max_score) * 100,
                updatedAt: saved.updated_at,
                needsUpdate,
              }
            : null,
        };
      });
      res.json({
        period,
        configReady: !!config,
        manualRulesReady: !!rules,
        entries,
      });
    }),
  );
  app.get(
    "/api/workplace/history",
    requireAdmin,
    route((req, res) => {
      const records = db
        .prepare(
          "SELECT e.*,w.config_json,w.evidence_json FROM evaluations e LEFT JOIN workplace_evidence w ON e.id=w.evaluation_id WHERE e.employee_code=? ORDER BY e.updated_at DESC",
        )
        .all(String(req.query.employeeCode || "").toUpperCase());
      res.json({
        records: records.map((row) => ({
          id: row.id,
          scope: row.model_code === GLOBAL_ID ? "overall" : "legacy",
          modelName: row.model_name,
          partCode: row.part_code,
          updatedAt: row.updated_at,
          period: row.period,
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
        weightOverrides: result.weightOverrides,
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
          "SELECT * FROM evaluations WHERE employee_id=? AND model_code=? AND part_code=? AND period=? ORDER BY updated_at DESC LIMIT 1",
        )
        .get(employee.id, exam.modelCode, exam.partCode, period);
      const id = old?.id || crypto.randomUUID(),
        now = new Date().toISOString();
      const record = {
        id,
        employee_id: employee.id,
        employee_code: employee.employee_code,
        employee_name: employee.full_name,
        evaluator,
        section_title: "ประเมินหน้างานอัตโนมัติ",
        period,
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
        .json({
          id,
          rows,
          totalScore,
          maxScore,
          percent: result.percent,
          weightOverrides: result.weightOverrides,
        });
    }),
  );
};
