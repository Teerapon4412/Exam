"use strict";

const STORAGE_KEYS = {
  authToken: "factory_exam_auth_token",
  authUser: "factory_exam_auth_user",
  previewMode: "factory_exam_preview_mode"
};

const $ = (id) => document.getElementById(id);

const els = {
  loginShell: $("loginShell"),
  appShell: $("appShell"),
  loginForm: $("loginForm"),
  employeeCodeInput: $("employeeCodeInput"),
  loginMessage: $("loginMessage"),
  topbar: document.querySelector(".topbar"),
  systemTitle: $("systemTitle"),
  sidebarUserName: $("sidebarUserName"),
  sidebarUserRole: $("sidebarUserRole"),
  sidebarUserId: $("sidebarUserId"),
  dataSourceLabel: $("dataSourceLabel"),
  dataSummaryLabel: $("dataSummaryLabel"),
  logoutBtn: $("logoutBtn"),
  examView: $("examView"),
  historyView: $("historyView"),
  profileView: $("profileView"),
  skillMatrixView: $("skillMatrixView"),
  evaluationView: $("evaluationView"),
  adminView: $("adminView"),
  pageHeading: $("pageHeading"),
  modelSelector: $("modelSelector"),
  examSelector: $("examSelector"),
  examTitle: $("examTitle"),
  examDescription: $("examDescription"),
  examMetaQuestions: $("examMetaQuestions"),
  examMetaTime: $("examMetaTime"),
  examMetaPassScore: $("examMetaPassScore"),
  answeredCount: $("answeredCount"),
  progressPercent: $("progressPercent"),
  progressBar: $("progressBar"),
  summaryStatus: $("summaryStatus"),
  loadStatus: $("loadStatus"),
  submitExamBtn: $("submitExamBtn"),
  questionTitle: $("questionTitle"),
  questionBadge: $("questionBadge"),
  questionText: $("questionText"),
  questionImage: $("questionImage"),
  choicesContainer: $("choicesContainer"),
  prevBtn: $("prevBtn"),
  nextBtn: $("nextBtn"),
  questionNav: $("questionNav"),
  resultPanel: $("resultPanel"),
  scoreValue: $("scoreValue"),
  scorePercent: $("scorePercent"),
  correctCount: $("correctCount"),
  wrongCount: $("wrongCount"),
  resultMessage: $("resultMessage"),
  nextPartBtn: $("nextPartBtn"),
  restartExamBtn: $("restartExamBtn"),
  historyStats: $("historyStats"),
  historyList: $("historyList"),
  profileUserName: $("profileUserName"),
  profileEmployeeCode: $("profileEmployeeCode"),
  profileUserRole: $("profileUserRole"),
  profileDepartment: $("profileDepartment"),
  profilePosition: $("profilePosition"),
  profileExamCount: $("profileExamCount"),
  profileLastScore: $("profileLastScore"),
  adminFileInput: $("adminFileInput"),
  importJsonBtn: $("importJsonBtn"),
  resetJsonBtn: $("resetJsonBtn"),
  adminMessage: $("adminMessage"),
  adminDataInfo: $("adminDataInfo"),
  evaluationSectionTitle: $("evaluationSectionTitle"),
  evaluationModelSelect: $("evaluationModelSelect"),
  evaluationPartSelect: $("evaluationPartSelect"),
  evaluationEmployeeCodeSelect: $("evaluationEmployeeCodeSelect"),
  evaluationEmployeeNameSelect: $("evaluationEmployeeNameSelect"),
  evaluationEvaluatorSelect: $("evaluationEvaluatorSelect"),
  evaluationSelectedPart: $("evaluationSelectedPart"),
  evaluationLatestExam: $("evaluationLatestExam"),
  evaluationMessage: $("evaluationMessage"),
  saveEvaluationBtn: $("saveEvaluationBtn"),
  resetEvaluationBtn: $("resetEvaluationBtn"),
  evaluationSheetTitle: $("evaluationSheetTitle"),
  evaluationMetaCode: $("evaluationMetaCode"),
  evaluationMetaName: $("evaluationMetaName"),
  evaluationMetaPart: $("evaluationMetaPart"),
  evaluationMetaEvaluator: $("evaluationMetaEvaluator"),
  evaluationRows: $("evaluationRows"),
  evaluationTotal: $("evaluationTotal"),
  evaluationMax: $("evaluationMax"),
  evaluationSearchInput: $("evaluationSearchInput"),
  evaluationHistoryPartFilter: $("evaluationHistoryPartFilter"),
  evaluationHistoryEvaluatorFilter: $("evaluationHistoryEvaluatorFilter"),
  evaluationHistoryEmpty: $("evaluationHistoryEmpty"),
  evaluationHistoryTableWrap: $("evaluationHistoryTableWrap"),
  evaluationHistoryBody: $("evaluationHistoryBody"),
  skillMatrixConfig: $("skillMatrixConfig"),
  skillMatrixSummary: $("skillMatrixSummary"),
  skillMatrixSearchInput: $("skillMatrixSearchInput"),
  skillMatrixModelFilter: $("skillMatrixModelFilter"),
  skillMatrixPartFilter: $("skillMatrixPartFilter"),
  skillMatrixBandFilter: $("skillMatrixBandFilter"),
  skillMatrixTableHead: $("skillMatrixTableHead"),
  skillMatrixTableBody: $("skillMatrixTableBody"),
  skillMatrixEmpty: $("skillMatrixEmpty"),
  skillMatrixPrevPageBtn: $("skillMatrixPrevPageBtn"),
  skillMatrixNextPageBtn: $("skillMatrixNextPageBtn"),
  skillMatrixPageIndicator: $("skillMatrixPageIndicator"),
  skillMatrixExportPdfBtn: $("skillMatrixExportPdfBtn"),
  previewToolbar: $("previewToolbar")
};

const navItems = Array.from(document.querySelectorAll(".nav-item"));
const adminOnlyNodes = Array.from(document.querySelectorAll(".admin-only"));
const previewButtons = Array.from(document.querySelectorAll("[data-preview-mode]"));
const submitExamButtons = Array.from(document.querySelectorAll(".submit-exam-btn"));

const TEXT = {
  titleByView: {
    exam: "ทำข้อสอบออนไลน์",
    history: "ประวัติผลสอบ",
    profile: "ข้อมูลพนักงาน",
    evaluation: "ประเมินผลหน้างาน",
    admin: "จัดการคลังข้อสอบ"
  },
  evaluators: [
    "206006 - ผู้ประเมิน",
    "206018 - ผู้ประเมิน",
    "206022 - ผู้ประเมิน"
  ],
  evaluationRows: [
    {
      title: "การเตรียมตัวก่อนปฏิบัติงาน\nการเตรียมงานและเอกสาร รวมถึงการตรวจเช็กอุปกรณ์ก่อนเริ่มงาน",
      method: "สังเกต",
      maxScore: 4,
      weight: 1
    },
    {
      title: "ปริมาณงาน\nทำงานได้ตามเป้าหมายภายในเวลาที่กำหนด และรักษาความต่อเนื่องของการทำงาน",
      method: "ตรวจงาน",
      maxScore: 4,
      weight: 3
    },
    {
      title: "คุณภาพงาน\nผลงานมีความถูกต้อง ครบถ้วน และเป็นไปตามมาตรฐานการทำงาน",
      method: "ประเมิน",
      maxScore: 4,
      weight: 5
    },
    {
      title: "การตอบสนองต่อปัญหา\nสามารถแก้ไขปัญหาเบื้องต้นและปฏิบัติตามขั้นตอนเมื่อพบความผิดปกติได้เหมาะสม",
      method: "สัมภาษณ์",
      maxScore: 4,
      weight: 6
    }
  ],
  evaluationSectionTitle: "ส่วนที่ 1 : การปฏิบัติงาน และ ความร่วมมือ"
};

TEXT.titleByView.skillMatrix = "Skill Matrix";

const SKILL_MATRIX_CONFIG = {
  examWeight: 40,
  evaluationWeight: 60,
  totalWeight: 100,
  pageSize: 7,
  skillBands: [
    { min: 0, max: 25, skillPct: 0, color: "transparent", label: "0%" },
    { min: 26, max: 50, skillPct: 50, color: "#dc2626", label: "50%" },
    { min: 51, max: 75, skillPct: 75, color: "#f59e0b", label: "75%" },
    { min: 76, max: 100, skillPct: 100, color: "#16a34a", label: "100%" }
  ]
};

const state = {
  user: null,
  authToken: "",
  bank: { title: "Factory Online Exam", source: "default", examSets: [] },
  groupedExams: new Map(),
  selectedModelCode: "",
  selectedExamId: "",
  currentExam: null,
  currentQuestionIndex: 0,
  answers: [],
  submitted: false,
  results: [],
  employees: [],
  evaluations: [],
  activeView: "exam",
  skillMatrixPage: 0,
  adminSaving: false,
  adminSaveStatus: { kind: "", message: "" },
  adminEditor: {
    draft: null,
    selectedModelCode: "",
    selectedExamId: "",
    newModelName: "",
    newPartCode: "",
    newPartTitle: ""
  }
};

function showMessage(element, message, isError = false) {
  if (!element) return;
  element.textContent = message || "";
  element.classList.toggle("hidden", !message);
  element.classList.toggle("error", Boolean(message && isError));
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

let toastTimer = null;

function showToast(message, kind = "info", duration = 2600) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "app-toast hidden";
    document.body.appendChild(toast);
  }
  toast.className = `app-toast app-toast-${kind}`;
  toast.textContent = message || "";
  clearTimeout(toastTimer);
  requestAnimationFrame(() => {
    toast.classList.remove("hidden");
    toast.classList.add("is-visible");
  });
  if (duration > 0) {
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.classList.add("hidden");
    }, duration);
  }
}

function setAdminSaveStatus(kind = "", message = "") {
  state.adminSaveStatus = { kind, message };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("อ่านไฟล์รูปไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

function selectAdminExamById(examId) {
  if (!examId) return;
  const exam = state.adminEditor.draft?.examSets?.find((item) => item.id === examId);
  if (!exam) return;
  state.adminEditor.selectedModelCode = String(exam.modelCode || "");
  state.adminEditor.selectedExamId = exam.id;
  state.adminEditor.newModelName = String(exam.modelName || "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updatePreviewAccess() {
  if (!els.previewToolbar) return;
  const isAdmin = state.user?.role === "admin";
  els.previewToolbar.classList.toggle("hidden", !isAdmin);
}

function applyPreviewMode(mode = "auto") {
  const safeMode = ["auto", "mobile", "tablet"].includes(mode) ? mode : "auto";
  if (safeMode === "auto") {
    document.body.removeAttribute("data-preview-mode");
  } else {
    document.body.setAttribute("data-preview-mode", safeMode);
  }
  previewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.previewMode === safeMode);
  });
  window.localStorage.setItem(STORAGE_KEYS.previewMode, safeMode);
}

