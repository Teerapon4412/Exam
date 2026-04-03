const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "factory-exam.sqlite");
const DEFAULT_BANK_PATH = path.join(__dirname, "exam-data.json");
const EMPLOYEE_DATA_PATH = path.join(__dirname, "employees-data.json");
const AUTH_SECRET = process.env.AUTH_SECRET || "factory-exam-employee-auth";

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    password_hash TEXT,
    employee_code TEXT,
    full_name TEXT,
    department TEXT,
    position TEXT,
    photo_url TEXT,
    role TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exam_bank (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL,
    payload TEXT NOT NULL,
    source TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    employee_code TEXT,
    full_name TEXT,
    role TEXT NOT NULL,
    exam_id TEXT NOT NULL,
    exam_title TEXT NOT NULL,
    model_code TEXT NOT NULL,
    model_name TEXT NOT NULL,
    part_code TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    percent INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    passed INTEGER NOT NULL,
    submitted_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_code TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    evaluator TEXT NOT NULL,
    section_title TEXT NOT NULL,
    model_code TEXT NOT NULL,
    model_name TEXT NOT NULL,
    part_code TEXT NOT NULL,
    part_name TEXT NOT NULL,
    exam_score INTEGER NOT NULL DEFAULT 0,
    exam_total_score INTEGER NOT NULL DEFAULT 0,
    exam_percent INTEGER NOT NULL DEFAULT 0,
    exam_passed INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    rows_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function getColumnNames(tableName) {
  return db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .map((column) => column.name);
}

function ensureColumn(tableName, columnName, definition) {
  const columns = getColumnNames(tableName);
  if (!columns.includes(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  }
}

ensureColumn("users", "password_hash", "password_hash TEXT");
ensureColumn("users", "employee_code", "employee_code TEXT");
ensureColumn("users", "full_name", "full_name TEXT");
ensureColumn("users", "department", "department TEXT");
ensureColumn("users", "position", "position TEXT");
ensureColumn("users", "photo_url", "photo_url TEXT");
ensureColumn("users", "is_active", "is_active INTEGER NOT NULL DEFAULT 1");
ensureColumn("users", "updated_at", "updated_at TEXT");

ensureColumn("exam_results", "employee_code", "employee_code TEXT");
ensureColumn("exam_results", "full_name", "full_name TEXT");

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_employee_code ON users(employee_code);
  CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
  CREATE INDEX IF NOT EXISTS idx_evaluations_employee_code ON evaluations(employee_code);
`);

const getBank = db.prepare(`SELECT title, payload, source, updated_at FROM exam_bank WHERE id = 1`);
const upsertBank = db.prepare(`
  INSERT INTO exam_bank (id, title, payload, source, updated_at)
  VALUES (1, @title, @payload, @source, @updated_at)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    payload = excluded.payload,
    source = excluded.source,
    updated_at = excluded.updated_at
`);

const upsertEmployee = db.prepare(`
  INSERT INTO users (
    id, username, password, password_hash, employee_code, full_name, department,
    position, photo_url, role, is_active, created_at, updated_at
  ) VALUES (
    @id, @username, @password, @password_hash, @employee_code, @full_name, @department,
    @position, @photo_url, @role, @is_active, @created_at, @updated_at
  )
  ON CONFLICT(employee_code) DO UPDATE SET
    id = excluded.id,
    username = excluded.username,
    password = excluded.password,
    password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    department = excluded.department,
    position = excluded.position,
    photo_url = excluded.photo_url,
    role = excluded.role,
    is_active = excluded.is_active,
    updated_at = excluded.updated_at
`);

const getUserByEmployeeCode = db.prepare(`
  SELECT * FROM users
  WHERE employee_code = ?
`);

const insertResult = db.prepare(`
  INSERT INTO exam_results (
    user_id, username, employee_code, full_name, role, exam_id, exam_title, model_code, model_name, part_code,
    score, total_score, percent, correct_count, wrong_count, question_count, passed, submitted_at
  ) VALUES (
    @user_id, @username, @employee_code, @full_name, @role, @exam_id, @exam_title, @model_code, @model_name, @part_code,
    @score, @total_score, @percent, @correct_count, @wrong_count, @question_count, @passed, @submitted_at
  )
`);

const getResultsByUser = db.prepare(`
  SELECT * FROM exam_results
  WHERE user_id = ?
  ORDER BY submitted_at DESC
`);

const getAllResults = db.prepare(`
  SELECT * FROM exam_results
  ORDER BY submitted_at DESC
`);

const getActiveEmployees = db.prepare(`
  SELECT id, employee_code, full_name, department, position, photo_url, role, is_active
  FROM users
  WHERE is_active = 1
    AND COALESCE(employee_code, '') <> ''
    AND role <> 'admin'
  ORDER BY full_name COLLATE NOCASE ASC
`);

const getAllEvaluations = db.prepare(`
  SELECT *
  FROM evaluations
  ORDER BY updated_at DESC, created_at DESC
`);

const getLatestEvaluationByEmployeePart = db.prepare(`
  SELECT id, created_at
  FROM evaluations
  WHERE employee_id = ? AND part_code = ?
  ORDER BY updated_at DESC, created_at DESC
  LIMIT 1
`);

const insertEvaluation = db.prepare(`
  INSERT INTO evaluations (
    id, employee_id, employee_code, employee_name, evaluator, section_title,
    model_code, model_name, part_code, part_name,
    exam_score, exam_total_score, exam_percent, exam_passed,
    total_score, max_score, rows_json, created_at, updated_at
  ) VALUES (
    @id, @employee_id, @employee_code, @employee_name, @evaluator, @section_title,
    @model_code, @model_name, @part_code, @part_name,
    @exam_score, @exam_total_score, @exam_percent, @exam_passed,
    @total_score, @max_score, @rows_json, @created_at, @updated_at
  )
`);

const updateEvaluation = db.prepare(`
  UPDATE evaluations
  SET
    employee_code = @employee_code,
    employee_name = @employee_name,
    evaluator = @evaluator,
    section_title = @section_title,
    model_code = @model_code,
    model_name = @model_name,
    part_name = @part_name,
    exam_score = @exam_score,
    exam_total_score = @exam_total_score,
    exam_percent = @exam_percent,
    exam_passed = @exam_passed,
    total_score = @total_score,
    max_score = @max_score,
    rows_json = @rows_json,
    updated_at = @updated_at
  WHERE id = @id
`);

function randomId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function normalizeRole(role) {
  return String(role || "").trim().toUpperCase() === "ADMIN" ? "admin" : "student";
}

function normalizeEmployeeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function hashEmployeeCode(employeeCode) {
  const normalized = normalizeEmployeeCode(employeeCode);
  return crypto.scryptSync(normalized, `${AUTH_SECRET}:${normalized}`, 64).toString("hex");
}

function createAuthToken(user) {
  const payload = {
    sub: user.id,
    employeeCode: user.employee_code,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 12
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyAuthToken(token) {
  if (!token || !String(token).includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = String(token).split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload?.sub || !payload?.employeeCode || !payload?.role || Number(payload.exp) < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function compareHashes(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "hex");
  const rightBuffer = Buffer.from(String(right || ""), "hex");
  if (leftBuffer.length === 0 || rightBuffer.length === 0 || leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeEmployeeData(data) {
  const employees = Array.isArray(data?.employees) ? data.employees : [];
  return employees
    .map((employee) => {
      const employeeCode = normalizeEmployeeCode(employee.employeeCode || employee.username);
      if (!employeeCode) return null;

      const createdAt = employee.createdAt || new Date().toISOString();
      const updatedAt = employee.updatedAt || createdAt;

      return {
        id: String(employee.id || randomId("EMP")),
        username: employeeCode,
        password: "[HASHED]",
        password_hash: hashEmployeeCode(employeeCode),
        employee_code: employeeCode,
        full_name: String(employee.fullName || employee.username || employeeCode).trim(),
        department: String(employee.department || "").trim(),
        position: String(employee.position || "").trim(),
        photo_url: String(employee.photoUrl || "").trim(),
        role: normalizeRole(employee.role),
        is_active: employee.isActive === false ? 0 : 1,
        created_at: createdAt,
        updated_at: updatedAt
      };
    })
    .filter(Boolean);
}

function normalizeExamData(data) {
  if (data && Array.isArray(data.examSets)) {
    return {
      title: data.title || "Factory Online Exam",
      examSets: data.examSets.map((exam) => ({
        ...exam,
        description: String(exam.description || exam.modelName || "").trim(),
        durationMinutes: Number(exam.durationMinutes) || 10,
        passScore: Number(exam.passScore) || 0,
        randomizeQuestions: Boolean(exam.randomizeQuestions),
        showResultImmediately: exam.showResultImmediately !== false,
        questions: (exam.questions || []).map((question, index) => ({
          ...question,
          number: Number(question.number || question.questionNo || index + 1),
          text: String(question.text || question.questionText || "").trim(),
          imageUrl: question.imageUrl || null,
          choiceKeys: question.choiceKeys || ["A", "B", "C", "D"].slice(0, (question.choices || []).length),
          choices: Array.isArray(question.choices) ? question.choices.map((choice) => String(choice).trim()) : [],
          answer: Number(question.answer),
          score: Number(question.score) || 1
        }))
      }))
    };
  }

  if (data && Array.isArray(data.models)) {
    const examSets = [];

    data.models.forEach((model) => {
      (model.parts || []).forEach((part) => {
        const questions = (part.questions || []).map((question, index) => {
          const entries = Object.entries(question.choices || {}).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
          const choiceKeys = entries.map(([key]) => String(key).trim());
          const choices = entries.map(([, value]) => String(value).trim());
          const answerKey = String(question.correctAnswer || "").trim();

          return {
            id: question.id || `q-${index + 1}`,
            number: Number(question.questionNo || index + 1),
            text: String(question.questionText || "").trim(),
            imageUrl: question.imageUrl ? String(question.imageUrl).trim() : null,
            choiceKeys,
            choices,
            answer: choiceKeys.indexOf(answerKey),
            score: Number(question.score) || 1
          };
        });

        examSets.push({
          id: part.id || randomId("PART"),
          title: String(part.partName || "").trim(),
          description: String(part.subtitle || model.modelName || "").trim(),
          modelCode: String(model.modelCode || "").trim(),
          modelName: String(model.modelName || "").trim(),
          partCode: String(part.partCode || "").trim(),
          durationMinutes: Math.max(Math.ceil(questions.length * 1.5), 10),
          passScore: Number(part.passScore) || 0,
          randomizeQuestions: Boolean(part.randomizeQuestions),
          showResultImmediately: part.showResultImmediately !== false,
          questions
        });
      });
    });

    return {
      title: data.title || "Factory Online Exam",
      examSets
    };
  }

  throw new Error("Unsupported exam JSON structure");
}

function seedEmployees() {
  if (!fs.existsSync(EMPLOYEE_DATA_PATH)) {
    return 0;
  }

  const raw = fs.readFileSync(EMPLOYEE_DATA_PATH, "utf8");
  const employees = normalizeEmployeeData(JSON.parse(raw));

  const transaction = db.transaction((rows) => {
    rows.forEach((employee) => upsertEmployee.run(employee));
  });

  transaction(employees);
  return employees.length;
}

function seedDefaults() {
  const now = new Date().toISOString();
  const employeeCount = seedEmployees();

  if (!employeeCount && !getUserByEmployeeCode.get("ADMIN1234")) {
    upsertEmployee.run({
      id: "EMP-ADMIN-001",
      username: "ADMIN1234",
      password: "[HASHED]",
      password_hash: hashEmployeeCode("ADMIN1234"),
      employee_code: "ADMIN1234",
      full_name: "Administrator",
      department: "System",
      position: "Admin",
      photo_url: "",
      role: "admin",
      is_active: 1,
      created_at: now,
      updated_at: now
    });
  }

  if (!getBank.get()) {
    const raw = fs.readFileSync(DEFAULT_BANK_PATH, "utf8");
    const normalized = normalizeExamData(JSON.parse(raw));
    upsertBank.run({
      title: normalized.title,
      payload: JSON.stringify(normalized),
      source: "default",
      updated_at: now
    });
  }
}

seedDefaults();

function getCurrentBankPayload() {
  const row = getBank.get();
  return {
    title: row.title,
    source: row.source,
    updatedAt: row.updated_at,
    ...JSON.parse(row.payload)
  };
}

function findExamById(examId) {
  const bank = getCurrentBankPayload();
  return (bank.examSets || []).find((exam) => String(exam.id) === String(examId)) || null;
}

function serializeUser(user) {
  return {
    id: user.id,
    employeeCode: user.employee_code,
    username: user.username || user.employee_code,
    fullName: user.full_name || user.username || user.employee_code,
    department: user.department || "",
    position: user.position || "",
    photoUrl: user.photo_url || "",
    role: user.role
  };
}

function serializeResult(row) {
  return {
    ...row,
    score: Number(row.score || 0),
    total_score: Number(row.total_score || 0),
    percent: Number(row.percent || 0),
    correct_count: Number(row.correct_count || 0),
    wrong_count: Number(row.wrong_count || 0),
    question_count: Number(row.question_count || 0),
    passed: Boolean(row.passed)
  };
}

function serializeEmployee(user) {
  return {
    id: user.id,
    employeeCode: user.employee_code,
    fullName: user.full_name || user.employee_code,
    department: user.department || "",
    position: user.position || "",
    photoUrl: user.photo_url || "",
    role: user.role,
    isActive: Boolean(user.is_active)
  };
}

function serializeEvaluation(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    employeeName: row.employee_name,
    evaluator: row.evaluator,
    sectionTitle: row.section_title,
    modelCode: row.model_code,
    modelName: row.model_name,
    partCode: row.part_code,
    partName: row.part_name,
    examScore: Number(row.exam_score || 0),
    examTotalScore: Number(row.exam_total_score || 0),
    examPercent: Number(row.exam_percent || 0),
    examPassed: Boolean(row.exam_passed),
    totalScore: Number(row.total_score || 0),
    maxScore: Number(row.max_score || 0),
    rows: JSON.parse(row.rows_json || "[]"),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

app.use(express.json({ limit: "5mb" }));
app.use(express.static(__dirname));

function getBearerToken(req) {
  const header = String(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) {
    return "";
  }
  return header.slice("Bearer ".length).trim();
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = getUserByEmployeeCode.get(payload.employeeCode);
  if (!user || !user.is_active || user.id !== payload.sub) {
    return res.status(401).json({ error: "Invalid authentication token" });
  }

  req.auth = payload;
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}

app.post("/api/login", (req, res) => {
  const employeeCode = normalizeEmployeeCode(req.body.employeeCode);

  if (!employeeCode) {
    return res.status(400).json({ error: "Employee code is required" });
  }

  const user = getUserByEmployeeCode.get(employeeCode);
  if (!user) {
    return res.status(401).json({ error: "Employee code not found" });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: "This employee account is inactive" });
  }

  const incomingHash = hashEmployeeCode(employeeCode);
  const storedHash = user.password_hash || "";

  if (!compareHashes(incomingHash, storedHash)) {
    return res.status(401).json({ error: "Unable to verify employee code" });
  }

  return res.json({ user: serializeUser(user), token: createAuthToken(user) });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

app.get("/api/exams", (_req, res) => {
  res.json(getCurrentBankPayload());
});

app.post("/api/results", requireAuth, (req, res) => {
  const payload = req.body || {};
  const examId = String(payload.examId || "").trim();
  const answers = Array.isArray(payload.answers) ? payload.answers : null;

  if (!examId || !answers) {
    return res.status(400).json({ error: "examId and answers are required" });
  }

  const exam = findExamById(examId);
  if (!exam) {
    return res.status(404).json({ error: "Exam not found" });
  }

  const questions = Array.isArray(exam.questions) ? exam.questions : [];
  let score = 0;
  let totalScore = 0;
  let correctCount = 0;

  questions.forEach((question, index) => {
    const weight = Number(question.score) || 1;
    totalScore += weight;
    if (Number.isInteger(answers[index]) && Number(answers[index]) === Number(question.answer)) {
      score += weight;
      correctCount += 1;
    }
  });

  const wrongCount = Math.max(questions.length - correctCount, 0);
  const percent = totalScore ? Math.round((score / totalScore) * 100) : 0;
  const passed = score >= (Number(exam.passScore) || 0);
  const submittedAt = new Date().toISOString();

  const record = {
    user_id: String(req.user.id),
    username: String(req.user.username || req.user.employee_code),
    employee_code: String(req.user.employee_code || ""),
    full_name: String(req.user.full_name || req.user.username || ""),
    role: String(req.user.role),
    exam_id: String(exam.id),
    exam_title: String(exam.title || ""),
    model_code: String(exam.modelCode || ""),
    model_name: String(exam.modelName || ""),
    part_code: String(exam.partCode || ""),
    score,
    total_score: totalScore,
    percent,
    correct_count: correctCount,
    wrong_count: wrongCount,
    question_count: questions.length,
    passed: passed ? 1 : 0,
    submitted_at: submittedAt
  };

  insertResult.run(record);

  res.json({ ok: true, result: serializeResult(record) });
});

app.get("/api/results", requireAuth, (req, res) => {
  const results = req.user.role === "admin" ? getAllResults.all() : getResultsByUser.all(req.user.id);
  return res.json({ results: results.map(serializeResult) });
});

app.get("/api/admin/employees", requireAdmin, (req, res) => {
  return res.json({ employees: getActiveEmployees.all().map(serializeEmployee) });
});

app.get("/api/evaluations", requireAdmin, (req, res) => {
  return res.json({ evaluations: getAllEvaluations.all().map(serializeEvaluation) });
});

app.post("/api/evaluations", requireAdmin, (req, res) => {
  const payload = req.body || {};
  const employeeId = String(payload.employeeId || "").trim();
  const employeeCode = normalizeEmployeeCode(payload.employeeCode || "");
  const partCode = String(payload.partCode || "").trim();
  const sectionTitle = String(payload.sectionTitle || "").trim();
  const evaluator = String(payload.evaluator || "").trim();
  const rows = Array.isArray(payload.rows) ? payload.rows : [];

  if (!employeeId || !employeeCode || !partCode || !sectionTitle || !evaluator || !rows.length) {
    return res.status(400).json({ error: "Missing required evaluation fields" });
  }

  const employee = getUserByEmployeeCode.get(employeeCode);
  if (!employee || employee.id !== employeeId || !employee.is_active) {
    return res.status(404).json({ error: "Employee not found" });
  }

  const latestExam = getAllResults
    .all()
    .find((entry) => entry.employee_code === employeeCode && entry.part_code === partCode) || null;

  const now = new Date().toISOString();
  const record = {
    id: randomId("EVAL"),
    employee_id: employeeId,
    employee_code: employeeCode,
    employee_name: String(payload.employeeName || employee.full_name || employeeCode).trim(),
    evaluator,
    section_title: sectionTitle,
    model_code: String(payload.modelCode || "").trim(),
    model_name: String(payload.modelName || "").trim(),
    part_code: partCode,
    part_name: String(payload.partName || "").trim(),
    exam_score: Number(latestExam?.score || 0),
    exam_total_score: Number(latestExam?.total_score || 0),
    exam_percent: Number(latestExam?.percent || 0),
    exam_passed: latestExam?.passed ? 1 : 0,
    total_score: Number(payload.totalScore || 0),
    max_score: Number(payload.maxScore || 0),
    rows_json: JSON.stringify(rows),
    created_at: now,
    updated_at: now
  };

  const existing = getLatestEvaluationByEmployeePart.get(employeeId, partCode);
  if (existing) {
    record.id = existing.id;
    record.created_at = existing.created_at;
    updateEvaluation.run(record);
  } else {
    insertEvaluation.run(record);
  }

  return res.status(201).json({ evaluation: serializeEvaluation(record) });
});

app.post("/api/admin/exam-bank", requireAdmin, (req, res) => {
  try {
    const normalized = normalizeExamData(req.body.payload);
    upsertBank.run({
      title: normalized.title,
      payload: JSON.stringify(normalized),
      source: "custom",
      updated_at: new Date().toISOString()
    });
    return res.json({
      ok: true,
      title: normalized.title,
      examSetCount: normalized.examSets.length
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/reset-exam-bank", requireAdmin, (req, res) => {
  const raw = fs.readFileSync(DEFAULT_BANK_PATH, "utf8");
  const normalized = normalizeExamData(JSON.parse(raw));
  upsertBank.run({
    title: normalized.title,
    payload: JSON.stringify(normalized),
    source: "default",
    updated_at: new Date().toISOString()
  });

  res.json({ ok: true });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Factory exam app running on http://localhost:${PORT}`);
});
