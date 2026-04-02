const fs = require("fs");
const path = require("path");
const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "factory-exam.sqlite");
const DEFAULT_BANK_PATH = path.join(__dirname, "exam-data.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
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
`);

const insertUser = db.prepare(`
  INSERT INTO users (id, username, password, role, created_at)
  VALUES (@id, @username, @password, @role, @created_at)
`);
const getUserByUsername = db.prepare(`SELECT * FROM users WHERE username = ?`);
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
const insertResult = db.prepare(`
  INSERT INTO exam_results (
    user_id, username, role, exam_id, exam_title, model_code, model_name, part_code,
    score, total_score, percent, correct_count, wrong_count, question_count, passed, submitted_at
  ) VALUES (
    @user_id, @username, @role, @exam_id, @exam_title, @model_code, @model_name, @part_code,
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

function randomId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
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
          const entries = Object.entries(question.choices || {}).sort(([a], [b]) => a.localeCompare(b));
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

function seedDefaults() {
  const now = new Date().toISOString();

  if (!getUserByUsername.get("admin")) {
    insertUser.run({
      id: "ADMIN-001",
      username: "admin",
      password: "admin123",
      role: "admin",
      created_at: now
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

app.use(express.json({ limit: "5mb" }));
app.use(express.static(__dirname));

app.post("/api/login", (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "").trim();

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const existing = getUserByUsername.get(username);
  if (existing) {
    if (existing.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    return res.json({
      user: {
        id: existing.id,
        username: existing.username,
        role: existing.role
      }
    });
  }

  const now = new Date().toISOString();
  const user = {
    id: randomId("USER"),
    username,
    password,
    role: "student",
    created_at: now
  };
  insertUser.run(user);
  return res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

app.get("/api/exams", (_req, res) => {
  res.json(getCurrentBankPayload());
});

app.post("/api/results", (req, res) => {
  const payload = req.body || {};
  const required = ["user_id", "username", "role", "exam_id", "exam_title", "model_code", "model_name", "part_code"];
  const missing = required.find((key) => !payload[key]);
  if (missing) {
    return res.status(400).json({ error: `Missing field: ${missing}` });
  }

  insertResult.run({
    user_id: String(payload.user_id),
    username: String(payload.username),
    role: String(payload.role),
    exam_id: String(payload.exam_id),
    exam_title: String(payload.exam_title),
    model_code: String(payload.model_code),
    model_name: String(payload.model_name),
    part_code: String(payload.part_code),
    score: Number(payload.score) || 0,
    total_score: Number(payload.total_score) || 0,
    percent: Number(payload.percent) || 0,
    correct_count: Number(payload.correct_count) || 0,
    wrong_count: Number(payload.wrong_count) || 0,
    question_count: Number(payload.question_count) || 0,
    passed: payload.passed ? 1 : 0,
    submitted_at: payload.submitted_at || new Date().toISOString()
  });

  res.json({ ok: true });
});

app.get("/api/results", (req, res) => {
  const role = String(req.query.role || "student");
  const userId = String(req.query.userId || "");

  if (role === "admin") {
    return res.json({ results: getAllResults.all() });
  }

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  return res.json({ results: getResultsByUser.all(userId) });
});

app.post("/api/admin/exam-bank", (req, res) => {
  const role = String(req.body.role || "");
  if (role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

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

app.post("/api/admin/reset-exam-bank", (req, res) => {
  const role = String(req.body.role || "");
  if (role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

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