function roleLabel(role) {
  return role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน";
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatMinutes(minutes) {
  return `${Number(minutes) || 0} นาที`;
}

function openPrintWindow(title, content) {
  const printWindow = window.open("", "_blank", "width=1440,height=960");
  if (!printWindow) {
    window.alert("ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาอนุญาต pop-up แล้วลองใหม่อีกครั้ง");
    return null;
  }
  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.document.title = title;
  return printWindow;
}

function exportSkillMatrixPdf() {
  if (state.user?.role !== "admin") return;
  const tableHead = els.skillMatrixTableHead?.innerHTML || "";
  const tableBody = els.skillMatrixTableBody?.innerHTML || "";
  if (!tableHead.trim() || !tableBody.trim()) {
    window.alert("ไม่มีข้อมูลสำหรับ Export PDF");
    return;
  }

  const selectedModel = els.skillMatrixModelFilter?.selectedOptions?.[0]?.textContent?.trim() || "ทุก Model";
  const selectedPart = els.skillMatrixPartFilter?.selectedOptions?.[0]?.textContent?.trim() || "ทุก Part";
  const selectedBand = els.skillMatrixBandFilter?.selectedOptions?.[0]?.textContent?.trim() || "ทุกระดับทักษะ";
  const searchValue = String(els.skillMatrixSearchInput?.value || "").trim() || "-";
  const summaryCards = Array.from(els.skillMatrixSummary?.querySelectorAll(".stat-box") || []).map((card) => ({
    label: card.querySelector("span")?.textContent?.trim() || "",
    value: card.querySelector("strong")?.textContent?.trim() || ""
  }));
  const exportedAt = new Date().toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const summaryHtml = summaryCards.map((item) => `
    <div class="summary-card">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </div>
  `).join("");

  const html = `<!doctype html>
  <html lang="th">
    <head>
      <meta charset="utf-8" />
      <title>Skill Matrix Export</title>
      <style>
        :root {
          color-scheme: light;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 24px;
          font-family: "Segoe UI", Tahoma, sans-serif;
          color: #102033;
          background: #ffffff;
        }
        .sheet {
          display: grid;
          gap: 18px;
        }
        .sheet-head {
          display: grid;
          gap: 8px;
        }
        .sheet-head h1 {
          margin: 0;
          font-size: 28px;
        }
        .meta,
        .summary {
          display: grid;
          gap: 12px;
        }
        .meta {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .meta-card,
        .summary-card {
          border: 1px solid #d8e2ec;
          border-radius: 14px;
          padding: 12px 14px;
          background: #f8fbff;
        }
        .meta-card span,
        .summary-card span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 6px;
        }
        .meta-card strong,
        .summary-card strong {
          font-size: 18px;
        }
        .summary {
          grid-template-columns: repeat(${Math.max(summaryCards.length, 1)}, minmax(0, 1fr));
        }
        .table-wrap {
          overflow: visible;
          border: 1px solid #d8e2ec;
          border-radius: 18px;
        }
        table {
          width: 100%;
          min-width: 1200px;
          border-collapse: collapse;
        }
        th,
        td {
          border-bottom: 1px solid #e3ebf3;
          padding: 10px 12px;
          vertical-align: middle;
          text-align: left;
        }
        thead th {
          background: #eef5fb;
          color: #314766;
          font-size: 13px;
        }
        tbody tr:nth-child(even) td {
          background: #fbfdff;
        }
        .employee-avatar {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          object-fit: cover;
          display: block;
        }
        .employee-avatar.placeholder {
          display: grid;
          place-items: center;
          background: #e8eff6;
          color: #44556f;
          font-weight: 700;
        }
        .skill-circle-card {
          display: grid;
          justify-items: center;
          gap: 4px;
        }
        .skill-circle {
          --skill-color: #dbe5f0;
          --skill-value: 0;
          width: 50px;
          height: 50px;
          margin-inline: auto;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            radial-gradient(closest-side, #ffffff 67%, transparent 68% 100%),
            conic-gradient(var(--skill-color) calc(var(--skill-value) * 1%), #e8eef5 0);
          border: 1px solid #dbe5f0;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.9);
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .skill-circle span {
          font-weight: 800;
          color: #18324a;
          font-size: 12px;
        }
        .skill-circle-meta {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }
        .print-note {
          color: #64748b;
          font-size: 12px;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            padding: 12px;
          }
          .table-wrap {
            overflow: visible;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <main class="sheet">
        <section class="sheet-head">
          <h1>Skill Matrix</h1>
          <div class="print-note">วันที่ส่งออก ${escapeHtml(exportedAt)}</div>
        </section>
        <section class="meta">
          <div class="meta-card"><span>ค้นหา</span><strong>${escapeHtml(searchValue)}</strong></div>
          <div class="meta-card"><span>Model</span><strong>${escapeHtml(selectedModel)}</strong></div>
          <div class="meta-card"><span>Part</span><strong>${escapeHtml(selectedPart)}</strong></div>
          <div class="meta-card"><span>ระดับ Skill</span><strong>${escapeHtml(selectedBand)}</strong></div>
        </section>
        <section class="summary">${summaryHtml}</section>
        <section class="table-wrap">
          <table>
            <thead>${tableHead}</thead>
            <tbody>${tableBody}</tbody>
          </table>
        </section>
      </main>
      <script>
        window.addEventListener("load", () => {
          setTimeout(() => {
            window.print();
          }, 300);
        });
        window.addEventListener("afterprint", () => {
          window.close();
        });
      </script>
    </body>
  </html>`;

  openPrintWindow("Skill Matrix Export", html);
}

async function api(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (state.authToken) {
    headers.Authorization = `Bearer ${state.authToken}`;
  }

  const response = await fetch(url, {
    headers,
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "ไม่สามารถดำเนินการกับเซิร์ฟเวอร์ได้");
  }
  return data;
}
function groupExamSets(examSets) {
  const grouped = new Map();
  examSets.forEach((exam) => {
    const key = exam.modelCode || "UNKNOWN";
    if (!grouped.has(key)) {
      grouped.set(key, {
        modelCode: key,
        modelName: exam.modelName || key,
        exams: []
      });
    }
    grouped.get(key).exams.push(exam);
  });
  return grouped;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function ensureAdminDraft() {
  if (!state.adminEditor.draft) {
    const models = Array.from(
      new Map(
        (state.bank.examSets || []).map((exam) => {
          const modelCode = String(exam.modelCode || exam.modelName || "").trim();
          return [modelCode, { modelCode, modelName: String(exam.modelName || modelCode).trim() }];
        })
      ).values()
    ).filter((model) => model.modelCode);

    state.adminEditor.draft = {
      title: state.bank.title || "Factory Online Exam",
      examSets: deepClone(state.bank.examSets || []),
      models
    };
  }

  const groups = getAdminDraftGroups();
  const selectedGroup = groups.get(state.adminEditor.selectedModelCode) || Array.from(groups.values())[0];
  state.adminEditor.selectedModelCode = selectedGroup?.modelCode || "";
  state.adminEditor.selectedExamId = selectedGroup?.exams?.some((exam) => exam.id === state.adminEditor.selectedExamId)
    ? state.adminEditor.selectedExamId
    : (selectedGroup?.exams?.[0]?.id || "");
}

function syncAdminDraftFromBank() {
  const models = Array.from(
    new Map(
      (state.bank.examSets || []).map((exam) => {
        const modelCode = String(exam.modelCode || exam.modelName || "").trim();
        return [modelCode, { modelCode, modelName: String(exam.modelName || modelCode).trim() }];
      })
    ).values()
  ).filter((model) => model.modelCode);

  state.adminEditor.draft = {
    title: state.bank.title || "Factory Online Exam",
    examSets: deepClone(state.bank.examSets || []),
    models
  };
  const firstExam = state.adminEditor.draft.examSets[0] || null;
  state.adminEditor.selectedModelCode = firstExam?.modelCode || models[0]?.modelCode || "";
  state.adminEditor.selectedExamId = firstExam?.id || "";
}

function getAdminDraftGroups() {
  const grouped = groupExamSets(state.adminEditor.draft?.examSets || []);
  (state.adminEditor.draft?.models || []).forEach((model) => {
    const modelCode = String(model.modelCode || model.modelName || "").trim();
    if (!modelCode || grouped.has(modelCode)) return;
    grouped.set(modelCode, {
      modelCode,
      modelName: String(model.modelName || modelCode).trim(),
      exams: []
    });
  });
  return grouped;
}

function getAdminSelectedExam() {
  ensureAdminDraft();
  return state.adminEditor.draft.examSets.find((exam) => exam.id === state.adminEditor.selectedExamId) || null;
}

function createBlankQuestion(nextNumber) {
  return {
    id: makeId("Q"),
    number: nextNumber,
    text: "",
    imageUrl: null,
    choiceKeys: ["A", "B", "C", "D"],
    choices: ["", "", "", ""],
    answer: 0,
    score: 1
  };
}

function createBlankExam(modelCode, modelName, partCode, title) {
  return {
    id: makeId("PART"),
    title,
    description: modelName || "",
    modelCode,
    modelName,
    partCode,
    durationMinutes: 10,
    passScore: 0,
    randomizeQuestions: false,
    showResultImmediately: true,
    questions: [createBlankQuestion(1)]
  };
}

function getSelectedExam() {
  return state.bank.examSets.find((exam) => exam.id === state.selectedExamId) || null;
}

function getNextExamInCurrentModel() {
  const currentGroup = state.groupedExams.get(state.selectedModelCode);
  const exams = currentGroup?.exams || [];
  const currentIndex = exams.findIndex((exam) => exam.id === state.selectedExamId);
  if (currentIndex >= 0 && exams[currentIndex + 1]) {
    return exams[currentIndex + 1];
  }

  const allExams = state.bank.examSets || [];
  const globalIndex = allExams.findIndex((exam) => exam.id === state.selectedExamId);
  if (globalIndex < 0) return null;
  return allExams[globalIndex + 1] || null;
}

function resetExamSession() {
  state.currentQuestionIndex = 0;
  state.currentExam = getSelectedExam();
  state.answers = state.currentExam ? new Array(state.currentExam.questions.length).fill(null) : [];
  state.submitted = false;
  els.resultPanel.classList.add("hidden");
  if (els.nextPartBtn) {
    els.nextPartBtn.disabled = true;
    els.nextPartBtn.textContent = "Next Part";
  }
  renderExamMeta();
  renderQuestion();
  renderQuestionNav();
  updateExamStatus();
}

function setView(view) {
  state.activeView = view;
  const views = {
    exam: els.examView,
    history: els.historyView,
    profile: els.profileView,
    skillMatrix: els.skillMatrixView,
    evaluation: els.evaluationView,
    admin: els.adminView
  };

  Object.entries(views).forEach(([key, node]) => {
    node.classList.toggle("hidden", key !== view);
  });

  if (els.topbar) {
    els.topbar.classList.toggle("hidden", view === "exam");
  }

  navItems.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  setText(els.pageHeading, TEXT.titleByView[view] || "Factory Online Exam");

  if (view === "history") {
    renderHistory();
  } else if (view === "profile") {
    renderProfile();
  } else if (view === "skillMatrix") {
    renderSkillMatrix();
  } else if (view === "evaluation") {
    renderEvaluationForm();
    renderEvaluationHistory();
  } else if (view === "admin") {
    renderAdminInfo();
  }
}

function updateUserPanel() {
  const user = state.user;
  if (!user) return;

  setText(els.sidebarUserName, user.fullName || user.username || "-");
  setText(els.sidebarUserRole, `บทบาท: ${roleLabel(user.role)}`);
  setText(els.sidebarUserId, `รหัสพนักงาน: ${user.employeeCode || "-"}`);

  const isAdmin = user.role === "admin";
  adminOnlyNodes.forEach((node) => node.classList.toggle("hidden", !isAdmin));
  updatePreviewAccess();
}

function renderBankSummary() {
  const examCount = state.bank.examSets.length;
  setText(
    els.dataSourceLabel,
    state.bank.source === "custom" ? "ใช้คลังข้อสอบแบบอัปโหลด" : "ใช้คลังข้อสอบหลักของระบบ"
  );
  setText(els.dataSummaryLabel, `${examCount} ชุดข้อสอบ`);
  setText(els.systemTitle, state.bank.title || "Factory Online Exam");
}

function renderModelSelector() {
  const groups = Array.from(state.groupedExams.values());
  els.modelSelector.innerHTML = `
    <label class="field exam-select-field">
      <span>เลือก Model</span>
      <select id="examModelDropdown" class="exam-select-dropdown">
        ${groups.map((group) => `
          <option value="${group.modelCode}" ${group.modelCode === state.selectedModelCode ? "selected" : ""}>
            ${group.modelName} (${group.exams.length} Part)
          </option>
        `).join("")}
      </select>
    </label>
  `;

  const dropdown = document.getElementById("examModelDropdown");
  if (dropdown) {
    dropdown.addEventListener("change", (event) => {
      const nextModelCode = event.target.value;
      const nextGroup = state.groupedExams.get(nextModelCode);
      state.selectedModelCode = nextModelCode;
      state.selectedExamId = nextGroup?.exams?.[0]?.id || "";
      resetExamSession();
      renderSelectors();
    });
  }
}

function renderExamSelector() {
  const currentGroup = state.groupedExams.get(state.selectedModelCode);
  const exams = currentGroup?.exams || [];
  const selectedExam = exams.find((exam) => exam.id === state.selectedExamId) || exams[0] || null;

  if (!exams.length) {
    els.examSelector.innerHTML = `<div class="exam-empty-state">ยังไม่มีข้อสอบใน Model ที่เลือก</div>`;
  } else {
    els.examSelector.innerHTML = `
      <div class="exam-select-stack">
        <label class="field exam-select-field">
          <span>เลือก Part</span>
          <select id="examPartDropdown" class="exam-select-dropdown">
            ${exams.map((exam) => `
              <option value="${exam.id}" ${exam.id === state.selectedExamId ? "selected" : ""}>
                ${exam.partCode || "-"} - ${exam.title || "ยังไม่ตั้งชื่อชุดข้อสอบ"}
              </option>
            `).join("")}
          </select>
        </label>
        <div class="exam-select-summary">
          <div class="exam-select-summary-head">
            <strong>${selectedExam?.title || selectedExam?.partCode || "ยังไม่ตั้งชื่อชุดข้อสอบ"}</strong>
            <span>${selectedExam?.partCode || "-"}</span>
          </div>
          <div class="exam-tags exam-library-card-tags">
            <span>${selectedExam?.modelName || selectedExam?.modelCode || "-"}</span>
            <span>${(selectedExam?.questions || []).length} ข้อ</span>
            <span>${formatMinutes(selectedExam?.durationMinutes)}</span>
          </div>
        </div>
      </div>
    `;

    const dropdown = document.getElementById("examPartDropdown");
    if (dropdown) {
      dropdown.addEventListener("change", (event) => {
        state.selectedExamId = event.target.value;
        resetExamSession();
        renderSelectors();
      });
    }
  }

  const count = exams.length;
  showMessage(
    els.loadStatus,
    count
      ? `พบข้อสอบ ${count} ชุดใน Model นี้ | ชุดปัจจุบัน: ${state.currentExam?.title || "-"}`
      : "ยังไม่มีข้อสอบในระบบ"
  );
}

function renderSelectors() {
  if (!els.modelSelector || !els.examSelector) return;

  state.currentExam = getSelectedExam();
  renderModelSelector();
  renderExamSelector();
}

function renderExamMeta() {
  const exam = state.currentExam;
  const questionCount = exam?.questions?.length || 0;

  setText(els.examTitle, exam?.title || "ยังไม่ได้เลือกชุดข้อสอบ");
  setText(els.examDescription, exam?.description || "-");
  setText(els.examMetaQuestions, `${questionCount} ข้อ`);
  setText(els.examMetaTime, formatMinutes(exam?.durationMinutes));
  setText(els.examMetaPassScore, `ผ่าน ${Number(exam?.passScore) || 0} คะแนน`);
  setText(els.answeredCount, `${state.answers.filter((value) => value !== null && value !== undefined).length} / ${questionCount}`);
}

function updateExamStatus() {
  const exam = state.currentExam;
  const questionCount = exam?.questions?.length || 0;
  const answeredCount = state.answers.filter((value) => value !== null && value !== undefined).length;
  const progress = questionCount ? Math.round((answeredCount / questionCount) * 100) : 0;

  setText(els.progressPercent, `${progress}%`);
  els.progressBar.style.width = `${progress}%`;
  setText(els.answeredCount, `${answeredCount} / ${questionCount}`);

  let statusText = "ยังไม่ได้เลือกชุดข้อสอบ";
  if (state.submitted) {
    statusText = "ส่งข้อสอบแล้ว";
  } else if (exam) {
    statusText = "กำลังทำข้อสอบ";
  }

  setText(els.summaryStatus, statusText);
  submitExamButtons.forEach((button) => {
    button.disabled = !exam || state.submitted;
  });
}

function renderQuestion() {
  const exam = state.currentExam;
  const question = exam?.questions?.[state.currentQuestionIndex];
  if (!question) {
    setText(els.questionTitle, "ข้อ 0");
    setText(els.questionText, "ยังไม่มีคำถามสำหรับชุดข้อสอบนี้");
    setText(els.questionBadge, "ยังไม่ได้เลือกคำตอบ");
    els.questionImage.classList.add("hidden");
    els.choicesContainer.innerHTML = "";
    updateExamStatus();
    return;
  }

  const selectedAnswer = state.answers[state.currentQuestionIndex];
  setText(els.questionTitle, `ข้อ ${question.number || state.currentQuestionIndex + 1}`);
  setText(els.questionText, question.text || "-");
  setText(
    els.questionBadge,
    selectedAnswer === null || selectedAnswer === undefined
      ? "ยังไม่ได้เลือกคำตอบ"
      : `เลือกข้อ ${question.choiceKeys?.[selectedAnswer] || selectedAnswer + 1} แล้ว`
  );

  if (question.imageUrl) {
    els.questionImage.src = question.imageUrl;
    els.questionImage.classList.remove("hidden");
  } else {
    els.questionImage.removeAttribute("src");
    els.questionImage.classList.add("hidden");
  }

  els.choicesContainer.innerHTML = "";
  (question.choices || []).forEach((choice, index) => {
    const label = document.createElement("label");
    label.className = "choice-item";
    if (selectedAnswer === index) {
      label.classList.add("selected");
    }
    label.innerHTML = `
      <input type="radio" name="question-choice" ${selectedAnswer === index ? "checked" : ""} />
      <span>${question.choiceKeys?.[index] || index + 1}. ${choice}</span>
    `;
    label.addEventListener("click", () => {
      state.answers[state.currentQuestionIndex] = index;
      renderQuestion();
      renderQuestionNav();
      updateExamStatus();
    });
    els.choicesContainer.appendChild(label);
  });

  els.prevBtn.disabled = state.currentQuestionIndex <= 0;
  els.nextBtn.disabled = state.currentQuestionIndex >= (exam.questions.length - 1);
  updateExamStatus();
}

function renderQuestionNav() {
  if (!els.questionNav) return;
  const exam = state.currentExam;
  els.questionNav.innerHTML = "";
  (exam?.questions || []).forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nav-chip";
    if (index === state.currentQuestionIndex) {
      button.classList.add("current");
    }
    if (state.answers[index] !== null && state.answers[index] !== undefined) {
      button.classList.add("answered");
    }
    button.textContent = question.number || index + 1;
    button.addEventListener("click", () => {
      state.currentQuestionIndex = index;
      renderQuestion();
      renderQuestionNav();
    });
    els.questionNav.appendChild(button);
  });
}

