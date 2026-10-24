const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { mkdtemp, rm } = require("node:fs/promises");
const path = require("node:path");
const Database = require("better-sqlite3");
const fixture = require("./workplace-fixture");
test(
  "integrated monthly workplace workflow isolates periods, enforces Admin writes and preserves snapshots",
  { timeout: 120000 },
  async () => {
    const dir = await mkdtemp("/tmp/workplace-hub-"),
      port = 43000 + Math.floor(Math.random() * 10000);
    const legacyDatabase = new Database(path.join(dir, "factory-exam.sqlite"));
    legacyDatabase.exec(
      "CREATE TABLE workplace_attempts (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,exam_id TEXT NOT NULL,kind TEXT NOT NULL,revision INTEGER NOT NULL,percent REAL NOT NULL,answers_json TEXT NOT NULL,created_at TEXT NOT NULL)",
    );
    legacyDatabase
      .prepare("INSERT INTO workplace_attempts VALUES (?,?,?,?,?,?,?,?)")
      .run(
        "legacy-unscoped",
        "legacy",
        "__WORKPLACE_ALL__",
        "preparation",
        1,
        100,
        "[0]",
        "2026-10-01T00:00:00Z",
      );
    legacyDatabase.close();
    const child = spawn(process.execPath, ["server.js"], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, DATA_DIR: dir, PORT: String(port) },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let errors = "";
    child.stderr.on("data", (d) => (errors += d));
    let storage;
    const req = (url, token, body, method) =>
      fetch(`http://127.0.0.1:${port}` + url, {
        method: method || (body ? "POST" : "GET"),
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    const json = async (response, status = 200) => {
      const body = await response.json();
      assert.equal(response.status, status, JSON.stringify(body));
      return body;
    };
    try {
      let ready = false;
      for (let i = 0; i < 900; i++) {
        try {
          if ((await req("/api/exams")).ok) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      assert.ok(ready, errors);
      const admin = await json(
        await req("/api/login", null, { employeeCode: "ADMIN1234" }),
      );
      for (const [code, role] of [
        ["WP-TEST", "student"],
        ["WP-LEADER", "leader"],
      ])
        await json(
          await req("/api/admin/employees", admin.token, {
            employeeCode: code,
            fullName: code,
            role,
          }),
          201,
        );
      const worker = await json(
          await req("/api/login", null, { employeeCode: "WP-TEST" }),
        ),
        leader = await json(
          await req("/api/login", null, { employeeCode: "WP-LEADER" }),
        );
      storage = new Database(path.join(dir, "factory-exam.sqlite"));
      const config = fixture();
      config.groups = config.groups.filter((g) =>
        ["preparation", "response"].includes(g.key),
      );
      const rules = {
        groups: ["quantity", "quality"].map((key, index) => ({
          key,
          weight: index + 2,
          direction: "higher",
          metrics: { [key + "Raw"]: [50, 75, 90] },
        })),
      };
      storage
        .prepare(
          "UPDATE workplace_attempts SET user_id=? WHERE id='legacy-unscoped'",
        )
        .run(worker.user.id);
      const setup = await json(
        await req(
          "/api/workplace/config",
          admin.token,
          { config, revision: 0 },
          "PUT",
        ),
      );
      assert.equal(setup.config.revision, 1);
      const schema = await json(
        await req("/api/workplace/config", admin.token),
      );
      assert.deepEqual(
        schema.groups.map((g) => g.key),
        ["preparation", "response"],
      );
      await json(
        await req(
          "/api/workplace/manual-rules",
          admin.token,
          { rules, revision: 0 },
          "PUT",
        ),
      );
      assert.equal(
        (await req("/api/workplace/overview?period=2026-10")).status,
        401,
      );
      for (const account of [worker, leader])
        for (const [url, body, method] of [
          ["/api/workplace/manual-scores?period=2026-10", null],
          [
            "/api/workplace/manual-scores",
            { period: "2026-10", assessor: "Spoof", entries: [] },
          ],
          ["/api/workplace/manual-rules", { rules, revision: 1 }, "PUT"],
          ["/api/workplace/evaluations", { period: "2026-10" }],
        ])
          assert.equal(
            (await req(url, account.token, body, method)).status,
            403,
          );
      const publicQuiz = await json(
        await req("/api/workplace/quizzes", worker.token),
      );
      assert.equal(publicQuiz.quizzes.preparation[0].answer, undefined);
      assert.equal(
        (
          await req("/api/workplace/attempts", worker.token, {
            kind: "preparation",
            revision: 1,
            answers: [0],
          })
        ).status,
        400,
      );
      const submit = (kind, answer, period) =>
        jsonLater(
          req("/api/workplace/attempts", worker.token, {
            kind,
            revision: 1,
            answers: [answer],
            period,
          }),
        );
      async function jsonLater(promise) {
        return json(await promise, 201);
      }
      const beforeQuiz = await json(
        await req("/api/workplace/overview?period=2026-10", admin.token),
      );
      assert.equal(
        beforeQuiz.entries.find((e) => e.employeeCode === "WP-TEST").quiz
          .preparation,
        null,
      );
      assert.equal(
        storage
          .prepare(
            "SELECT period FROM workplace_attempts WHERE id='legacy-unscoped'",
          )
          .get().period,
        "",
      );
      await submit("preparation", 0, "2026-10");
      await submit("response", 1, "2026-10");
      const input = {
        period: "2026-10",
        assessor: "Assessor",
        entries: [
          {
            employeeCode: "WP-TEST",
            quantity: 85,
            quality: 60,
            revision: 0,
            scale: "raw",
          },
        ],
      };
      await json(await req("/api/workplace/manual-scores", admin.token, input));
      const base = {
        employeeCode: "WP-TEST",
        period: "2026-10",
        revision: 1,
        evaluator: "Assessor",
      };
      const preview = await json(
        await req("/api/workplace/preview", admin.token, {
          ...base,
          totalScore: 999,
        }),
      );
      assert.deepEqual(
        preview.rows.map((r) => r.score),
        [4, 3, 2, 4],
      );
      assert.equal(preview.totalScore, 32);
      assert.equal(preview.maxScore, 40);
      assert.equal(preview.percent, 80);
      let overview = await json(
        await req("/api/workplace/overview?period=2026-10", admin.token),
      );
      assert.equal(
        overview.entries.find((e) => e.employeeCode === "WP-TEST").ready,
        true,
      );
      const own = await json(
        await req("/api/workplace/overview?period=2026-10", worker.token),
      );
      assert.equal(own.entries.length, 1);
      assert.equal(own.entries[0].employeeCode, "WP-TEST");
      const saved = await json(
        await req("/api/workplace/evaluations", admin.token, base),
        201,
      );
      const weightedPreview = await json(
        await req("/api/workplace/preview", admin.token, {
          ...base,
          weights: { quality: 6 },
        }),
      );
      assert.equal(weightedPreview.totalScore, 38);
      assert.equal(weightedPreview.maxScore, 52);
      await json(
        await req("/api/workplace/evaluations", admin.token, {
          ...base,
          weights: { quality: 6 },
        }),
        201,
      );
      const restoredWeights = await json(
        await req("/api/workplace/preview", admin.token, base),
      );
      assert.equal(restoredWeights.weightOverrides.quality, 6);
      assert.equal(restoredWeights.totalScore, 38);
      assert.equal(
        (
          await json(await req("/api/workplace/manual-rules", admin.token))
        ).rules.groups.find((g) => g.key === "quality").weight,
        3,
      );
      for (const weights of [
        { quality: 0 },
        { quality: -1 },
        { quality: 101 },
        { unknown: 2 },
      ])
        assert.equal(
          (
            await req("/api/workplace/preview", admin.token, {
              ...base,
              weights,
            })
          ).status,
          400,
        );
      const resetWeights = await json(
        await req("/api/workplace/evaluations", admin.token, {
          ...base,
          weights: {},
        }),
        201,
      );
      assert.equal(resetWeights.totalScore, 32);
      const history = await json(
        await req("/api/workplace/history?employeeCode=WP-TEST", admin.token),
      );
      assert.equal(history.records[0].period, "2026-10");
      assert.equal(history.records[0].config.manualRevision, 1);
      assert.equal(history.records[0].evidence.evidence.manualScoreRevision, 1);
      overview = await json(
        await req("/api/workplace/overview?period=2026-10", admin.token),
      );
      assert.equal(
        overview.entries.find((e) => e.employeeCode === "WP-TEST").saved
          .needsUpdate,
        false,
      );
      assert.equal(
        (await req("/api/workplace/manual-scores", admin.token, input)).status,
        409,
      );
      const atomic = await req("/api/workplace/manual-scores", admin.token, {
        ...input,
        entries: [
          { ...input.entries[0], quantity: 0, revision: 1 },
          { employeeCode: "UNKNOWN", quantity: 90, quality: 90, revision: 0 },
        ],
      });
      assert.equal(atomic.status, 400);
      assert.equal(
        (
          await json(
            await req(
              "/api/workplace/manual-scores?period=2026-10",
              admin.token,
            ),
          )
        ).entries[0].quantity,
        85,
      );
      await json(
        await req("/api/workplace/manual-scores", admin.token, {
          ...input,
          entries: [{ ...input.entries[0], quantity: 0, revision: 1 }],
        }),
      );
      overview = await json(
        await req("/api/workplace/overview?period=2026-10", admin.token),
      );
      assert.equal(
        overview.entries.find((e) => e.employeeCode === "WP-TEST").saved
          .needsUpdate,
        true,
      );
      await json(
        await req(
          "/api/workplace/manual-rules",
          admin.token,
          { rules, revision: 1 },
          "PUT",
        ),
      );
      assert.equal(
        (await json(await req("/api/workplace/config", admin.token))).config
          .revision,
        1,
      ); // Manual rules do not force quiz retakes.
      const savedAgain = await json(
        await req("/api/workplace/evaluations", admin.token, base),
        201,
      );
      assert.equal(savedAgain.id, saved.id);
      await json(
        await req("/api/workplace/manual-scores", admin.token, {
          ...input,
          period: "2026-11",
          entries: [{ ...input.entries[0], quantity: 100, quality: 100 }],
        }),
      );
      assert.equal(
        (
          await req("/api/workplace/preview", admin.token, {
            ...base,
            period: "2026-11",
          })
        ).status,
        400,
      );
      let november = await json(
        await req("/api/workplace/overview?period=2026-11", admin.token),
      );
      assert.equal(
        november.entries.find((e) => e.employeeCode === "WP-TEST").quiz
          .preparation,
        null,
      );
      await submit("preparation", 0, "2026-11");
      await submit("response", 1, "2026-11");
      const novemberSave = await json(
        await req("/api/workplace/evaluations", admin.token, {
          ...base,
          period: "2026-11",
        }),
        201,
      );
      assert.notEqual(novemberSave.id, saved.id);
      assert.equal(novemberSave.percent, 100);
      assert.equal(
        (
          await json(
            await req(
              "/api/workplace/history?employeeCode=WP-TEST",
              admin.token,
            ),
          )
        ).records.length,
        2,
      );
      assert.equal(
        storage
          .prepare(
            "SELECT saved_by FROM workplace_manual_scores WHERE employee_id=? AND period=?",
          )
          .get(worker.user.id, "2026-10").saved_by,
        "ADMIN1234",
      );
      config.groups[0].weight = 2;
      await json(
        await req(
          "/api/workplace/config",
          admin.token,
          { config, revision: 1 },
          "PUT",
        ),
      );
      overview = await json(
        await req("/api/workplace/overview?period=2026-11", admin.token),
      );
      assert.equal(
        overview.entries.find((e) => e.employeeCode === "WP-TEST").ready,
        true,
      );
      assert.equal(
        overview.entries.find((e) => e.employeeCode === "WP-TEST").saved
          .needsUpdate,
        true,
      );
      assert.equal(
        storage
          .prepare("SELECT total_score FROM evaluations WHERE id=?")
          .get(novemberSave.id).total_score,
        40,
      );
      // Criteria-only edits reuse old results; a quiz already open before the edit may still submit.
      await json(
        await req("/api/workplace/attempts", worker.token, {
          kind: "preparation",
          revision: 1,
          period: "2026-11",
          answers: [0],
        }),
        201,
      );
      const reused = await json(
        await req("/api/workplace/preview", admin.token, {
          ...base,
          period: "2026-11",
          revision: 2,
        }),
      );
      assert.equal(reused.percent, 100);
      // Rows from before quiz_hash existed are repaired only with a proven version snapshot.
      storage
        .prepare(
          "UPDATE workplace_attempts SET quiz_hash='' WHERE kind='response' AND period='2026-11'",
        )
        .run();
      assert.equal(
        (
          await json(
            await req("/api/workplace/overview?period=2026-11", admin.token),
          )
        ).entries.find((e) => e.employeeCode === "WP-TEST").ready,
        true,
      );
      const mismatch = await req("/api/workplace/preview", admin.token, {
        ...base,
        revision: 2,
        period: "2026-12",
      });
      assert.equal(mismatch.status, 400);
      const weighted = fixture();
      weighted.groups = weighted.groups.filter((g) =>
        ["preparation", "response"].includes(g.key),
      );
      weighted.quizzes.preparation = [
        {
          text: "Weighted",
          choices: ["a", "b", "c", "d"],
          answer: 0,
          score: 3,
          imageUrl: "https://example.com/q.png",
        },
        { text: "Other", choices: ["a", "b", "c", "d"], answer: 1, score: 1 },
      ];
      await json(
        await req(
          "/api/workplace/config",
          admin.token,
          { config: weighted, revision: 2 },
          "PUT",
        ),
      );
      const changed = await json(
        await req("/api/workplace/overview?period=2026-11", admin.token),
      );
      const changedEmployee = changed.entries.find(
        (e) => e.employeeCode === "WP-TEST",
      );
      assert.equal(changedEmployee.quiz.preparation, null);
      assert.ok(changedEmployee.quiz.response);
      const changedError = await req("/api/workplace/preview", admin.token, {
        ...base,
        period: "2026-11",
        revision: 3,
      });
      assert.match((await changedError.json()).error, /เนื้อหาหรือเฉลย/);
      assert.equal(
        (
          await req("/api/workplace/attempts", worker.token, {
            kind: "preparation",
            revision: 1,
            period: "2026-11",
            answers: [0],
          })
        ).status,
        400,
      );
      await json(
        await req("/api/workplace/attempts", worker.token, {
          kind: "response",
          revision: 1,
          period: "2026-11",
          answers: [1],
        }),
        201,
      );
      const questions = await json(
        await req("/api/workplace/quizzes", worker.token),
      );
      assert.equal(
        questions.quizzes.preparation[0].imageUrl,
        "https://example.com/q.png",
      );
      assert.equal(questions.quizzes.preparation[0].answer, undefined);
      const weightedAttempt = await json(
        await req("/api/workplace/attempts", worker.token, {
          kind: "preparation",
          revision: 3,
          period: "2026-11",
          answers: [0, 0],
          score: 999,
        }),
        201,
      );
      assert.equal(weightedAttempt.percent, 75);
      assert.equal(weightedAttempt.score, 3);
      assert.equal(weightedAttempt.totalScore, 4);
    } finally {
      if (storage) storage.close();
      child.kill();
      if (child.exitCode === null)
        await new Promise((r) => child.once("exit", r));
      await rm(dir, { recursive: true, force: true });
    }
  },
);
