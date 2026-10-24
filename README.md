# Factory Online Exam

Online exam app with Express and SQLite, prepared for GitHub + Render deployment.

## Local preview

Install dependencies and start the app:

```bash
npm install
npm start
```

Then open:

- `http://127.0.0.1:3000`

## Deploy on Render

This repo includes `render.yaml` for a Node web service deployment.

- Service name: `factory-online-exam`
- Build command: `npm install`
- Start command: `npm start`
- Persistent disk mounted at `/opt/render/project/src/data`

## Data source

Exam questions are seeded from `exam-data.json` into SQLite on first run.

## Backend features

- Login API with persistent users in SQLite
- Persistent exam results for all users
- Admin upload/reset of exam bank through API
- Admin can view all submitted results

## Unified workplace assessment

The single **ประเมินหน้างาน** menu contains a shared assessment month and these submenus:

- **ภาพรวม / สถานะ**: readiness of all four inputs, calculated result, saved result, and a warning when source data changes after saving. Admin sees the employee roster; employees and Leaders see only themselves.
- **ข้อสอบของฉัน**: preparation (topic 1) and problem-follow-up (topic 4), using the Part exam interaction and weighted question points. Attempts belong to the authenticated employee, selected month and quiz configuration revision.
- **กรอกคะแนนข้อ 2–3** (Admin): batch entry of raw quantity/quality scores, with review and confirmation, monthly persistence and optimistic revision checks. The same submenu includes Admin-defined conversion thresholds, direction and weight for the two raw scores.
- **ตั้งค่าข้อสอบข้อ 1 / 4** (Admin): quiz questions, images, weights and level 2–4 percentage thresholds. Quantity/quality conversion rules remain separate from these quiz criteria.
- **สรุปและบันทึกผล** (Admin): the original four-row assessment sheet automatically reads both quiz results and both raw scores for the same employee/month. Saving recalculates on the server and snapshots all evidence and rules.

No Model/Part selection is required. Workplace evaluation contributes 60% to every ordinary Model/Part Skill Matrix cell, alongside that cell's ordinary exam 40%. Exam-only and separate practical assessment formulas remain unchanged. Skill Matrix uses the month most recently selected in the assessment hub and labels that month.

### Scoring and versioning

Admin sets all thresholds and weights; no production criteria are invented or seeded. Each metric has thresholds for levels 2, 3 and 4; values that do not reach level 2 receive level 1. Raw-score rules can use ascending minimum thresholds (higher is better) or descending maximum thresholds (lower is better). The final workplace percentage is `sum(level * weight) / sum(4 * weight) * 100`.

Saving quiz settings creates a configuration revision. Editing only thresholds or weights reuses the existing result for the same employee/month when the question content is unchanged. Changing question text, choices, correct answers, points or images requires a new attempt only for the affected quiz. Changing raw-score conversion rules does not require quiz retakes. Saved results retain snapshots; an updated input or rule is marked as needing recalculation rather than silently altering saved results. Results are stored independently per employee/month; saving October cannot overwrite November.

The question editor supports scores, A–D answers, duplicate/delete, image URL or PNG/JPEG/GIF/WebP upload up to 5 MB. All questions must be answered before submission. Failed requests preserve selected answers, and successful attempts are locked until explicitly restarted.

### Access and persistence

All score entry, scoring rules, quiz editing and final evaluation writes are Admin-only on both UI and API. USER and LEADER cannot write raw scores or evaluation results. Batch raw-score saves are atomic, reject stale revisions, and record the authenticated Admin in the audit log. Blank differs from zero. Unsaved scoring drafts survive filters/month switches within the session and clear on logout.

SQLite changes are additive. Existing evaluations, quiz attempts and per-Part data remain stored; historical evaluation months are restored only from their recorded evidence. Old quiz attempts with no recorded month are preserved with an empty period and are not silently assigned to a new month. Employees must take the quizzes for the intended month. Continue using the existing persistent `DATA_DIR`; do not delete or reseed production data. No new credentials or dependencies are required.

Run tests with:

```bash
node --test tests/*.test.js
```

Admin can edit Weight (B) directly in the assessment sheet. A local override is validated on the server and saved with that employee/month result; it does not change the global rules or force a quiz retake. “ใช้น้ำหนักตามเกณฑ์” clears local overrides.

Quiz results are matched by a canonical question fingerprint, not by scoring-criteria revision. Existing fingerprints are recovered only from saved configuration snapshots/audit evidence. Unknown historical versions and results without a recorded month are not silently matched; diagnostics name the employee/month and distinguish changed questions from a period mismatch.