async function submitExam() {
  if (!state.currentExam || state.submitted) return;

  const exam = state.currentExam;

  try {
    const response = await api("/api/results", {
      method: "POST",
      body: JSON.stringify({
        examId: exam.id,
        answers: state.answers
      })
    });
    state.submitted = true;
    renderResult(response.result);
    await loadResults();
  } catch (error) {
    showMessage(els.loadStatus, `ส่งข้อสอบไม่สำเร็จ: ${error.message}`, true);
  }
}

function renderResult(result) {
  els.resultPanel.classList.remove("hidden");
  setText(els.scoreValue, `${result.score} / ${result.total_score}`);
  setText(els.scorePercent, `${result.percent}%`);
  setText(els.correctCount, `ตอบถูก ${result.correct_count} ข้อ`);
  setText(els.wrongCount, `ตอบผิด ${result.wrong_count} ข้อ`);
  els.resultMessage.textContent = result.passed
    ? `ผ่านเกณฑ์แล้ว: ตอบถูก ${result.correct_count} ข้อ จาก ${result.question_count} ข้อ`
    : `ยังไม่ผ่านเกณฑ์: ตอบถูก ${result.correct_count} ข้อ จาก ${result.question_count} ข้อ`;
  const nextExam = getNextExamInCurrentModel();
  if (els.nextPartBtn) {
    els.nextPartBtn.disabled = !nextExam;
    els.nextPartBtn.textContent = nextExam
      ? `Next Part: ${nextExam.partCode || nextExam.title || "ถัดไป"}`
      : "ยังไม่มี Part ถัดไป";
  }
  showMessage(els.loadStatus, "ส่งข้อสอบเรียบร้อยแล้ว");
  updateExamStatus();
}

async function loadExams() {
  showMessage(els.loadStatus, "กำลังโหลดชุดข้อสอบ...");
  try {
    const payload = await api("/api/exams");
    state.bank = payload;
    syncAdminDraftFromBank();
    state.groupedExams = groupExamSets(payload.examSets || []);

    const firstGroup = Array.from(state.groupedExams.values())[0];
    state.selectedModelCode = firstGroup?.modelCode || "";
    state.selectedExamId = firstGroup?.exams?.[0]?.id || "";
    renderBankSummary();
    resetExamSession();
    renderSelectors();
  } catch (error) {
    state.bank = { title: "Factory Online Exam", source: "default", examSets: [] };
    syncAdminDraftFromBank();
    state.groupedExams = new Map();
    state.selectedModelCode = "";
    state.selectedExamId = "";
    resetExamSession();
    showMessage(els.loadStatus, `โหลดชุดข้อสอบไม่สำเร็จ: ${error.message}`, true);
  }
}

