const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { mkdtemp, rm } = require("node:fs/promises");
const path = require("node:path");
const fixture = require("./workplace-fixture");
test(
  "workplace API enforces roles, versions, exam completion and server-calculated scores",
  { timeout: 120000 },
  async () => {
    const dir = await mkdtemp("/tmp/workplace-test-");
    const port = 43000 + Math.floor(Math.random() * 10000);
    const child = spawn(process.execPath, ["server.js"], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, DATA_DIR: dir, PORT: String(port) },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let errors = "";
    child.stderr.on("data", (d) => (errors += d));
    const req = async (url, token, body, method) =>
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
      await json(
        await req("/api/admin/employees", admin.token, {
          employeeCode: "WP-TEST",
          fullName: "Workplace test",
        }),
        201,
      );
      const worker = await json(
        await req("/api/login", null, { employeeCode: "WP-TEST" }),
      );
      const bank = await json(await req("/api/exams"));
      const exam = bank.examSets[0],
        other = bank.examSets[1];
      const examId = String(exam.id);
      assert.equal(
        (await req("/api/workplace/config?examId=" + examId, worker.token))
          .status,
        403,
      );
      assert.equal(
        (await req("/api/workplace/quizzes?examId=" + examId)).status,
        401,
      );
      const config = fixture();
      const saved = await json(
        await req(
          "/api/workplace/config",
          admin.token,
          { examId, config, revision: 0 },
          "PUT",
        ),
      );
      assert.equal(saved.config.revision, 1);
      const quiz = await json(
        await req("/api/workplace/quizzes?examId=" + examId, worker.token),
      );
      assert.equal(quiz.quizzes.preparation[0].answer, undefined);
      const base = {
        examId,
        revision: 1,
        employeeCode: "WP-TEST",
        period: "2026-10",
        evaluator: "Assessor",
        evidence: {
          actual: 100,
          target: 100,
          overCut: 0,
          undercut: 0,
          outFlow: 0,
          nc: 0,
          car: 0,
        },
      };
      assert.equal(
        (await req("/api/workplace/evaluations", admin.token, base)).status,
        400,
      );
      assert.equal(
        (await req("/api/workplace/evaluations", worker.token, base)).status,
        403,
      );
      for (const [kind, answer] of [
        ["preparation", 0],
        ["response", 1],
      ])
        await json(
          await req("/api/workplace/attempts", worker.token, {
            examId,
            kind,
            revision: 1,
            answers: [answer],
          }),
          201,
        );
      let preview = await json(
        await req("/api/workplace/preview", admin.token, base),
      );
      assert.equal(preview.totalScore, 40);
      assert.equal(preview.percent, 100);
      preview = await json(
        await req("/api/workplace/preview", admin.token, {
          ...base,
          evidence: { ...base.evidence, nc: 8, undercut: 3 },
        }),
      );
      assert.deepEqual(
        preview.rows.map((r) => r.score),
        [4, 2, 1, 4],
      );
      assert.equal(preview.totalScore, 27);
      const evaluated = await json(
        await req("/api/workplace/evaluations", admin.token, {
          ...base,
          totalScore: 999,
          rows: [],
        }),
        201,
      );
      assert.equal(evaluated.totalScore, 40);
      const history = await json(
        await req(
          "/api/workplace/history?examId=" + examId + "&employeeCode=WP-TEST",
          admin.token,
        ),
      );
      assert.equal(history.records[0].rows.length, 4);
      assert.equal(history.records[0].evidence.period, "2026-10");
      const wrongPart = await req("/api/workplace/preview", admin.token, {
        ...base,
        examId: String(other.id),
      });
      assert.equal(wrongPart.status, 400);
      assert.equal(
        (
          await req("/api/workplace/preview", admin.token, {
            ...base,
            evidence: { ...base.evidence, target: 0 },
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await req(
            "/api/workplace/config",
            admin.token,
            { examId, config, revision: 0 },
            "PUT",
          )
        ).status,
        400,
      );
      await json(
        await req(
          "/api/workplace/config",
          admin.token,
          { examId, config, revision: 1 },
          "PUT",
        ),
      );
      assert.equal(
        (
          await req("/api/workplace/attempts", worker.token, {
            examId,
            kind: "response",
            revision: 1,
            answers: [1],
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await req("/api/workplace/preview", admin.token, {
            ...base,
            revision: 2,
          })
        ).status,
        400,
      );
      const stillSaved = await json(
        await req(
          "/api/workplace/history?examId=" + examId + "&employeeCode=WP-TEST",
          admin.token,
        ),
      );
      assert.equal(stillSaved.records[0].totalScore, 40);
      assert.equal(stillSaved.records[0].config.revision, 1);
    } finally {
      child.kill();
      if (child.exitCode === null)
        await new Promise((r) => child.once("exit", r));
      await rm(dir, { recursive: true, force: true });
    }
  },
);
