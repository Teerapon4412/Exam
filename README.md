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