function renderHistory() {
  const results = state.results;
  const total = results.length;
  const avgPercent = total
    ? Math.round(results.reduce((sum, item) => sum + Number(item.percent || 0), 0) / total)
    : 0;
  const passedCount = results.filter((item) => item.passed).length;

  els.historyStats.innerHTML = `
    <div class="stat-box"><span>รายการทั้งหมด</span><strong>${total}</strong></div>
    <div class="stat-box"><span>จำนวนครั้งที่ทำ</span><strong>${total}</strong></div>
    <div class="stat-box"><span>คะแนนเฉลี่ย</span><strong>${avgPercent}%</strong></div>
    <div class="stat-box"><span>ผ่านเกณฑ์</span><strong>${passedCount}</strong></div>
  `;

  if (!total) {
    els.historyList.innerHTML = `<div class="inline-message">ยังไม่มีประวัติผลสอบในระบบ</div>`;
    return;
  }

  els.historyList.innerHTML = results
    .map((item) => {
      const title = state.user?.role === "admin"
        ? `${item.full_name || item.username} (${item.employee_code || "-"})`
        : (item.exam_title || item.part_code || "-");
      return `
        <article class="history-card">
          <div>
            <strong>${title}</strong>
            <p>${item.model_name || "-"} / ${item.part_code || "-"}</p>
            <p>${formatDateTime(item.submitted_at)}</p>
          </div>
          <div class="history-score ${item.passed ? "pass" : "fail"}">
            <strong>${item.percent}%</strong>
            <span>${item.passed ? "ผ่าน" : "ไม่ผ่าน"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProfile() {
  const user = state.user;
  if (!user) return;

  const latest = state.results[0];
  setText(els.profileUserName, user.fullName || "-");
  setText(els.profileEmployeeCode, user.employeeCode || "-");
  setText(els.profileUserRole, roleLabel(user.role));
  setText(els.profileDepartment, user.department || "-");
  setText(els.profilePosition, user.position || "-");
  setText(els.profileExamCount, String(state.results.length));
  setText(
    els.profileLastScore,
    latest ? `${latest.score}/${latest.total_score} (${latest.percent}%)` : "-"
  );
}

function getSkillBand(percent) {
  return SKILL_MATRIX_CONFIG.skillBands.find(
    (band) => percent >= Number(band.min) && percent <= Number(band.max)
  ) || SKILL_MATRIX_CONFIG.skillBands[0];
}

function buildSkillMatrixRows() {
  if (state.user?.role !== "admin") return [];

  const employees = Array.isArray(state.employees) ? state.employees : [];
  const allResults = Array.isArray(state.results) ? state.results : [];
  const evaluations = Array.isArray(state.evaluations) ? state.evaluations : [];
  const latestResultMap = new Map();
  const latestEvaluationMap = new Map();

  allResults.forEach((result) => {
    const key = `${result.employee_code || result.employeeCode || ""}::${result.part_code || result.partCode || ""}`;
    const current = latestResultMap.get(key);
    if (!current || new Date(result.submitted_at || 0).getTime() > new Date(current.submitted_at || 0).getTime()) {
      latestResultMap.set(key, result);
    }
  });

  evaluations.forEach((evaluation) => {
    const key = `${evaluation.employeeCode || ""}::${evaluation.partCode || ""}`;
    const current = latestEvaluationMap.get(key);
    if (!current || new Date(evaluation.updatedAt || 0).getTime() > new Date(current.updatedAt || 0).getTime()) {
      latestEvaluationMap.set(key, evaluation);
    }
  });

  const keys = new Set([...latestResultMap.keys(), ...latestEvaluationMap.keys()]);
  const rows = [];

  keys.forEach((key) => {
    const [employeeCode, partCode] = key.split("::");
    const result = latestResultMap.get(key) || null;
    const evaluation = latestEvaluationMap.get(key) || null;
    const employee = employees.find((item) => item.employeeCode === employeeCode);
    const examPercent = Number(result?.percent || 0);
    const evaluationPercent = evaluation
      ? Math.round((Number(evaluation.totalScore || 0) / Math.max(Number(evaluation.maxScore || 0), 1)) * 100)
      : 0;
    const finalPercent = Math.round(
      ((examPercent * SKILL_MATRIX_CONFIG.examWeight) + (evaluationPercent * SKILL_MATRIX_CONFIG.evaluationWeight))
      / SKILL_MATRIX_CONFIG.totalWeight
    );
    const band = getSkillBand(finalPercent);

    rows.push({
      employeeCode,
      employeeName: employee?.fullName || result?.full_name || evaluation?.employeeName || employeeCode,
      department: employee?.department || "",
      modelName: result?.model_name || evaluation?.modelName || "",
      partName: result?.exam_title || evaluation?.partName || partCode,
      examPercent,
      evaluationPercent,
      finalPercent,
      skillPct: band.skillPct,
      bandLabel: band.label,
      bandColor: band.color,
      hasExam: Boolean(result),
      hasEvaluation: Boolean(evaluation),
      status: result && evaluation ? "มีข้อมูลครบ" : result ? "รอประเมินหน้างาน" : "ยังไม่มีข้อมูลการสอบ"
    });
  });

  return rows.sort((left, right) => {
    const employeeCompare = String(left.employeeName || "").localeCompare(String(right.employeeName || ""), "th");
    if (employeeCompare !== 0) return employeeCompare;
    const modelCompare = String(left.modelName || "").localeCompare(String(right.modelName || ""), "en");
    if (modelCompare !== 0) return modelCompare;
    return String(left.partName || "").localeCompare(String(right.partName || ""), "en");
  });
}

function renderSkillMatrix() {
  if (state.user?.role !== "admin") return;

  const rows = buildSkillMatrixRows();
  const searchValue = String(els.skillMatrixSearchInput?.value || "").trim().toLowerCase();
  const selectedModel = String(els.skillMatrixModelFilter?.value || "");
  const selectedPart = String(els.skillMatrixPartFilter?.value || "");
  const selectedBand = String(els.skillMatrixBandFilter?.value || "");
  const modelOptions = [...new Set(rows.map((row) => row.modelName).filter(Boolean))];
  const partOptions = [...new Set(rows.map((row) => row.partName).filter(Boolean))];

  if (els.skillMatrixModelFilter) {
    els.skillMatrixModelFilter.innerHTML = `<option value="">ทุก Model</option>${modelOptions
      .map((item) => `<option value="${item}" ${item === selectedModel ? "selected" : ""}>${item}</option>`)
      .join("")}`;
  }

  if (els.skillMatrixPartFilter) {
    els.skillMatrixPartFilter.innerHTML = `<option value="">ทุก Part</option>${partOptions
      .map((item) => `<option value="${item}" ${item === selectedPart ? "selected" : ""}>${item}</option>`)
      .join("")}`;
  }

  if (els.skillMatrixBandFilter && !els.skillMatrixBandFilter.options.length) {
    els.skillMatrixBandFilter.innerHTML = [
      `<option value="">ทุกระดับทักษะ</option>`,
      ...SKILL_MATRIX_CONFIG.skillBands.map((band) => `<option value="${band.skillPct}">${band.label}</option>`)
    ].join("");
  }

  const filteredRows = rows.filter((row) => {
    const matchesSearch = !searchValue
      || String(row.employeeCode || "").toLowerCase().includes(searchValue)
      || String(row.employeeName || "").toLowerCase().includes(searchValue);
    const matchesModel = !selectedModel || row.modelName === selectedModel;
    const matchesPart = !selectedPart || row.partName === selectedPart;
    const matchesBand = !selectedBand || String(row.skillPct) === selectedBand;
    return matchesSearch && matchesModel && matchesPart && matchesBand;
  });

  const completeCount = filteredRows.filter((row) => row.hasExam && row.hasEvaluation).length;
  const avgFinal = filteredRows.length
    ? Math.round(filteredRows.reduce((sum, row) => sum + row.finalPercent, 0) / filteredRows.length)
    : 0;
  const readyCount = filteredRows.filter((row) => row.skillPct >= 75).length;

  if (els.skillMatrixConfig) {
    els.skillMatrixConfig.innerHTML = `
      <span>Exam ${SKILL_MATRIX_CONFIG.examWeight}%</span>
      <span>Evaluation ${SKILL_MATRIX_CONFIG.evaluationWeight}%</span>
      <span>Total ${SKILL_MATRIX_CONFIG.totalWeight}%</span>
    `;
  }

  if (els.skillMatrixSummary) {
    els.skillMatrixSummary.innerHTML = `
      <div class="stat-box"><span>พนักงานที่แสดง</span><strong>${filteredRows.length}</strong></div>
      <div class="stat-box"><span>มีข้อมูลครบ</span><strong>${completeCount}</strong></div>
      <div class="stat-box"><span>คะแนน Final เฉลี่ย</span><strong>${avgFinal}%</strong></div>
      <div class="stat-box"><span>Skill 75% ขึ้นไป</span><strong>${readyCount}</strong></div>
    `;
  }

  if (els.skillMatrixTableBody) {
    els.skillMatrixTableBody.innerHTML = filteredRows.map((row) => `
      <tr>
        <td>
          <strong>${row.employeeName}</strong>
          <div class="table-subline">${row.employeeCode}${row.department ? ` · ${row.department}` : ""}</div>
        </td>
        <td>
          <strong>${row.modelName || "-"}</strong>
          <div class="table-subline">${row.partName || "-"}</div>
        </td>
        <td>${row.hasExam ? `${row.examPercent}%` : "-"}</td>
        <td>${row.hasEvaluation ? `${row.evaluationPercent}%` : "-"}</td>
        <td><strong>${row.finalPercent}%</strong></td>
        <td><span class="skill-pill" style="--skill-pill:${row.bandColor || "#cbd5e1"}">${row.bandLabel}</span></td>
        <td>${row.status}</td>
      </tr>
    `).join("");
  }

  if (els.skillMatrixEmpty) {
    els.skillMatrixEmpty.classList.toggle("hidden", filteredRows.length > 0);
  }
}

function buildSkillMatrixRows() {
  if (state.user?.role !== "admin") return { employees: [], columns: [] };

  const employees = Array.isArray(state.employees) ? state.employees : [];
  const allResults = Array.isArray(state.results) ? state.results : [];
  const evaluations = Array.isArray(state.evaluations) ? state.evaluations : [];
  const examSets = Array.isArray(state.bank?.examSets) ? state.bank.examSets : [];
  const latestResultMap = new Map();
  const latestEvaluationMap = new Map();

  allResults.forEach((result) => {
    const key = `${result.employee_code || result.employeeCode || ""}::${result.exam_id || result.examId || result.part_code || result.partCode || ""}`;
    const current = latestResultMap.get(key);
    if (!current || new Date(result.submitted_at || 0).getTime() > new Date(current.submitted_at || 0).getTime()) {
      latestResultMap.set(key, result);
    }
  });

  evaluations.forEach((evaluation) => {
    const key = `${evaluation.employeeCode || ""}::${evaluation.partCode || ""}`;
    const current = latestEvaluationMap.get(key);
    if (!current || new Date(evaluation.updatedAt || 0).getTime() > new Date(current.updatedAt || 0).getTime()) {
      latestEvaluationMap.set(key, evaluation);
    }
  });

  const columns = examSets.map((exam) => ({
    examId: String(exam.id),
    modelCode: String(exam.modelCode || ""),
    modelName: String(exam.modelName || ""),
    partCode: String(exam.partCode || ""),
    partName: String(exam.title || exam.partName || "")
  }));

  const employeeRows = employees.map((employee) => ({
    employeeCode: employee.employeeCode,
    employeeName: employee.fullName || employee.employeeCode,
    department: employee.department || "",
    position: employee.position || "",
    photoUrl: employee.photoUrl || "",
    cells: columns.map((column) => {
      const result = latestResultMap.get(`${employee.employeeCode}::${column.examId}`)
        || latestResultMap.get(`${employee.employeeCode}::${column.partCode}`)
        || null;
      const evaluation = latestEvaluationMap.get(`${employee.employeeCode}::${column.partCode}`) || null;
      const examPercent = Number(result?.percent || 0);
      const evaluationPercent = evaluation
        ? Math.round((Number(evaluation.totalScore || 0) / Math.max(Number(evaluation.maxScore || 0), 1)) * 100)
        : 0;
      const finalPercent = Math.round(
        ((examPercent * SKILL_MATRIX_CONFIG.examWeight) + (evaluationPercent * SKILL_MATRIX_CONFIG.evaluationWeight))
        / SKILL_MATRIX_CONFIG.totalWeight
      );
      const band = getSkillBand(finalPercent);

      return {
        finalPercent,
        skillPct: band.skillPct,
        bandColor: band.color,
        hasExam: Boolean(result),
        hasEvaluation: Boolean(evaluation),
        displayScore: `${finalPercent}/100`
      };
    })
  }));

  return {
    columns,
    employees: employeeRows.sort((left, right) =>
      String(left.employeeName || "").localeCompare(String(right.employeeName || ""), "th"))
  };
}

function renderSkillCircle(cell) {
  const ringColor = cell.bandColor && cell.skillPct > 0 ? cell.bandColor : "#dbe5f0";
  return `
    <div class="skill-circle-card">
      <div class="skill-circle" style="--skill-value:${cell.skillPct}; --skill-color:${ringColor};">
        <span>${cell.skillPct}%</span>
      </div>
      <div class="skill-circle-meta">${cell.displayScore}</div>
    </div>
  `;
}

function formatEmployeeMeta(employee) {
  const department = String(employee.department || "").trim() || "-";
  const position = String(employee.position || "").trim() || "-";
  return `${department} / ${position}`;
}

function getEmployeeAvatarFallback(employeeName) {
  const normalized = String(employeeName || "").trim();
  return normalized ? normalized.slice(0, 1) : "?";
}

function renderSkillMatrix() {
  if (state.user?.role !== "admin") return;

  const matrix = buildSkillMatrixRows();
  const searchValue = String(els.skillMatrixSearchInput?.value || "").trim().toLowerCase();
  const modelOptions = [...new Set(matrix.columns.map((column) => column.modelName).filter(Boolean))];
  const rawSelectedModel = String(els.skillMatrixModelFilter?.value || "");
  const selectedModel = modelOptions.includes(rawSelectedModel) ? rawSelectedModel : "";
  const partOptions = [...new Set(
    matrix.columns
      .filter((column) => !selectedModel || column.modelName === selectedModel)
      .map((column) => column.partName)
      .filter(Boolean)
  )];
  const rawSelectedPart = String(els.skillMatrixPartFilter?.value || "");
  const selectedPart = partOptions.includes(rawSelectedPart) ? rawSelectedPart : "";
  const bandOptions = SKILL_MATRIX_CONFIG.skillBands.map((band) => String(band.skillPct));
  const rawSelectedBand = String(els.skillMatrixBandFilter?.value || "");
  const selectedBand = bandOptions.includes(rawSelectedBand) ? rawSelectedBand : "";

  if (els.skillMatrixModelFilter) {
    els.skillMatrixModelFilter.innerHTML = `<option value="">ทุก Model</option>${modelOptions
      .map((item) => `<option value="${item}" ${item === selectedModel ? "selected" : ""}>${item}</option>`)
      .join("")}`;
  }

  if (els.skillMatrixPartFilter) {
    els.skillMatrixPartFilter.innerHTML = `<option value="">ทุก Part</option>${partOptions
      .map((item) => `<option value="${item}" ${item === selectedPart ? "selected" : ""}>${item}</option>`)
      .join("")}`;
  }

  if (els.skillMatrixBandFilter && !els.skillMatrixBandFilter.options.length) {
    els.skillMatrixBandFilter.innerHTML = [
      `<option value="">ทุกระดับทักษะ</option>`,
      ...SKILL_MATRIX_CONFIG.skillBands.map((band) => `<option value="${band.skillPct}">${band.label}</option>`)
    ].join("");
  }
  if (els.skillMatrixBandFilter) {
    els.skillMatrixBandFilter.value = selectedBand;
  }

  const visibleColumns = matrix.columns
    .map((column, index) => ({ ...column, index }))
    .filter((column) => (!selectedModel || column.modelName === selectedModel) && (!selectedPart || column.partName === selectedPart));
  const totalPages = Math.max(1, Math.ceil(visibleColumns.length / SKILL_MATRIX_CONFIG.pageSize));
  const safePage = Math.min(state.skillMatrixPage, totalPages - 1);
  state.skillMatrixPage = Math.max(0, safePage);
  const pageStart = state.skillMatrixPage * SKILL_MATRIX_CONFIG.pageSize;
  const pagedColumns = visibleColumns.slice(pageStart, pageStart + SKILL_MATRIX_CONFIG.pageSize);

  const filteredEmployees = matrix.employees.filter((employee) => {
    const matchesSearch = !searchValue
      || String(employee.employeeCode || "").toLowerCase().includes(searchValue)
      || String(employee.employeeName || "").toLowerCase().includes(searchValue);
    const matchesBand = !selectedBand || visibleColumns.some((column) => String(employee.cells[column.index].skillPct) === selectedBand);
    return matchesSearch && matchesBand;
  });

  const allVisibleCells = filteredEmployees.flatMap((employee) => visibleColumns.map((column) => employee.cells[column.index]));
  const completeCount = allVisibleCells.filter((cell) => cell.hasExam && cell.hasEvaluation).length;
  const avgFinal = allVisibleCells.length
    ? Math.round(allVisibleCells.reduce((sum, cell) => sum + cell.finalPercent, 0) / allVisibleCells.length)
    : 0;
  const readyCount = allVisibleCells.filter((cell) => cell.skillPct >= 75).length;

  if (els.skillMatrixConfig) {
    els.skillMatrixConfig.innerHTML = `
      <span>Exam ${SKILL_MATRIX_CONFIG.examWeight}%</span>
      <span>Evaluation ${SKILL_MATRIX_CONFIG.evaluationWeight}%</span>
      <span>Total ${SKILL_MATRIX_CONFIG.totalWeight}%</span>
      <span>พนักงานทั้งหมด ${matrix.employees.length} คน</span>
    `;
  }

  if (els.skillMatrixSummary) {
    els.skillMatrixSummary.innerHTML = `
      <div class="stat-box"><span>พนักงานที่แสดง</span><strong>${filteredEmployees.length}</strong></div>
      <div class="stat-box"><span>มีข้อมูลครบ</span><strong>${completeCount}</strong></div>
      <div class="stat-box"><span>คะแนน Final เฉลี่ย</span><strong>${avgFinal}%</strong></div>
      <div class="stat-box"><span>Skill 75% ขึ้นไป</span><strong>${readyCount}</strong></div>
    `;
  }

  if (els.skillMatrixTableHead) {
    els.skillMatrixTableHead.innerHTML = `
      <tr>
        <th class="sticky-col employee-col">ชื่อพนักงาน</th>
        <th class="sticky-col code-col">รหัส</th>
        <th class="sticky-col photo-col">รูป</th>
        ${pagedColumns.map((column) => `
          <th class="matrix-part-head">
            <div class="matrix-part-head-inner">
              <strong>${column.modelCode}/${column.partCode}</strong>
              <div class="table-subline matrix-part-name">${column.partName}</div>
            </div>
          </th>
        `).join("")}
      </tr>
    `;
  }

  if (els.skillMatrixTableBody) {
    els.skillMatrixTableBody.innerHTML = filteredEmployees.map((employee) => `
      <tr class="skill-matrix-row">
        <td class="sticky-col employee-col">
          <div class="employee-cell-copy">
            <strong>${employee.employeeName}</strong>
            <div class="table-subline employee-subline">${formatEmployeeMeta(employee)}</div>
          </div>
        </td>
        <td class="sticky-col code-col">${employee.employeeCode}</td>
        <td class="sticky-col photo-col">
          ${employee.photoUrl
            ? `<img class="employee-avatar" src="${employee.photoUrl}" alt="${employee.employeeName}" />`
            : `<div class="employee-avatar placeholder">${getEmployeeAvatarFallback(employee.employeeName)}</div>`}
        </td>
        ${pagedColumns.map((column) => `<td class="skill-cell">${renderSkillCircle(employee.cells[column.index])}</td>`).join("")}
      </tr>
    `).join("");
  }

  if (els.skillMatrixEmpty) {
    const isEmpty = filteredEmployees.length === 0 || visibleColumns.length === 0;
    els.skillMatrixEmpty.classList.toggle("hidden", !isEmpty);
    if (isEmpty) {
      els.skillMatrixEmpty.textContent = "ไม่พบข้อมูลสำหรับเงื่อนไขที่เลือก";
    }
  }
  if (els.skillMatrixPageIndicator) {
    els.skillMatrixPageIndicator.textContent = `หน้า ${totalPages ? state.skillMatrixPage + 1 : 1} / ${totalPages}`;
  }
  if (els.skillMatrixPrevPageBtn) {
    els.skillMatrixPrevPageBtn.disabled = state.skillMatrixPage <= 0 || visibleColumns.length === 0;
  }
  if (els.skillMatrixNextPageBtn) {
    els.skillMatrixNextPageBtn.disabled = state.skillMatrixPage >= totalPages - 1 || visibleColumns.length === 0;
  }
  if (els.skillMatrixExportPdfBtn) {
    els.skillMatrixExportPdfBtn.disabled = filteredEmployees.length === 0 || visibleColumns.length === 0;
  }

}
function populateSelect(element, options, valueKey, labelKey, selectedValue = "") {
  if (!element) return;
  if (!Array.isArray(options) || !options.length) {
    element.innerHTML = `<option value="">ไม่มีข้อมูล</option>`;
    element.value = "";
    return;
  }
  element.innerHTML = options
    .map((item) => {
      const value = item[valueKey];
      const label = item[labelKey];
      const selected = String(value) === String(selectedValue) ? "selected" : "";
      return `<option value="${value}" ${selected}>${label}</option>`;
    })
    .join("");
}

function getEvaluationEmployees() {
  return (Array.isArray(state.employees) ? state.employees : [])
    .filter((employee) => String(employee?.employeeCode || "").trim())
    .sort((a, b) => String(a.employeeCode).localeCompare(String(b.employeeCode)));
}

function getEvaluationContext() {
  const employeeCode = els.evaluationEmployeeCodeSelect.value;
  const employee = state.employees.find((item) => item.employeeCode === employeeCode) || null;
  const exam = state.bank.examSets.find((item) => item.id === els.evaluationPartSelect.value) || null;
  const evaluator = els.evaluationEvaluatorSelect.value || "";
  return { employee, exam, evaluator };
}

function renderEvaluationRows(rows = TEXT.evaluationRows) {
  let total = 0;
  let max = 0;

  els.evaluationRows.innerHTML = rows
    .map((row, index) => {
      const score = Number(row.score) || 0;
      const maxScore = Number(row.maxScore) || 0;
      const weight = Number(row.weight) || 1;
      const sum = score * weight;
      total += sum;
      max += maxScore * weight;
      const scoreLevels = Array.from({ length: maxScore }, (_, levelIndex) => {
        const level = levelIndex + 1;
        return `
          <td class="evaluation-level-cell">
            <label class="evaluation-level-option">
              <input type="radio" name="evaluation-score-${index}" value="${level}" ${score === level ? "checked" : ""} data-evaluation-field="score-radio" data-row-index="${index}" />
              <span></span>
            </label>
          </td>
        `;
      }).join("");
      return `
        <tr>
          <td class="evaluation-no-cell">${index + 1}</td>
          <td class="evaluation-item-cell">
            <textarea class="evaluation-item-textarea" data-evaluation-field="title-input" data-row-index="${index}" rows="3">${row.title || ""}</textarea>
          </td>
          ${scoreLevels}
          <td class="evaluation-method-cell">
            <span class="evaluation-method-badge">${row.method || "-"}</span>
          </td>
          <td class="evaluation-score-cell">${score}</td>
          <td class="evaluation-weight-cell">
            <input class="evaluation-weight-input" type="number" min="1" max="10" step="1" value="${weight}" data-evaluation-field="weight-input" data-row-index="${index}" />
          </td>
          <td class="evaluation-total-cell">${sum}</td>
        </tr>
      `;
    })
    .join("");

  setText(els.evaluationTotal, String(total));
  setText(els.evaluationMax, String(max));

  Array.from(document.querySelectorAll("[data-evaluation-field='score-radio']")).forEach((input) => {
    input.addEventListener("change", () => {
      const index = Number(input.dataset.rowIndex);
      const maxScore = Number(TEXT.evaluationRows[index].maxScore) || 0;
      const nextValue = Math.max(1, Math.min(maxScore, Number(input.value) || 1));
      TEXT.evaluationRows[index].score = nextValue;
      renderEvaluationRows(TEXT.evaluationRows);
    });
  });

  Array.from(document.querySelectorAll("[data-evaluation-field='weight-input']")).forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.rowIndex);
      const nextValue = Math.max(1, Math.min(10, Number(input.value) || 1));
      TEXT.evaluationRows[index].weight = nextValue;
      renderEvaluationRows(TEXT.evaluationRows);
    });
  });

  Array.from(document.querySelectorAll("[data-evaluation-field='title-input']")).forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.rowIndex);
      TEXT.evaluationRows[index].title = input.value;
    });
  });
}

function renderEvaluationForm() {
  if (state.user?.role !== "admin") return;

  const employees = getEvaluationEmployees();
  if (!employees.length && state.authToken) {
    showMessage(els.evaluationMessage, "กำลังโหลดรายชื่อพนักงาน...", false);
    loadEmployees().catch((error) => {
      showMessage(els.evaluationMessage, `โหลดรายชื่อพนักงานไม่สำเร็จ: ${error.message}`, true);
    });
  }

  setText(els.evaluationSheetTitle, TEXT.evaluationSectionTitle);
  els.evaluationSectionTitle.value = TEXT.evaluationSectionTitle;
  els.evaluationSectionTitle.classList.add("evaluation-title-input");

  const models = Array.from(state.groupedExams.values()).map((group) => ({
    value: group.modelCode,
    label: group.modelName
  }));
  populateSelect(
    els.evaluationModelSelect,
    models.map((item) => ({ modelCode: item.value, modelName: item.label })),
    "modelCode",
    "modelName",
    els.evaluationModelSelect.value || models[0]?.value || ""
  );

  const currentModelCode = els.evaluationModelSelect.value || models[0]?.value || "";
  const exams = (state.groupedExams.get(currentModelCode)?.exams || []).map((exam) => ({
    id: exam.id,
    label: `${exam.partCode || "-"} - ${exam.title || exam.partName || ""}`
  }));
  populateSelect(
    els.evaluationPartSelect,
    exams.map((item) => ({ id: item.id, label: item.label })),
    "id",
    "label",
    els.evaluationPartSelect.value || exams[0]?.id || ""
  );

  populateSelect(
    els.evaluationEmployeeCodeSelect,
    employees.map((employee) => ({
      employeeCode: employee.employeeCode,
      label: employee.employeeCode
    })),
    "employeeCode",
    "label",
    els.evaluationEmployeeCodeSelect.value || employees[0]?.employeeCode || ""
  );

  populateSelect(
    els.evaluationEmployeeNameSelect,
    employees.map((employee) => ({
      employeeCode: employee.employeeCode,
      label: employee.fullName
    })),
    "employeeCode",
    "label",
    els.evaluationEmployeeNameSelect.value || employees[0]?.employeeCode || ""
  );

  populateSelect(
    els.evaluationEvaluatorSelect,
    TEXT.evaluators.map((value) => ({ value, label: value })),
    "value",
    "label",
    els.evaluationEvaluatorSelect.value || TEXT.evaluators[0]
  );

  if (!employees.length) {
    showMessage(els.evaluationMessage, "ยังไม่พบรายชื่อพนักงานสำหรับการประเมิน", true);
  } else {
    showMessage(els.evaluationMessage, "");
  }

  syncEvaluationSelectors();
  renderEvaluationRows(TEXT.evaluationRows);
}

function syncEvaluationSelectors(source = "code") {
  const selectedCode =
    source === "name" ? els.evaluationEmployeeNameSelect.value : els.evaluationEmployeeCodeSelect.value;

  els.evaluationEmployeeCodeSelect.value = selectedCode;
  els.evaluationEmployeeNameSelect.value = selectedCode;

  const { employee, exam, evaluator } = getEvaluationContext();
  setText(els.evaluationMetaCode, employee?.employeeCode || "-");
  setText(els.evaluationMetaName, employee?.fullName || "-");
  setText(
    els.evaluationMetaPart,
    exam ? `${exam.modelName || exam.modelCode} / ${exam.partCode || exam.title}` : "-"
  );
  setText(els.evaluationMetaEvaluator, evaluator || "-");
  setText(els.evaluationSelectedPart, exam?.partCode || "-");

  const latestExam = state.results.find(
    (item) =>
      item.employee_code === employee?.employeeCode &&
      item.part_code === (exam?.partCode || "")
  );
  setText(
    els.evaluationLatestExam,
    latestExam ? `${latestExam.score}/${latestExam.total_score} (${latestExam.percent}%)` : "-"
  );

  const modelPartLabel = exam ? `${exam.modelName || exam.modelCode} / ${exam.partCode || exam.title}` : "-";
  if (els.evaluationMetaPart) {
    els.evaluationMetaPart.innerHTML = `
      <span>รหัสพนักงาน: <strong>${employee?.employeeCode || "-"}</strong></span>
      <span>ชื่อพนักงาน: <strong>${employee?.fullName || "-"}</strong></span>
      <span>Model/Part: <strong>${modelPartLabel}</strong></span>
      <span>ผู้ประเมิน: <strong>${evaluator || "-"}</strong></span>
      <span>ผลสอบล่าสุด: <strong>${latestExam ? `${latestExam.score}/${latestExam.total_score} (${latestExam.percent}%)` : "-"}</strong></span>
    `;
  }
}

async function loadEmployees() {
  if (state.user?.role !== "admin") return;
  const payload = await api("/api/admin/employees");
  state.employees = Array.isArray(payload.employees) ? payload.employees : [];
  renderSkillMatrix();
  renderEvaluationForm();
}

async function loadEvaluations() {
  if (state.user?.role !== "admin") return;
  const payload = await api("/api/evaluations");
  state.evaluations = Array.isArray(payload.evaluations) ? payload.evaluations : [];
  renderSkillMatrix();
  renderEvaluationHistory();
}

function renderEvaluationHistory() {
  if (state.user?.role !== "admin") return;

  const defaultPartLabel = "ทุก Part";
  const defaultEvaluatorLabel = "ผู้ประเมินทั้งหมด";
  const partOptions = [defaultPartLabel].concat(
    Array.from(new Set(state.evaluations.map((item) => item.partCode).filter(Boolean)))
  );
  const evaluatorOptions = [defaultEvaluatorLabel].concat(
    Array.from(new Set(state.evaluations.map((item) => item.evaluator).filter(Boolean)))
  );

  els.evaluationHistoryPartFilter.innerHTML = partOptions
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("");
  els.evaluationHistoryEvaluatorFilter.innerHTML = evaluatorOptions
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("");

  const keyword = (els.evaluationSearchInput.value || "").trim().toLowerCase();
  const partFilter = els.evaluationHistoryPartFilter.value || defaultPartLabel;
  const evaluatorFilter = els.evaluationHistoryEvaluatorFilter.value || defaultEvaluatorLabel;

  const filtered = state.evaluations.filter((item) => {
    const matchedKeyword = !keyword || [
      item.employeeCode,
      item.employeeName,
      item.partCode,
      item.partName,
      item.evaluator
    ].some((entry) => String(entry || "").toLowerCase().includes(keyword));

    const matchedPart = partFilter === defaultPartLabel || item.partCode === partFilter;
    const matchedEvaluator = evaluatorFilter === defaultEvaluatorLabel || item.evaluator === evaluatorFilter;

    return matchedKeyword && matchedPart && matchedEvaluator;
  });

  els.evaluationHistoryBody.innerHTML = filtered
    .map((item) => `
      <tr>
        <td>${formatDateTime(item.updatedAt || item.createdAt)}</td>
        <td>${item.employeeName} (${item.employeeCode})</td>
        <td>${item.modelName || item.modelCode} / ${item.partCode}</td>
        <td>${item.totalScore}/${item.maxScore}</td>
        <td>${item.examScore}/${item.examTotalScore} (${item.examPercent}%)</td>
        <td>${item.evaluator}</td>
      </tr>
    `)
    .join("");

  const hasRows = filtered.length > 0;
  els.evaluationHistoryEmpty.classList.toggle("hidden", hasRows);
  els.evaluationHistoryTableWrap.classList.toggle("hidden", !hasRows);
  if (!hasRows) {
    setText(els.evaluationHistoryEmpty, "ยังไม่มีประวัติการประเมิน");
  }
}

async function saveEvaluation() {
  const { employee, exam, evaluator } = getEvaluationContext();
  if (!employee || !exam) {
    showMessage(els.evaluationMessage, "กรุณาเลือกพนักงานและ Part ที่ต้องการประเมิน", true);
    return;
  }

  const rows = TEXT.evaluationRows.map((row) => ({
    title: row.title,
    method: row.method,
    maxScore: row.maxScore,
    weight: row.weight,
    score: Number(row.score) || 0
  }));

  const totalScore = rows.reduce((sum, row) => sum + row.score * row.weight, 0);
  const maxScore = rows.reduce((sum, row) => sum + row.maxScore * row.weight, 0);

  try {
    await api("/api/evaluations", {
      method: "POST",
      body: JSON.stringify({
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        employeeName: employee.fullName,
        evaluator,
        sectionTitle: els.evaluationSectionTitle.value || TEXT.evaluationSectionTitle,
        modelCode: exam.modelCode,
        modelName: exam.modelName,
        partCode: exam.partCode,
        partName: exam.title,
        totalScore,
        maxScore,
        rows
      })
    });
    showMessage(els.evaluationMessage, "บันทึกผลประเมินเรียบร้อยแล้ว");
    await loadEvaluations();
  } catch (error) {
    showMessage(els.evaluationMessage, `บันทึกผลประเมินไม่สำเร็จ: ${error.message}`, true);
  }
}

function resetEvaluationForm() {
  TEXT.evaluationRows.forEach((row) => {
    row.score = 0;
  });
  showMessage(els.evaluationMessage, "");
  renderEvaluationRows(TEXT.evaluationRows);
  syncEvaluationSelectors();
}

function getAdminEditorRoot() {
  const panel = document.getElementById("adminPanel");
  if (!panel) return null;

  let root = document.getElementById("adminEditorRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "adminEditorRoot";
    root.className = "panel";
    root.style.marginTop = "18px";
    panel.appendChild(root);
  }
  return root;
}

function renderAdminEditor() {
  if (state.user?.role !== "admin") return;

  ensureAdminDraft();
  const root = getAdminEditorRoot();
  if (!root) return;

  const groups = Array.from(getAdminDraftGroups().values());
  const selectedExam = getAdminSelectedExam();
  const questionCount = selectedExam?.questions?.length || 0;
  const selectedGroup = groups.find((group) => group.modelCode === state.adminEditor.selectedModelCode) || groups[0];

  if (!state.adminEditor.selectedModelCode && selectedGroup) {
    state.adminEditor.selectedModelCode = selectedGroup.modelCode;
  }
  if (!state.adminEditor.newModelName && selectedGroup?.modelName) {
    state.adminEditor.newModelName = selectedGroup.modelName;
  }

  root.innerHTML = `
    <div class="panel-head">
      <div>
        <p class="card-label">Exam Builder</p>
        <h3>จัดการโครงสร้างคลังข้อสอบและแบบประเมิน</h3>
      </div>
    </div>
    <div class="admin-builder-layout">
      <div class="admin-card admin-builder-sidebar">
        <label class="field">
          <span>ชื่อคลังข้อสอบ</span>
          <input id="adminDraftTitleInput" type="text" value="${state.adminEditor.draft.title || ""}" />
        </label>
        <div class="admin-flow-card">
          <div class="admin-flow-head">
            <span class="card-label">Step 1</span>
            <strong>เพิ่ม Model ใหม่</strong>
          </div>
          <div class="admin-quick-grid admin-single-field" style="margin-top: 14px;">
            <label class="field">
              <span>ชื่อ Model</span>
              <input id="adminNewModelNameInput" type="text" value="${state.adminEditor.newModelName || ""}" placeholder="เช่น RJ08 หรือ R21" />
            </label>
          </div>
          <div class="result-actions" style="margin-top: 14px;">
            <button id="adminAddModelBtn" class="primary-btn" type="button">เพิ่ม Model</button>
          </div>
        </div>
        <div class="admin-divider"></div>
        <div class="admin-flow-card">
          <div class="admin-flow-head">
            <span class="card-label">Step 2</span>
            <strong>เพิ่ม Part ใน Model ที่เลือก</strong>
          </div>
          <div class="admin-info-list" style="margin-top: 10px;">
            <div class="mini-note">Model ที่เลือก: <strong>${selectedGroup?.modelName || "-"}</strong></div>
          </div>
          <div class="admin-quick-grid" style="margin-top: 14px;">
            <label class="field">
              <span>รหัส Part</span>
              <input id="adminNewPartCodeInput" type="text" value="${state.adminEditor.newPartCode || ""}" placeholder="เช่น P1 หรือ PART-01" />
            </label>
            <label class="field">
              <span>ชื่อ Part</span>
              <input id="adminNewPartTitleInput" type="text" value="${state.adminEditor.newPartTitle || ""}" placeholder="เช่น ความปลอดภัยพื้นฐาน หรือ ประกอบชิ้นงานเบื้องต้น" />
            </label>
          </div>
          <div class="result-actions" style="margin-top: 14px;">
            <button id="adminAddPartBtn" class="primary-btn" type="button">เพิ่ม Part</button>
          </div>
        </div>
        <div class="evaluation-grid">
          <label class="field">
            <span>เลือก Model</span>
            <select id="adminModelSelect">
              ${groups.map((group) => `<option value="${group.modelCode}" ${group.modelCode === state.adminEditor.selectedModelCode ? "selected" : ""}>${group.modelName} (${group.exams.length} Part)</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>เลือก Part ใน Model ที่เลือก</span>
            <select id="adminPartSelect">
              ${(groups.find((group) => group.modelCode === state.adminEditor.selectedModelCode)?.exams || []).map((exam) => `<option value="${exam.id}" ${exam.id === state.adminEditor.selectedExamId ? "selected" : ""}>${exam.partCode} - ${exam.title}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="admin-info-list">
          <div class="mini-note">Model ปัจจุบัน: <strong>${selectedExam?.modelName || "-"}</strong></div>
          <div class="mini-note">Part ปัจจุบัน: <strong>${selectedExam?.partCode || "-"}</strong></div>
          <div class="mini-note">จำนวนข้อสอบ: <strong>${questionCount}</strong></div>
        </div>
      </div>
      <div class="admin-builder-main">
        <div class="admin-card">
          ${selectedExam ? `
            <div class="evaluation-grid admin-part-grid">
              <label class="field">
                <span>ชื่อ Model</span>
                <input id="adminExamModelNameInput" type="text" value="${selectedExam.modelName || ""}" />
              </label>
              <label class="field">
                <span>ชื่อ Part</span>
                <input id="adminExamTitleInput" type="text" value="${selectedExam.title || ""}" />
              </label>
              <label class="field">
                <span>รหัส Part</span>
                <input id="adminExamPartCodeInput" type="text" value="${selectedExam.partCode || ""}" />
              </label>
              <label class="field">
                <span>คะแนนผ่านเกณฑ์</span>
                <input id="adminExamPassScoreInput" type="number" min="0" value="${selectedExam.passScore || 0}" />
              </label>
            </div>
            <label class="field" style="margin-top: 14px;">
              <span>คำอธิบายเพิ่มเติม</span>
              <input id="adminExamDescriptionInput" type="text" value="${selectedExam.description || ""}" />
            </label>
            <div class="admin-toolbar">
              <button id="adminAddQuestionBtn" class="primary-btn" type="button">เพิ่มคำถามใหม่</button>
              <button id="adminAddTemplateBtn" class="secondary-btn" type="button">เพิ่มคำถามตัวอย่าง</button>
              <button id="adminDeletePartBtn" class="secondary-btn" type="button">ลบ Part นี้</button>
            </div>
          ` : `
            <p class="inline-message">เพิ่ม Model และ Part ก่อน จากนั้นจึงเลือกชุดข้อสอบที่ต้องการแก้ไข</p>
          `}
        </div>
        ${selectedExam ? `
          <div class="admin-question-stack">
            ${selectedExam.questions.map((question, index) => buildAdminQuestionCard(question, index)).join("")}
          </div>
        ` : ""}
      </div>
    </div>
    <div class="admin-card" style="margin-top: 18px;">
        <strong>สรุปสถานะคลังข้อสอบปัจจุบัน</strong>
        <div class="admin-summary-grid">
          <div class="mini-note">Model: <strong>${selectedExam?.modelName || "-"}</strong></div>
          <div class="mini-note">Part: <strong>${selectedExam?.partCode || "-"}</strong></div>
          <div class="mini-note">จำนวนข้อสอบ: <strong>${questionCount}</strong></div>
          <div class="mini-note">จำนวนชุดในคลัง: <strong>${state.adminEditor.draft.examSets.length} ชุด</strong></div>
        </div>
      </div>
      <div class="admin-save-bar">
        <div class="admin-save-copy">
          <strong>พร้อมบันทึกการเปลี่ยนแปลงคลังข้อสอบ</strong>
          <span>หลังตรวจสอบ Model, Part และคำถามเรียบร้อยแล้ว กดปุ่มนี้เพื่อบันทึกขึ้นระบบ</span>
        </div>
        <div class="admin-save-actions">
          ${state.adminSaveStatus?.message ? `<span class="admin-save-badge admin-save-badge-${state.adminSaveStatus.kind || "info"}">${state.adminSaveStatus.message}</span>` : ""}
          <button id="adminSaveBuilderBtn" class="primary-btn admin-save-btn" type="button" ${state.adminSaving ? "disabled" : ""}>${state.adminSaving ? "กำลังบันทึก..." : "บันทึกคลังข้อสอบ"}</button>
        </div>
      </div>
    </div>
  `;

  bindAdminEditorEvents();
}

function updateAdminDraftExam(examId, updater) {
  state.adminEditor.draft.examSets = state.adminEditor.draft.examSets.map((exam) => {
    if (exam.id !== examId) return exam;
    return updater(exam);
  });
}

function addAdminModel() {
  const modelName = String(state.adminEditor.newModelName || "").trim();

  if (!modelName) {
    showMessage(els.adminMessage, "กรุณากรอกชื่อ Model ที่ต้องการเพิ่ม", true);
    return;
  }

  const modelCode = modelName;
  const duplicateModel = state.adminEditor.draft.examSets.some((exam) => exam.modelCode === modelCode);
  const duplicateDraftModel = (state.adminEditor.draft.models || []).some((model) => model.modelCode === modelCode);
  if (duplicateModel || duplicateDraftModel) {
    showMessage(els.adminMessage, "Model นี้มีอยู่แล้วในคลังข้อสอบ", true);
    return;
  }

  state.adminEditor.draft.models = [...(state.adminEditor.draft.models || []), { modelCode, modelName }];
  state.adminEditor.selectedModelCode = modelCode;
  state.adminEditor.selectedExamId = "";
  state.adminEditor.newModelName = modelName;
  state.adminEditor.newPartCode = "";
  state.adminEditor.newPartTitle = "";
  showMessage(els.adminMessage, `เพิ่ม Model ${modelName} แล้ว สามารถเพิ่ม Part ต่อได้ทันที`);
  renderAdminEditor();
}

function addAdminPartToSelectedModel() {
  const selectedGroup = getAdminDraftGroups().get(state.adminEditor.selectedModelCode);
  const modelCode = String(state.adminEditor.selectedModelCode || "").trim();
  const modelName = String(
    state.adminEditor.newModelName || selectedGroup?.modelName || modelCode
  ).trim();
  const partCode = String(state.adminEditor.newPartCode || "").trim().toUpperCase();
  const partTitle = String(state.adminEditor.newPartTitle || "").trim();

  if (!modelCode) {
    showMessage(els.adminMessage, "กรุณาเลือก Model ก่อนเพิ่ม Part", true);
    return;
  }

  if (!partCode || !partTitle) {
    showMessage(els.adminMessage, "กรุณากรอกรหัส Part และชื่อ Part ให้ครบ", true);
    return;
  }

  const duplicatePart = state.adminEditor.draft.examSets.some(
    (exam) => exam.modelCode === modelCode && exam.partCode === partCode
  );
  if (duplicatePart) {
    showMessage(els.adminMessage, "Part นี้มีอยู่แล้วใน Model ที่เลือก", true);
    return;
  }

  const exam = createBlankExam(modelCode, modelName, partCode, partTitle);
  state.adminEditor.draft.examSets.push(exam);
  state.adminEditor.draft.models = (state.adminEditor.draft.models || []).some((model) => model.modelCode === modelCode)
    ? (state.adminEditor.draft.models || []).map((model) => (
      model.modelCode === modelCode ? { ...model, modelName } : model
    ))
    : [...(state.adminEditor.draft.models || []), { modelCode, modelName }];
  state.adminEditor.selectedModelCode = modelCode;
  state.adminEditor.selectedExamId = exam.id;
  state.adminEditor.newPartCode = "";
  state.adminEditor.newPartTitle = "";
  showMessage(els.adminMessage, `เพิ่ม Part ${partCode} ใน Model ${modelName} เรียบร้อยแล้ว`);
  renderAdminEditor();
}

function duplicateAdminQuestion(examId, questionId) {
  updateAdminDraftExam(examId, (exam) => {
    const questions = [...(exam.questions || [])];
    const sourceIndex = questions.findIndex((question) => question.id === questionId);
    if (sourceIndex < 0) return exam;

    const source = questions[sourceIndex];
    const clone = {
      ...deepClone(source),
      id: makeId("Q"),
      number: sourceIndex + 2
    };
    questions.splice(sourceIndex + 1, 0, clone);
    return {
      ...exam,
      questions: questions.map((question, index) => ({ ...question, number: index + 1 }))
    };
  });
}

function deleteAdminQuestion(examId, questionId) {
  updateAdminDraftExam(examId, (exam) => ({
    ...exam,
    questions: (exam.questions || [])
      .filter((question) => question.id !== questionId)
      .map((question, index) => ({ ...question, number: index + 1 }))
  }));
}

function buildAdminQuestionCard(question, index) {
  return `
    <article class="admin-question-card" data-question-card="${question.id}">
      <div class="admin-question-head">
        <div>
          <span class="card-label">ข้อที่ ${index + 1}</span>
          <strong>Question ${index + 1}</strong>
        </div>
        <div class="admin-question-actions">
          <button class="secondary-btn" data-admin-action="duplicate-question" data-question-id="${question.id}" type="button">คัดลอกข้อนี้</button>
          <button class="secondary-btn" data-admin-action="delete-question" data-question-id="${question.id}" type="button">ลบข้อนี้</button>
        </div>
      </div>
      <div class="evaluation-grid admin-question-grid">
        <label class="field admin-question-main">
          <span>คำถาม</span>
          <textarea data-admin-field="question-text" data-question-id="${question.id}" rows="3" placeholder="พิมพ์ข้อความคำถามที่ต้องการแสดง">${question.text || ""}</textarea>
        </label>
        <label class="field">
          <span>คะแนนข้อนี้</span>
          <input data-admin-field="question-score" data-question-id="${question.id}" type="number" min="1" value="${question.score || 1}" />
        </label>
        <label class="field">
          <span>คำตอบที่ถูก</span>
          <select data-admin-field="question-answer" data-question-id="${question.id}">
            ${["A", "B", "C", "D"].map((label, answerIndex) => `<option value="${answerIndex}" ${Number(question.answer) === answerIndex ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="admin-question-media">
        <div class="admin-question-media-row">
          <label class="field">
            <span>รูปประกอบคำถาม (URL)</span>
            <input data-admin-field="question-image" data-question-id="${question.id}" type="url" value="${question.imageUrl || ""}" placeholder="https://example.com/question-image.jpg" />
          </label>
          <div class="admin-image-actions">
            <input id="adminQuestionImageFile-${question.id}" class="hidden" data-admin-file="question-image-file" data-question-id="${question.id}" type="file" accept="image/*" />
            <button class="secondary-btn" data-admin-action="pick-question-image" data-file-target="adminQuestionImageFile-${question.id}" type="button">เลือกรูปจากเครื่อง</button>
            <button class="secondary-btn" data-admin-action="clear-question-image" data-question-id="${question.id}" type="button">ลบรูป</button>
          </div>
        </div>
        ${question.imageUrl ? `<img class="admin-question-preview" src="${question.imageUrl}" alt="Question preview" />` : ""}
      </div>
      <div class="admin-choice-grid">
        ${["A", "B", "C", "D"].map((label, choiceIndex) => `
          <label class="field">
            <span>ตัวเลือก ${label}</span>
            <input data-admin-field="question-choice" data-choice-index="${choiceIndex}" data-question-id="${question.id}" type="text" value="${question.choices?.[choiceIndex] || ""}" placeholder="พิมพ์ตัวเลือก ${label}" />
          </label>
        `).join("")}
      </div>
    </article>
  `;
}

function bindAdminEditorEvents() {
  const setInputValue = (id, handler) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.addEventListener("input", handler);
    node.addEventListener("change", handler);
  };

  setInputValue("adminDraftTitleInput", (event) => {
    state.adminEditor.draft.title = event.target.value;
  });
  setInputValue("adminNewModelNameInput", (event) => {
    state.adminEditor.newModelName = event.target.value;
  });
  setInputValue("adminNewPartCodeInput", (event) => {
    state.adminEditor.newPartCode = String(event.target.value || "").trim().toUpperCase();
  });
  setInputValue("adminNewPartTitleInput", (event) => {
    state.adminEditor.newPartTitle = event.target.value;
  });

  const modelSelect = document.getElementById("adminModelSelect");
  if (modelSelect) {
    modelSelect.addEventListener("change", (event) => {
      state.adminEditor.selectedModelCode = event.target.value;
      const group = getAdminDraftGroups().get(state.adminEditor.selectedModelCode);
      state.adminEditor.selectedExamId = group?.exams?.[0]?.id || "";
      const selectedGroup = group || Array.from(getAdminDraftGroups().values())[0];
      state.adminEditor.newModelName = selectedGroup?.modelName || state.adminEditor.newModelName;
      renderAdminEditor();
    });
  }

  const partSelect = document.getElementById("adminPartSelect");
  if (partSelect) {
    partSelect.addEventListener("change", (event) => {
      state.adminEditor.selectedExamId = event.target.value;
      renderAdminEditor();
    });
  }

  const selectedExam = getAdminSelectedExam();
  if (selectedExam) {
    setInputValue("adminExamModelNameInput", (event) => {
      const nextValue = String(event.target.value || "").trim();
      updateAdminDraftExam(selectedExam.id, (exam) => ({ ...exam, modelName: nextValue, modelCode: nextValue }));
      state.adminEditor.draft.models = (state.adminEditor.draft.models || []).map((model) => (
        model.modelCode === selectedExam.modelCode ? { modelCode: nextValue, modelName: nextValue } : model
      ));
      state.adminEditor.selectedModelCode = nextValue;
    });
    setInputValue("adminExamTitleInput", (event) => {
      updateAdminDraftExam(selectedExam.id, (exam) => ({ ...exam, title: event.target.value }));
    });
    setInputValue("adminExamPartCodeInput", (event) => {
      updateAdminDraftExam(selectedExam.id, (exam) => ({
        ...exam,
        partCode: String(event.target.value || "").trim().toUpperCase()
      }));
    });
    setInputValue("adminExamPassScoreInput", (event) => {
      updateAdminDraftExam(selectedExam.id, (exam) => ({
        ...exam,
        passScore: Math.max(0, Number(event.target.value) || 0)
      }));
    });
    setInputValue("adminExamDescriptionInput", (event) => {
      updateAdminDraftExam(selectedExam.id, (exam) => ({ ...exam, description: event.target.value }));
    });
  }

  const addModelBtn = document.getElementById("adminAddModelBtn");
  if (addModelBtn) {
    addModelBtn.addEventListener("click", addAdminModel);
  }

  const addPartBtn = document.getElementById("adminAddPartBtn");
  if (addPartBtn) {
    addPartBtn.addEventListener("click", addAdminPartToSelectedModel);
  }

  const addQuestionBtn = document.getElementById("adminAddQuestionBtn");
  if (addQuestionBtn && selectedExam) {
    addQuestionBtn.addEventListener("click", () => {
      updateAdminDraftExam(selectedExam.id, (exam) => ({
        ...exam,
        questions: [...(exam.questions || []), createBlankQuestion((exam.questions || []).length + 1)]
      }));
      renderAdminEditor();
    });
  }

  const addTemplateBtn = document.getElementById("adminAddTemplateBtn");
  if (addTemplateBtn && selectedExam) {
    addTemplateBtn.addEventListener("click", () => {
      updateAdminDraftExam(selectedExam.id, (exam) => ({
        ...exam,
        questions: [
          ...(exam.questions || []),
          {
            ...createBlankQuestion((exam.questions || []).length + 1),
            text: "ตัวอย่างคำถามใหม่",
            choices: ["ตัวเลือก A", "ตัวเลือก B", "ตัวเลือก C", "ตัวเลือก D"]
          }
        ]
      }));
      renderAdminEditor();
    });
  }

  const deletePartBtn = document.getElementById("adminDeletePartBtn");
  if (deletePartBtn && selectedExam) {
    deletePartBtn.addEventListener("click", () => {
      state.adminEditor.draft.examSets = state.adminEditor.draft.examSets.filter((exam) => exam.id !== selectedExam.id);
      const nextGroup = getAdminDraftGroups().get(state.adminEditor.selectedModelCode) || Array.from(getAdminDraftGroups().values())[0];
      state.adminEditor.selectedModelCode = nextGroup?.modelCode || "";
      state.adminEditor.selectedExamId = nextGroup?.exams?.[0]?.id || "";
      renderAdminEditor();
    });
  }

  const saveBuilderBtn = document.getElementById("adminSaveBuilderBtn");
  if (saveBuilderBtn) {
    saveBuilderBtn.addEventListener("click", saveAdminBuilder);
  }

  document.querySelectorAll("[data-admin-action='duplicate-question']").forEach((button) => {
    button.addEventListener("click", () => {
      duplicateAdminQuestion(selectedExam.id, button.dataset.questionId);
      renderAdminEditor();
    });
  });

  document.querySelectorAll("[data-admin-action='delete-question']").forEach((button) => {
    button.addEventListener("click", () => {
      deleteAdminQuestion(selectedExam.id, button.dataset.questionId);
      renderAdminEditor();
    });
  });

  document.querySelectorAll("[data-admin-action='pick-question-image']").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.fileTarget;
      const input = targetId ? document.getElementById(targetId) : null;
      input?.click();
    });
  });

  document.querySelectorAll("[data-admin-action='clear-question-image']").forEach((button) => {
    button.addEventListener("click", () => {
      if (!selectedExam) return;
      const questionId = button.dataset.questionId;
      if (!questionId) return;
      updateAdminDraftExam(selectedExam.id, (exam) => ({
        ...exam,
        questions: (exam.questions || []).map((question) => (
          question.id === questionId ? { ...question, imageUrl: null } : question
        ))
      }));
      showMessage(els.adminMessage, "ลบรูปประกอบคำถามแล้ว");
      renderAdminEditor();
    });
  });

  document.querySelectorAll("[data-admin-file='question-image-file']").forEach((node) => {
    node.addEventListener("change", async () => {
      if (!selectedExam) return;
      const questionId = node.dataset.questionId;
      const file = node.files?.[0];
      if (!questionId || !file) return;
      try {
        showMessage(els.adminMessage, "กำลังนำเข้ารูปประกอบคำถาม...");
        const imageUrl = await readFileAsDataUrl(file);
        updateAdminDraftExam(selectedExam.id, (exam) => ({
          ...exam,
          questions: (exam.questions || []).map((question) => (
            question.id === questionId ? { ...question, imageUrl } : question
          ))
        }));
        showMessage(els.adminMessage, `เพิ่มรูปประกอบคำถามเรียบร้อยแล้ว: ${file.name}`);
        renderAdminEditor();
      } catch (error) {
        showMessage(els.adminMessage, `นำเข้ารูปไม่สำเร็จ: ${error.message}`, true);
      }
    });
  });

  document.querySelectorAll("[data-admin-field]").forEach((node) => {
    node.addEventListener("input", () => {
      if (!selectedExam) return;
      const questionId = node.dataset.questionId;
      if (!questionId) return;
      updateAdminDraftExam(selectedExam.id, (exam) => ({
        ...exam,
        questions: (exam.questions || []).map((question) => {
          if (question.id !== questionId) return question;
          if (node.dataset.adminField === "question-text") {
            return { ...question, text: node.value };
          }
          if (node.dataset.adminField === "question-answer") {
            return { ...question, answer: Number(node.value) || 0 };
          }
          if (node.dataset.adminField === "question-score") {
            return { ...question, score: Math.max(1, Number(node.value) || 1) };
          }
          if (node.dataset.adminField === "question-image") {
            return { ...question, imageUrl: String(node.value || "").trim() || null };
          }
          if (node.dataset.adminField === "question-choice") {
            const choices = [...(question.choices || ["", "", "", ""])];
            choices[Number(node.dataset.choiceIndex) || 0] = node.value;
            return { ...question, choices, choiceKeys: ["A", "B", "C", "D"] };
          }
          return question;
        })
      }));
    });
    if (node.tagName === "SELECT") {
      node.addEventListener("change", () => node.dispatchEvent(new Event("input")));
    }
  });
}

async function saveAdminBuilder() {
  if (state.adminSaving) return;
  ensureAdminDraft();

  const draft = deepClone(state.adminEditor.draft);
  draft.models = Array.from(
    new Map(
      (draft.models || []).map((model) => {
        const modelCode = String(model.modelCode || model.modelName || "").trim();
        const modelName = String(model.modelName || modelCode).trim();
        return [modelCode, { modelCode, modelName }];
      })
    ).values()
  ).filter((model) => model.modelCode);
  draft.examSets = (draft.examSets || []).map((exam) => ({
    ...exam,
    modelCode: String(exam.modelCode || "").trim().toUpperCase(),
    modelName: String(exam.modelName || "").trim(),
    partCode: String(exam.partCode || "").trim().toUpperCase(),
    title: String(exam.title || "").trim(),
    description: String(exam.description || "").trim(),
    durationMinutes: Math.max(1, Number(exam.durationMinutes) || 10),
    passScore: Math.max(0, Number(exam.passScore) || 0),
    questions: (exam.questions || []).map((question, index) => ({
      ...question,
      number: Number(question.number) || index + 1,
      text: String(question.text || "").trim(),
      imageUrl: String(question.imageUrl || "").trim() || null,
      choiceKeys: ["A", "B", "C", "D"],
      choices: ["A", "B", "C", "D"].map((_, choiceIndex) => String(question.choices?.[choiceIndex] || "").trim()),
      answer: Number(question.answer) || 0,
      score: Math.max(1, Number(question.score) || 1)
    }))
  }));

  const invalidExam = draft.examSets.find((exam) =>
    !exam.modelCode || !exam.modelName || !exam.partCode || !exam.title || !exam.questions.length
  );
  if (invalidExam) {
    selectAdminExamById(invalidExam.id);
    setAdminSaveStatus("error", "ข้อมูล Part ไม่ครบ");
    showMessage(
      els.adminMessage,
      `บันทึกไม่ได้: Part ${invalidExam.partCode || "-"} (${invalidExam.title || "-"}) ของ Model ${invalidExam.modelName || "-"} ยังกรอกข้อมูลไม่ครบ หรือยังไม่มีคำถาม`,
      true
    );
    showToast(
      `Part ${invalidExam.partCode || "-"} ของ Model ${invalidExam.modelName || "-"} ยังไม่พร้อมบันทึก`,
      "error",
      4200
    );
    renderAdminEditor();
    return;
  }

  const invalidQuestionEntry = draft.examSets.flatMap((exam) =>
    (exam.questions || []).map((question, index) => ({ exam, question, index }))
  ).find(({ question }) =>
    !question.text || (question.choices || []).some((choice) => !String(choice || "").trim())
  );
  const invalidQuestion = invalidQuestionEntry?.question;
  if (invalidQuestion) {
    const invalidExamForQuestion = invalidQuestionEntry.exam;
    selectAdminExamById(invalidExamForQuestion.id);
    setAdminSaveStatus("error", "ข้อมูลคำถามไม่ครบ");
    showMessage(
      els.adminMessage,
      `บันทึกไม่ได้: ข้อ ${invalidQuestionEntry.index + 1} ของ Part ${invalidExamForQuestion.partCode || "-"} (${invalidExamForQuestion.title || "-"}) ยังกรอกคำถามหรือตัวเลือกไม่ครบ`,
      true
    );
    showToast(
      `ข้อ ${invalidQuestionEntry.index + 1} ของ Part ${invalidExamForQuestion.partCode || "-"} ยังไม่ครบ`,
      "error",
      4200
    );
    renderAdminEditor();
    return;
  }

  try {
    state.adminSaving = true;
    setAdminSaveStatus("loading", "กำลังบันทึก...");
    showMessage(els.adminMessage, "กำลังบันทึกคลังข้อสอบ...");
    showToast("กำลังบันทึกคลังข้อสอบ...", "loading", 0);
    renderAdminEditor();
    const response = await api("/api/admin/exam-bank", {
      method: "POST",
      body: JSON.stringify({ payload: draft })
    });
    state.adminSaving = false;
    setAdminSaveStatus("success", `บันทึกสำเร็จ ${response.examSetCount} ชุด`);
    showMessage(els.adminMessage, `บันทึกคลังข้อสอบเรียบร้อยแล้ว จำนวน ${response.examSetCount} ชุด`);
    showToast(`บันทึกคลังข้อสอบสำเร็จ ${response.examSetCount} ชุด`, "success");
    await loadExams();
    renderAdminEditor();
  } catch (error) {
    state.adminSaving = false;
    setAdminSaveStatus("error", "บันทึกไม่สำเร็จ");
    showMessage(els.adminMessage, `บันทึกคลังข้อสอบไม่สำเร็จ: ${error.message}`, true);
    showToast(`บันทึกคลังข้อสอบไม่สำเร็จ: ${error.message}`, "error", 4200);
    renderAdminEditor();
  }
}

function renderAdminInfo() {
  els.adminDataInfo.innerHTML = `
    <div class="mini-note">แหล่งข้อมูล: <strong>${state.bank.source === "custom" ? "ใช้คลังข้อสอบแบบอัปโหลด" : "ใช้คลังข้อสอบหลักของระบบ"}</strong></div>
    <div class="mini-note">ชื่อคลังข้อสอบ: <strong>${state.bank.title || "-"}</strong></div>
    <div class="mini-note">จำนวนชุดข้อสอบ: <strong>${state.bank.examSets.length}</strong></div>
  `;
  renderAdminEditor();
}

async function importExamBank() {
  const file = els.adminFileInput.files?.[0];
  if (!file) {
    showMessage(els.adminMessage, "กรุณาเลือกไฟล์ JSON ที่ต้องการนำเข้า", true);
    return;
  }

  try {
    const raw = await file.text();
    const payload = JSON.parse(raw);
    const response = await api("/api/admin/exam-bank", {
      method: "POST",
      body: JSON.stringify({ payload })
    });
    showMessage(els.adminMessage, `นำเข้าคลังข้อสอบเรียบร้อยแล้ว จำนวน ${response.examSetCount} ชุด`);
    await loadExams();
  } catch (error) {
    showMessage(els.adminMessage, `นำเข้าคลังข้อสอบไม่สำเร็จ: ${error.message}`, true);
  }
}

async function resetExamBank() {
  try {
    await api("/api/admin/reset-exam-bank", {
      method: "POST",
      body: JSON.stringify({})
    });
    showMessage(els.adminMessage, "รีเซ็ตกลับไปใช้คลังข้อสอบหลักของระบบแล้ว");
    await loadExams();
  } catch (error) {
    showMessage(els.adminMessage, `รีเซ็ตคลังข้อสอบไม่สำเร็จ: ${error.message}`, true);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const employeeCode = (els.employeeCodeInput.value || "").trim().toUpperCase();
  if (!employeeCode) {
    showMessage(els.loginMessage, "กรุณากรอกรหัสพนักงาน", true);
    return;
  }

  try {
    const payload = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ employeeCode })
    });
    state.user = payload.user;
    state.authToken = payload.token || "";
    window.localStorage.setItem(STORAGE_KEYS.authToken, state.authToken);
    window.localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(state.user));
    showMessage(els.loginMessage, "");
    els.loginShell.classList.add("hidden");
    els.appShell.classList.remove("hidden");
    updateUserPanel();
    await loadExams();
    await loadResults();
    if (state.user.role === "admin") {
      await loadEmployees();
      await loadEvaluations();
    }
    setView("exam");
  } catch (error) {
    showMessage(els.loginMessage, error.message, true);
  }
}

