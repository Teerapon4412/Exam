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

## Automatic workplace evaluation

The **ข้อสอบและประเมินหน้างาน** screen separates workplace quizzes from the ordinary Model/Part exams. Admins configure one shared set of criteria and quizzes before employees can be evaluated; no production scoring thresholds are seeded.

1. Admin sets four positive weights and the level 2, 3 and 4 thresholds for every metric. Below level 2 means level 1. Exam percentages and actual output / target use ascending minimum thresholds; defect counts use descending maximum thresholds. Each heading receives the lowest level among its metrics.
2. Admin creates two separate multiple-choice quizzes: preparation and problem follow-up. Employees complete these under their own accounts. Answers and percentages are calculated on the server.
3. Admin chooses an employee, assessment month and assessor, and enters actual output, target and defect counts from the same period. Zero must be explicitly entered when there are no defects. Preview and save use server-calculated scores and the latest attempts for the employee and current configuration revision.
4. The workplace percentage is `sum(level * weight) / sum(4 * weight) * 100`. Existing Model scoring mode still determines whether Skill Matrix uses exam 40% + evaluation 60%, or exam-only 100%.

Saving changed settings creates a new revision and requires both quizzes to be taken again. Saved evaluations retain their scoring rules, evidence and quiz attempt references. New saves replace the current overall employee evaluation, with changes recorded in the existing admin audit log. Prior legacy evaluations remain readable through the saved-results section and Skill Matrix. The separate Check Sheet Condition practical assessment keeps its existing scoring workflow.

SQLite tables are created additively on startup. Continue using the existing persistent `DATA_DIR`; do not delete or reseed production data. No new credentials or dependencies are required.

Run automated scoring, API and progress tests with:

```bash
node --test tests/*.test.js
```

Workplace assessment is global per employee: no Model/Part selection is required. The overall evaluation supplies the 60% component to every ordinary Model/Part cell; exam-only and practical-assessment modes keep their existing formulas. Legacy per-Part configurations and quiz attempts are preserved without merging them into the new shared criteria; Admin must configure the overall criteria once. Legacy evaluations remain available in saved results and serve as the matrix fallback until an overall evaluation is recorded.

The original **ประเมินหน้างาน** page keeps its employee workflow, four-row score sheet and evaluation history. Scores and weights on the sheet are read-only and come from automatic calculation. Admin manages criteria, weights and the two quiz banks in the separate **ตั้งค่าข้อสอบและเกณฑ์คะแนน** page; employees use **ข้อสอบประเมินหน้างาน** to take their quizzes. No Model/Part selection is required in these workflows.

Workplace quizzes use the Part exam interaction: one question at a time, previous/next controls, numbered question navigation, answered progress and a server-scored result summary. Answers remain selected when navigating and after a failed submission. All questions must be answered before sending; a successful attempt is locked until the employee explicitly starts a new attempt. These scores continue to feed workplace evaluation and are not ordinary Part exam results.

The workplace question editor follows the Part question cards: question text, score per question, correct answer A–D, image URL or local image upload with preview/removal, four answer choices, duplicate and delete. Numbering is derived from the question order. Local images support PNG/JPEG/GIF/WebP up to 5 MB. Quiz percentages use earned points / available points; the correct-question count remains a separate result. Existing questions without an explicit score retain one point each.

The Admin quiz criteria page now edits only **1. Preparation** and **4. Problem response**. Quantity and quality criteria are not displayed or required to save quiz settings. Existing quantity/quality criteria are retained when editing an older complete configuration. Fresh configurations can save the two quiz headings and quizzes alone; until the separate quantity/quality input method is defined, they cannot produce a complete four-heading evaluation or a partial score presented as the full 60% component.

## Admin entry of quantity and quality scores

**กรอกคะแนนข้อ 2–3** is now a real Admin-only entry page. Admin chooses the assessment month, enters raw quantity and quality scores against employee names/codes, reviews the completed rows, then confirms saving. Zero is a valid score; blank is unentered. Only changed, complete rows are saved. Persisted scores reload by employee and month, with a saved status; unsaved edits are retained while filtering or switching months in the same session.

Both `GET` and `POST /api/workplace/manual-scores` require Admin authentication. USER and LEADER roles cannot read or modify this endpoint. SQLite stores the scores, assessor, authenticated Admin identity, timestamp and per-row revision. Batch saves are atomic, reject stale revisions, and write an admin audit record. The reload button can restore current server values after a conflict. Local scoring drafts are cleared at logout.

The evaluation screen displays these raw scores for the selected employee/month. They are deliberately not converted to levels 1–4 or included as the complete evaluation component until the conversion criteria are defined. An assessment for a month with raw scores rejects attempts to calculate a total using the old quantity/quality input method.