function logout() {
  state.user = null;
  state.authToken = "";
  state.results = [];
  state.employees = [];
  state.evaluations = [];
  window.localStorage.removeItem(STORAGE_KEYS.authToken);
  window.localStorage.removeItem(STORAGE_KEYS.authUser);
  els.loginForm.reset();
  els.loginShell.classList.remove("hidden");
  els.appShell.classList.add("hidden");
  showMessage(els.loginMessage, "");
  updatePreviewAccess();
}

function bindEvents() {
  els.loginForm.addEventListener("submit", handleLogin);
  els.logoutBtn.addEventListener("click", logout);
  submitExamButtons.forEach((button) => {
    button.addEventListener("click", submitExam);
  });
  previewButtons.forEach((button) => {
    button.addEventListener("click", () => applyPreviewMode(button.dataset.previewMode));
  });
  if (els.nextPartBtn) {
    els.nextPartBtn.addEventListener("click", () => {
      const nextExam = getNextExamInCurrentModel();
      if (!nextExam) return;
      state.selectedExamId = nextExam.id;
      resetExamSession();
      renderSelectors();
    });
  }
  els.restartExamBtn.addEventListener("click", resetExamSession);
  els.prevBtn.addEventListener("click", () => {
    state.currentQuestionIndex = Math.max(state.currentQuestionIndex - 1, 0);
    renderQuestion();
    renderQuestionNav();
  });
  els.nextBtn.addEventListener("click", () => {
    const total = state.currentExam?.questions?.length || 0;
    state.currentQuestionIndex = Math.min(state.currentQuestionIndex + 1, Math.max(total - 1, 0));
    renderQuestion();
    renderQuestionNav();
  });
  els.importJsonBtn.addEventListener("click", importExamBank);
  els.resetJsonBtn.addEventListener("click", resetExamBank);
  els.saveEvaluationBtn.addEventListener("click", saveEvaluation);
  els.resetEvaluationBtn.addEventListener("click", resetEvaluationForm);

  navItems.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  els.evaluationModelSelect.addEventListener("change", renderEvaluationForm);
  els.evaluationPartSelect.addEventListener("change", () => syncEvaluationSelectors());
  els.evaluationEmployeeCodeSelect.addEventListener("change", () => syncEvaluationSelectors("code"));
  els.evaluationEmployeeNameSelect.addEventListener("change", () => syncEvaluationSelectors("name"));
  els.evaluationEvaluatorSelect.addEventListener("change", () => syncEvaluationSelectors());
  els.evaluationSectionTitle.addEventListener("input", () => {
    setText(els.evaluationSheetTitle, els.evaluationSectionTitle.value || TEXT.evaluationSectionTitle);
  });
  els.evaluationSearchInput.addEventListener("input", renderEvaluationHistory);
  els.evaluationHistoryPartFilter.addEventListener("change", renderEvaluationHistory);
  els.evaluationHistoryEvaluatorFilter.addEventListener("change", renderEvaluationHistory);
  if (els.skillMatrixSearchInput) {
    els.skillMatrixSearchInput.addEventListener("input", () => {
      state.skillMatrixPage = 0;
      renderSkillMatrix();
    });
  }
  if (els.skillMatrixModelFilter) {
    els.skillMatrixModelFilter.addEventListener("change", () => {
      state.skillMatrixPage = 0;
      renderSkillMatrix();
    });
  }
  if (els.skillMatrixPartFilter) {
    els.skillMatrixPartFilter.addEventListener("change", () => {
      state.skillMatrixPage = 0;
      renderSkillMatrix();
    });
  }
  if (els.skillMatrixBandFilter) {
    els.skillMatrixBandFilter.addEventListener("change", () => {
      state.skillMatrixPage = 0;
      renderSkillMatrix();
    });
  }
  if (els.skillMatrixPrevPageBtn) {
    els.skillMatrixPrevPageBtn.addEventListener("click", () => {
      state.skillMatrixPage = Math.max(0, state.skillMatrixPage - 1);
      renderSkillMatrix();
    });
  }
  if (els.skillMatrixNextPageBtn) {
    els.skillMatrixNextPageBtn.addEventListener("click", () => {
      state.skillMatrixPage += 1;
      renderSkillMatrix();
    });
  }
  if (els.skillMatrixExportPdfBtn) {
    els.skillMatrixExportPdfBtn.addEventListener("click", exportSkillMatrixPdf);
  }
}

function applyStaticThaiText() {
  document.title = "Factory Online Exam";

  const replaceText = (selector, text, all = false) => {
    const nodes = all ? document.querySelectorAll(selector) : [document.querySelector(selector)];
    nodes.forEach((node) => {
      if (node) node.textContent = text;
    });
  };

  replaceText(".login-brand p", "ระบบสอบออนไลน์สำหรับพนักงาน");
  replaceText(".info-card:nth-of-type(1) strong", "เข้าสู่ระบบด้วยรหัสพนักงาน");
  replaceText(".info-card:nth-of-type(1) p", "ใช้รหัสพนักงานเพื่อเข้าสอบ ดูผลสอบ และติดตามการประเมินในระบบเดียว");
  replaceText(".info-card:nth-of-type(2) strong", "ประเมินหน้างานได้ทันที");
  replaceText(".info-card:nth-of-type(2) p", "หัวหน้างานสามารถบันทึกผลการประเมินและติดตามทักษะของทีมได้จากหน้าเดียว");
  replaceText(".info-card:nth-of-type(3) strong", "อัปเดตคลังข้อสอบได้ยืดหยุ่น");
  replaceText(".info-card:nth-of-type(3) p", "รองรับการนำเข้าไฟล์ JSON เพื่ออัปเดตคลังข้อสอบและข้อมูลการประเมิน");
  replaceText(".side-block .side-label", "ภาพรวมการสอบ");
  replaceText(".side-card:first-of-type .side-label", "สถานะการทำข้อสอบ");
  replaceText(".side-card.highlight .side-label", "คะแนนล่าสุด");
  replaceText(".eyebrow", "Online Examination Dashboard");
  replaceText("#historyView .card-label", "History");
  replaceText("#historyView h3", "ประวัติผลสอบ");
  replaceText("#profileView .card-label", "Profile");
  replaceText("#profileView h3", "ข้อมูลพนักงาน");
  replaceText("#evaluationView .card-label", "Evaluation", true);
  replaceText("#evaluationView h3", "ประเมินผลหน้างาน");
  replaceText("#adminView .card-label", "Admin");
  replaceText("#adminView h3", "จัดการคลังข้อสอบ JSON");

  const loginFieldLabel = document.querySelector("label[for='employeeCodeInput']");
  if (loginFieldLabel) {
    loginFieldLabel.textContent = "รหัสพนักงาน";
  }

  const hintNodes = document.querySelectorAll(".login-hint");
  if (hintNodes[0]) {
    hintNodes[0].textContent = "ใช้รหัสพนักงานของคุณเพื่อเข้าสู่ระบบและเข้าถึงข้อสอบที่เกี่ยวข้อง";
  }
  if (hintNodes[1]) {
    hintNodes[1].textContent = "ผู้ดูแลระบบสามารถจัดการคลังข้อสอบและประเมินผลได้จากเมนูด้านซ้าย";
  }

  const navLabels = {
    exam: "ทำข้อสอบ",
    history: "ประวัติผลสอบ",
    profile: "ข้อมูลพนักงาน",
    skillMatrix: "Skill Matrix",
    evaluation: "ประเมินผล",
    admin: "จัดการข้อสอบ"
  };
  document.querySelectorAll(".nav-item").forEach((node) => {
    const label = node?.querySelector("span");
    const key = node?.dataset?.view;
    if (label && navLabels[key]) {
      label.textContent = navLabels[key];
    }
  });

  const profileLabels = document.querySelectorAll("#profileView .profile-meta .label");
  ["ชื่อพนักงาน", "รหัสพนักงาน", "บทบาท", "แผนก", "ตำแหน่ง", "ผลสอบล่าสุด"].forEach((text, index) => {
    if (profileLabels[index]) profileLabels[index].textContent = text;
  });

  const summaryLabels = document.querySelectorAll(".summary-panel .stat-box span");
  ["ข้อสอบทั้งหมด", "ทำไปแล้ว", "ความคืบหน้า", "ผ่านเกณฑ์"].forEach((text, index) => {
    if (summaryLabels[index]) summaryLabels[index].textContent = text;
  });

  const heroLabels = document.querySelectorAll(".exam-hero-shell .card-label");
  ["Exam Session", "Question Set", "Navigation", "Result Summary"].forEach((text, index) => {
    if (heroLabels[index]) heroLabels[index].textContent = text;
  });

  const legendNodes = document.querySelectorAll(".legend-list div");
  ["พร้อมสอบ", "กำลังทำ", "ส่งแล้ว"].forEach((text, index) => {
    if (legendNodes[index]) {
      legendNodes[index].lastChild.textContent = " " + text;
    }
  });

  const resultBoxLabels = document.querySelectorAll(".result-box span");
  ["คะแนน", "เปอร์เซ็นต์", "ตอบถูก", "ตอบผิด"].forEach((text, index) => {
    if (resultBoxLabels[index]) resultBoxLabels[index].textContent = text;
  });

  const buttons = [
    [els.submitExamBtn, "ส่งข้อสอบ"],
    [els.prevBtn, "ข้อก่อนหน้า"],
    [els.nextBtn, "ข้อต่อไป"],
    [els.restartExamBtn, "เริ่มทำใหม่"],
    [els.logoutBtn, "ออกจากระบบ"],
    [els.saveEvaluationBtn, "บันทึกผลประเมิน"],
    [els.resetEvaluationBtn, "ล้างฟอร์ม"],
    [els.importJsonBtn, "นำเข้าข้อสอบ"],
    [els.resetJsonBtn, "รีเซ็ตข้อมูลหลัก"]
  ];
  buttons.forEach(([node, text]) => {
    if (node) node.textContent = text;
  });

  els.employeeCodeInput.placeholder = "เช่น L00489";
}

function init() {
  applyStaticThaiText();
  applyPreviewMode(window.localStorage.getItem(STORAGE_KEYS.previewMode) || "auto");
  updatePreviewAccess();
  bindEvents();
  renderBankSummary();
  resetExamSession();
  setView("exam");

  const storedToken = window.localStorage.getItem(STORAGE_KEYS.authToken) || "";
  const storedUser = window.localStorage.getItem(STORAGE_KEYS.authUser) || "";
  if (!storedToken || !storedUser) {
    return;
  }

  state.authToken = storedToken;
  try {
    state.user = JSON.parse(storedUser);
  } catch {
    logout();
    return;
  }

  api("/api/me")
    .then(async (payload) => {
      state.user = payload.user;
      els.loginShell.classList.add("hidden");
      els.appShell.classList.remove("hidden");
      updateUserPanel();
      await loadExams();
      await loadResults();
      if (state.user.role === "admin") {
        await loadEmployees();
        await loadEvaluations();
      }
      setView("exam");
    })
    .catch(() => {
      logout();
    });
}

init();
