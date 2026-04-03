"use strict";

const STORAGE_KEYS = {
  authToken: "factory_exam_auth_token",
  authUser: "factory_exam_auth_user"
};

const $ = (id) => document.getElementById(id);

const els = {
  loginShell: $("loginShell"),
  appShell: $("appShell"),
  loginForm: $("loginForm"),
  employeeCodeInput: $("employeeCodeInput"),
  loginMessage: $("loginMessage"),
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
  timeRemaining: $("timeRemaining"),
  answeredCount: $("answeredCount"),
  progressPercent: $("progressPercent"),
  progressBar: $("progressBar"),
  currentQuestionText: $("currentQuestionText"),
  unansweredCount: $("unansweredCount"),
  summaryAnsweredCount: $("summaryAnsweredCount"),
  summaryStatus: $("summaryStatus"),
  examStatus: $("examStatus"),
  loadStatus: $("loadStatus"),
  startExamBtn: $("startExamBtn"),
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
  evaluationHistoryBody: $("evaluationHistoryBody")
};

const navItems = Array.from(document.querySelectorAll(".nav-item"));
const adminOnlyNodes = Array.from(document.querySelectorAll(".admin-only"));

const TEXT = {
  titleByView: {
    exam: "ทำข้อสอบออนไลน์",
    history: "ผลคะแนนย้อนหลัง",
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
      title: "ความเข้าใจขั้นตอนการทำงานและการอ้างอิง WI อย่างถูกต้อง",
      method: "สังเกต",
      maxScore: 5,
      weight: 1
    },
    {
      title: "ความถูกต้องของการปฏิบัติงานตามมาตรฐานที่กำหนด",
      method: "ตรวจงาน",
      maxScore: 5,
      weight: 1
    },
    {
      title: "ความสามารถในการทำงานได้อย่างต่อเนื่องและปลอดภัย",
      method: "ทดสอบ",
      maxScore: 5,
      weight: 1
    },
    {
      title: "การตอบสนองเมื่อพบความผิดปกติและการแยกชิ้นงาน NG ได้เหมาะสม",
      method: "สัมภาษณ์",
      maxScore: 5,
      weight: 1
    }
  ],
  evaluationSectionTitle: "หัวข้อที่ 1 : การประเมินหน้างาน และทักษะงาน"
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
  startedAt: null,
  remainingSeconds: 0,
  timerId: null,
  submitted: false,
  results: [],
  employees: [],
  evaluations: [],
  activeView: "exam",
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

function formatClock(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
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
    throw new Error(data.error || "เกิดข้อผิดพลาดจากระบบ");
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

function clearTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function resetExamSession() {
  clearTimer();
  state.currentQuestionIndex = 0;
  state.answers = [];
  state.startedAt = null;
  state.remainingSeconds = 0;
  state.submitted = false;
  state.currentExam = getSelectedExam();
  els.resultPanel.classList.add("hidden");
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
    evaluation: els.evaluationView,
    admin: els.adminView
  };

  Object.entries(views).forEach(([key, node]) => {
    node.classList.toggle("hidden", key !== view);
  });

  navItems.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  setText(els.pageHeading, TEXT.titleByView[view] || "Factory Online Exam");

  if (view === "history") {
    renderHistory();
  } else if (view === "profile") {
    renderProfile();
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
  setText(els.sidebarUserRole, `สิทธิ์: ${roleLabel(user.role)}`);
  setText(els.sidebarUserId, `รหัสพนักงาน: ${user.employeeCode || "-"}`);

  const isAdmin = user.role === "admin";
  adminOnlyNodes.forEach((node) => node.classList.toggle("hidden", !isAdmin));
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
  els.modelSelector.innerHTML = "";
  const groups = Array.from(state.groupedExams.values());

  groups.forEach((group) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-pill";
    if (group.modelCode === state.selectedModelCode) {
      button.classList.add("active");
    }
    button.textContent = `${group.modelName} (${group.exams.length})`;
    button.addEventListener("click", () => {
      state.selectedModelCode = group.modelCode;
      state.selectedExamId = group.exams[0]?.id || "";
      resetExamSession();
      renderSelectors();
    });
    els.modelSelector.appendChild(button);
  });
}

function renderExamSelector() {
  els.examSelector.innerHTML = "";
  const currentGroup = state.groupedExams.get(state.selectedModelCode);
  const exams = currentGroup?.exams || [];

  exams.forEach((exam) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "exam-set-card";
    if (exam.id === state.selectedExamId) {
      button.classList.add("active");
    }
    button.innerHTML = `
      <strong>${exam.title || exam.partCode || "ชุดข้อสอบ"}</strong>
      <span>${exam.partCode || "-"}</span>
      <span>${(exam.questions || []).length} ข้อ</span>
    `;
    button.addEventListener("click", () => {
      state.selectedExamId = exam.id;
      resetExamSession();
      renderSelectors();
    });
    els.examSelector.appendChild(button);
  });

  const count = exams.length;
  showMessage(
    els.loadStatus,
    count
      ? `โมเดลนี้มี ${count} ชุดข้อสอบ | ชุดปัจจุบัน ${state.currentExam?.title || "-"}`
      : "ไม่พบชุดข้อสอบในระบบ"
  );
}

function renderSelectors() {
  state.currentExam = getSelectedExam();
  renderModelSelector();
  renderExamSelector();
  renderExamMeta();
  renderQuestion();
  renderQuestionNav();
}

function renderExamMeta() {
  const exam = state.currentExam;
  const questionCount = exam?.questions?.length || 0;

  setText(els.examTitle, exam?.title || "ยังไม่ได้เลือกชุดข้อสอบ");
  setText(els.examDescription, exam?.description || "-");
  setText(els.examMetaQuestions, `${questionCount} ข้อ`);
  setText(els.examMetaTime, formatMinutes(exam?.durationMinutes));
  setText(els.examMetaPassScore, `ผ่าน ${Number(exam?.passScore) || 0} คะแนน`);
  setText(els.timeRemaining, formatClock(state.remainingSeconds));
  setText(els.answeredCount, `${state.answers.filter((value) => value !== null && value !== undefined).length} / ${questionCount}`);
}

function updateExamStatus() {
  const exam = state.currentExam;
  const questionCount = exam?.questions?.length || 0;
  const answeredCount = state.answers.filter((value) => value !== null && value !== undefined).length;
  const unansweredCount = Math.max(questionCount - answeredCount, 0);
  const progress = questionCount ? Math.round((answeredCount / questionCount) * 100) : 0;

  setText(els.currentQuestionText, questionCount ? `ข้อ ${state.currentQuestionIndex + 1}` : "ข้อ 0");
  setText(els.unansweredCount, `${unansweredCount} ข้อ`);
  setText(els.summaryAnsweredCount, `${answeredCount} ข้อ`);
  setText(els.progressPercent, `${progress}%`);
  els.progressBar.style.width = `${progress}%`;
  setText(els.answeredCount, `${answeredCount} / ${questionCount}`);

  let statusText = "รอเริ่มสอบ";
  if (state.submitted) {
    statusText = "เสร็จสิ้น";
  } else if (state.startedAt) {
    statusText = "กำลังสอบ";
  } else if (exam) {
    statusText = "ยังไม่ได้เริ่มสอบ";
  }

  setText(els.summaryStatus, statusText);
  setText(els.examStatus, statusText);
  els.submitExamBtn.disabled = !state.startedAt || state.submitted;
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

function startExam() {
  if (!state.currentExam || state.startedAt || state.submitted) return;
  state.answers = new Array(state.currentExam.questions.length).fill(null);
  state.startedAt = Date.now();
  state.remainingSeconds = (Number(state.currentExam.durationMinutes) || 0) * 60;
  setText(els.timeRemaining, formatClock(state.remainingSeconds));
  updateExamStatus();
  clearTimer();
  state.timerId = window.setInterval(() => {
    state.remainingSeconds -= 1;
    setText(els.timeRemaining, formatClock(state.remainingSeconds));
    if (state.remainingSeconds <= 0) {
      clearTimer();
      showMessage(els.loadStatus, "หมดเวลา ระบบส่งข้อสอบให้อัตโนมัติแล้ว");
      submitExam(true);
    }
  }, 1000);
}

async function submitExam(isAutoSubmit = false) {
  if (!state.currentExam || state.submitted) return;

  clearTimer();
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
    renderResult(response.result, isAutoSubmit);
    await loadResults();
  } catch (error) {
    showMessage(els.loadStatus, `ส่งข้อสอบไม่สำเร็จ: ${error.message}`, true);
  }
}

function renderResult(result, isAutoSubmit) {
  els.resultPanel.classList.remove("hidden");
  setText(els.scoreValue, `${result.score} / ${result.total_score}`);
  setText(els.scorePercent, `${result.percent}%`);
  setText(els.correctCount, `ตอบถูก ${result.correct_count} ข้อ`);
  setText(els.wrongCount, `${result.wrong_count} ข้อ`);
  els.resultMessage.textContent = result.passed
    ? `ผ่านเกณฑ์: ตอบถูก ${result.correct_count} ข้อ จาก ${result.question_count} ข้อ`
    : `ไม่ผ่านเกณฑ์: ตอบถูก ${result.correct_count} ข้อ จาก ${result.question_count} ข้อ`;
  if (isAutoSubmit) {
    showMessage(els.loadStatus, "หมดเวลา ระบบส่งข้อสอบให้อัตโนมัติแล้ว");
  } else {
    showMessage(els.loadStatus, "ส่งข้อสอบแล้ว");
  }
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
    showMessage(els.loadStatus, `โหลดข้อสอบไม่สำเร็จ: ${error.message}`, true);
  }
}

async function loadResults() {
  if (!state.user) return;
  const payload = await api("/api/results");
  state.results = Array.isArray(payload.results) ? payload.results : [];
  renderHistory();
  renderProfile();
  renderEvaluationForm();
  renderEvaluationHistory();
}

function renderHistory() {
  const results = state.results;
  const total = results.length;
  const avgPercent = total
    ? Math.round(results.reduce((sum, item) => sum + Number(item.percent || 0), 0) / total)
    : 0;
  const passedCount = results.filter((item) => item.passed).length;

  els.historyStats.innerHTML = `
    <div class="stat-box"><span>ผลสอบทั้งหมด</span><strong>${total}</strong></div>
    <div class="stat-box"><span>จำนวนครั้งที่สอบ</span><strong>${total}</strong></div>
    <div class="stat-box"><span>ค่าเฉลี่ย</span><strong>${avgPercent}%</strong></div>
    <div class="stat-box"><span>รายการผ่านเกณฑ์</span><strong>${passedCount}</strong></div>
  `;

  if (!total) {
    els.historyList.innerHTML = `<div class="inline-message">ยังไม่มีข้อมูลผลสอบ</div>`;
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
            <span>${item.passed ? "ผ่านเกณฑ์" : "ไม่ผ่าน"}</span>
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

function populateSelect(element, options, valueKey, labelKey, selectedValue = "") {
  if (!element) return;
  element.innerHTML = options
    .map((item) => {
      const value = item[valueKey];
      const label = item[labelKey];
      const selected = String(value) === String(selectedValue) ? "selected" : "";
      return `<option value="${value}" ${selected}>${label}</option>`;
    })
    .join("");
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
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${row.title}</td>
          <td>0 - ${maxScore}</td>
          <td>${row.method}</td>
          <td>
            <input class="score-input" type="number" min="0" max="${maxScore}" step="1" value="${score}" data-row-index="${index}" />
          </td>
          <td>${weight}</td>
          <td>${sum}</td>
        </tr>
      `;
    })
    .join("");

  setText(els.evaluationTotal, String(total));
  setText(els.evaluationMax, String(max));

  Array.from(document.querySelectorAll(".score-input")).forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.rowIndex);
      const maxScore = Number(TEXT.evaluationRows[index].maxScore) || 0;
      const nextValue = Math.max(0, Math.min(maxScore, Number(input.value) || 0));
      TEXT.evaluationRows[index].score = nextValue;
      renderEvaluationRows(TEXT.evaluationRows);
    });
  });
}

function renderEvaluationForm() {
  if (state.user?.role !== "admin") return;

  setText(els.evaluationSheetTitle, TEXT.evaluationSectionTitle);
  els.evaluationSectionTitle.value = TEXT.evaluationSectionTitle;

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
    state.employees.map((employee) => ({
      employeeCode: employee.employeeCode,
      label: employee.employeeCode
    })),
    "employeeCode",
    "label",
    els.evaluationEmployeeCodeSelect.value || state.employees[0]?.employeeCode || ""
  );

  populateSelect(
    els.evaluationEmployeeNameSelect,
    state.employees.map((employee) => ({
      employeeCode: employee.employeeCode,
      label: employee.fullName
    })),
    "employeeCode",
    "label",
    els.evaluationEmployeeNameSelect.value || state.employees[0]?.employeeCode || ""
  );

  populateSelect(
    els.evaluationEvaluatorSelect,
    TEXT.evaluators.map((value) => ({ value, label: value })),
    "value",
    "label",
    els.evaluationEvaluatorSelect.value || TEXT.evaluators[0]
  );

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
}

async function loadEmployees() {
  if (state.user?.role !== "admin") return;
  const payload = await api("/api/admin/employees");
  state.employees = Array.isArray(payload.employees) ? payload.employees : [];
  renderEvaluationForm();
}

async function loadEvaluations() {
  if (state.user?.role !== "admin") return;
  const payload = await api("/api/evaluations");
  state.evaluations = Array.isArray(payload.evaluations) ? payload.evaluations : [];
  renderEvaluationHistory();
}

function renderEvaluationHistory() {
  if (state.user?.role !== "admin") return;

  const partOptions = ["ทุก Part"].concat(
    Array.from(new Set(state.evaluations.map((item) => item.partCode).filter(Boolean)))
  );
  const evaluatorOptions = ["ผู้ประเมินทั้งหมด"].concat(
    Array.from(new Set(state.evaluations.map((item) => item.evaluator).filter(Boolean)))
  );

  els.evaluationHistoryPartFilter.innerHTML = partOptions
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("");
  els.evaluationHistoryEvaluatorFilter.innerHTML = evaluatorOptions
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("");

  const keyword = (els.evaluationSearchInput.value || "").trim().toLowerCase();
  const partFilter = els.evaluationHistoryPartFilter.value || "ทุก Part";
  const evaluatorFilter = els.evaluationHistoryEvaluatorFilter.value || "ผู้ประเมินทั้งหมด";

  const filtered = state.evaluations.filter((item) => {
    const matchedKeyword = !keyword || [
      item.employeeCode,
      item.employeeName,
      item.partCode,
      item.partName,
      item.evaluator
    ].some((entry) => String(entry || "").toLowerCase().includes(keyword));

    const matchedPart = partFilter === "ทุก Part" || item.partCode === partFilter;
    const matchedEvaluator =
      evaluatorFilter === "ผู้ประเมินทั้งหมด" || item.evaluator === evaluatorFilter;

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
    setText(els.evaluationHistoryEmpty, "ยังไม่มีข้อมูลการประเมิน");
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
    showMessage(els.evaluationMessage, "บันทึกผลการประเมินเรียบร้อยแล้ว");
    await loadEvaluations();
  } catch (error) {
    showMessage(els.evaluationMessage, `บันทึกผลการประเมินไม่สำเร็จ: ${error.message}`, true);
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
        <h3>สร้างข้อสอบได้เร็วขึ้นจากหน้าเดียว</h3>
      </div>
    </div>
    <div class="admin-builder-layout">
      <div class="admin-card admin-builder-sidebar">
        <label class="field">
          <span>ชื่อระบบข้อสอบ</span>
          <input id="adminDraftTitleInput" type="text" value="${state.adminEditor.draft.title || ""}" />
        </label>
        <div class="admin-flow-card">
          <div class="admin-flow-head">
            <span class="card-label">Step 1</span>
            <strong>เพิ่ม Model</strong>
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
            <strong>เพิ่ม Part ใต้ Model ที่เลือก</strong>
          </div>
          <div class="admin-info-list" style="margin-top: 10px;">
            <div class="mini-note">Model ที่เลือกตอนนี้: <strong>${selectedGroup?.modelName || "-"}</strong></div>
          </div>
          <div class="admin-quick-grid" style="margin-top: 14px;">
            <label class="field">
              <span>รหัส Part</span>
              <input id="adminNewPartCodeInput" type="text" value="${state.adminEditor.newPartCode || ""}" placeholder="เช่น P1 หรือ PART-01" />
            </label>
            <label class="field">
              <span>ชื่อ Part</span>
              <input id="adminNewPartTitleInput" type="text" value="${state.adminEditor.newPartTitle || ""}" placeholder="เช่น การตรวจสอบขั้นต้น" />
            </label>
          </div>
          <div class="result-actions" style="margin-top: 14px;">
            <button id="adminAddPartBtn" class="primary-btn" type="button">เพิ่ม Part</button>
          </div>
        </div>
        <div class="admin-divider"></div>
        <div class="result-actions" style="margin-top: 14px;">
          <button id="adminSaveBuilderBtn" class="secondary-btn" type="button">บันทึกคลังข้อสอบ</button>
        </div>
        <div class="evaluation-grid">
          <label class="field">
            <span>เลือก Model</span>
            <select id="adminModelSelect">
              ${groups.map((group) => `<option value="${group.modelCode}" ${group.modelCode === state.adminEditor.selectedModelCode ? "selected" : ""}>${group.modelName} (${group.exams.length} Part)</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>เลือก Part ใต้ Model นี้</span>
            <select id="adminPartSelect">
              ${(groups.find((group) => group.modelCode === state.adminEditor.selectedModelCode)?.exams || []).map((exam) => `<option value="${exam.id}" ${exam.id === state.adminEditor.selectedExamId ? "selected" : ""}>${exam.partCode} - ${exam.title}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="admin-info-list">
          <div class="mini-note">Model ปัจจุบัน: <strong>${selectedExam?.modelName || "-"}</strong></div>
          <div class="mini-note">Part ปัจจุบัน: <strong>${selectedExam?.partCode || "-"}</strong></div>
          <div class="mini-note">จำนวนข้อ: <strong>${questionCount}</strong></div>
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
                <span>เวลา (นาที)</span>
                <input id="adminExamDurationInput" type="number" min="1" value="${selectedExam.durationMinutes || 10}" />
              </label>
              <label class="field">
                <span>คะแนนผ่าน</span>
                <input id="adminExamPassScoreInput" type="number" min="0" value="${selectedExam.passScore || 0}" />
              </label>
            </div>
            <label class="field" style="margin-top: 14px;">
              <span>คำอธิบาย</span>
              <input id="adminExamDescriptionInput" type="text" value="${selectedExam.description || ""}" />
            </label>
            <div class="admin-toolbar">
              <button id="adminAddQuestionBtn" class="primary-btn" type="button">เพิ่มข้อสอบเปล่า</button>
              <button id="adminAddTemplateBtn" class="secondary-btn" type="button">เพิ่มข้อสอบตัวอย่าง</button>
              <button id="adminDeletePartBtn" class="secondary-btn" type="button">ลบ Part นี้</button>
            </div>
          ` : `
            <p class="inline-message">เริ่มจากกรอก Model และ Part ด้านซ้าย แล้วกดเพิ่ม Model / Part</p>
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
        <strong>ภาพรวมชุดที่เลือก</strong>
        <div class="admin-summary-grid">
          <div class="mini-note">Model: <strong>${selectedExam?.modelName || "-"}</strong></div>
          <div class="mini-note">Part: <strong>${selectedExam?.partCode || "-"}</strong></div>
          <div class="mini-note">จำนวนข้อ: <strong>${questionCount}</strong></div>
          <div class="mini-note">คลังข้อสอบทั้งหมด: <strong>${state.adminEditor.draft.examSets.length} ชุด</strong></div>
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
    showMessage(els.adminMessage, "กรุณากรอกชื่อ Model ก่อน", true);
    return;
  }

  const modelCode = modelName;
  const duplicateModel = state.adminEditor.draft.examSets.some((exam) => exam.modelCode === modelCode);
  const duplicateDraftModel = (state.adminEditor.draft.models || []).some((model) => model.modelCode === modelCode);
  if (duplicateModel || duplicateDraftModel) {
    showMessage(els.adminMessage, "มี Model นี้อยู่แล้ว", true);
    return;
  }

  state.adminEditor.draft.models = [...(state.adminEditor.draft.models || []), { modelCode, modelName }];
  state.adminEditor.selectedModelCode = modelCode;
  state.adminEditor.selectedExamId = "";
  state.adminEditor.newModelName = modelName;
  state.adminEditor.newPartCode = "";
  state.adminEditor.newPartTitle = "";
  showMessage(els.adminMessage, `สร้าง Model ${modelName} แล้ว ตอนนี้เพิ่ม Part ใต้ Model นี้ได้เลย`);
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
    showMessage(els.adminMessage, "กรุณาเพิ่มหรือเลือก Model ก่อน", true);
    return;
  }

  if (!partCode || !partTitle) {
    showMessage(els.adminMessage, "กรุณากรอก Part ให้ครบก่อนเพิ่ม", true);
    return;
  }

  const duplicatePart = state.adminEditor.draft.examSets.some(
    (exam) => exam.modelCode === modelCode && exam.partCode === partCode
  );
  if (duplicatePart) {
    showMessage(els.adminMessage, "มี Part นี้อยู่แล้วใน Model ที่เลือก", true);
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
  showMessage(els.adminMessage, `เพิ่ม Part ${partCode} ใต้ Model ${modelName} เรียบร้อยแล้ว`);
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
          <span class="card-label">ข้อ ${index + 1}</span>
          <strong>Question ${index + 1}</strong>
        </div>
        <div class="admin-question-actions">
          <button class="secondary-btn" data-admin-action="duplicate-question" data-question-id="${question.id}" type="button">คัดลอกข้อ</button>
          <button class="secondary-btn" data-admin-action="delete-question" data-question-id="${question.id}" type="button">ลบข้อ</button>
        </div>
      </div>
      <div class="evaluation-grid admin-question-grid">
        <label class="field admin-question-main">
          <span>คำถาม</span>
          <textarea data-admin-field="question-text" data-question-id="${question.id}" rows="3" placeholder="พิมพ์คำถามที่นี่">${question.text || ""}</textarea>
        </label>
        <label class="field">
          <span>คะแนน</span>
          <input data-admin-field="question-score" data-question-id="${question.id}" type="number" min="1" value="${question.score || 1}" />
        </label>
        <label class="field">
          <span>เฉลย</span>
          <select data-admin-field="question-answer" data-question-id="${question.id}">
            ${["A", "B", "C", "D"].map((label, answerIndex) => `<option value="${answerIndex}" ${Number(question.answer) === answerIndex ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
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
    setInputValue("adminExamDurationInput", (event) => {
      updateAdminDraftExam(selectedExam.id, (exam) => ({
        ...exam,
        durationMinutes: Math.max(1, Number(event.target.value) || 10)
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
    showMessage(els.adminMessage, "กรุณากรอกข้อมูล Model, Part และคำถามให้ครบก่อนบันทึก", true);
    return;
  }

  const invalidQuestion = draft.examSets.flatMap((exam) => exam.questions).find((question) =>
    !question.text || (question.choices || []).some((choice) => !String(choice || "").trim())
  );
  if (invalidQuestion) {
    showMessage(els.adminMessage, "ทุกข้อสอบต้องมีคำถามและตัวเลือกให้ครบ 4 ตัวเลือก", true);
    return;
  }

  try {
    const response = await api("/api/admin/exam-bank", {
      method: "POST",
      body: JSON.stringify({ payload: draft })
    });
    showMessage(els.adminMessage, `บันทึกคลังข้อสอบเรียบร้อยแล้ว ${response.examSetCount} ชุด`);
    await loadExams();
    renderAdminEditor();
  } catch (error) {
    showMessage(els.adminMessage, `บันทึกคลังข้อสอบไม่สำเร็จ: ${error.message}`, true);
  }
}

function renderAdminInfo() {
  els.adminDataInfo.innerHTML = `
    <div class="mini-note">แหล่งข้อมูล: <strong>${state.bank.source === "custom" ? "ใช้คลังข้อสอบแบบอัปโหลด" : "ใช้คลังข้อสอบหลักของระบบ"}</strong></div>
    <div class="mini-note">ชื่อระบบ: <strong>${state.bank.title || "-"}</strong></div>
    <div class="mini-note">จำนวนชุดข้อสอบ: <strong>${state.bank.examSets.length}</strong></div>
  `;
  renderAdminEditor();
}

async function importExamBank() {
  const file = els.adminFileInput.files?.[0];
  if (!file) {
    showMessage(els.adminMessage, "กรุณาเลือกไฟล์ JSON ก่อน", true);
    return;
  }

  try {
    const raw = await file.text();
    const payload = JSON.parse(raw);
    const response = await api("/api/admin/exam-bank", {
      method: "POST",
      body: JSON.stringify({ payload })
    });
    showMessage(els.adminMessage, `นำเข้าข้อสอบสำเร็จ ${response.examSetCount} ชุด`);
    await loadExams();
  } catch (error) {
    showMessage(els.adminMessage, `นำเข้าไม่สำเร็จ: ${error.message}`, true);
  }
}

async function resetExamBank() {
  try {
    await api("/api/admin/reset-exam-bank", {
      method: "POST",
      body: JSON.stringify({})
    });
    showMessage(els.adminMessage, "กลับไปใช้คลังข้อสอบเดิมแล้ว");
    await loadExams();
  } catch (error) {
    showMessage(els.adminMessage, `รีเซ็ตไม่สำเร็จ: ${error.message}`, true);
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
  clearTimer();
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
}

function bindEvents() {
  els.loginForm.addEventListener("submit", handleLogin);
  els.logoutBtn.addEventListener("click", logout);
  els.startExamBtn.addEventListener("click", startExam);
  els.submitExamBtn.addEventListener("click", () => submitExam(false));
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
  els.evaluationSearchInput.addEventListener("input", renderEvaluationHistory);
  els.evaluationHistoryPartFilter.addEventListener("change", renderEvaluationHistory);
  els.evaluationHistoryEvaluatorFilter.addEventListener("change", renderEvaluationHistory);
}

function applyStaticThaiText() {
  document.title = "Factory Online Exam";
  const replaceText = (selector, text, all = false) => {
    const nodes = all ? document.querySelectorAll(selector) : [document.querySelector(selector)];
    nodes.forEach((node) => {
      if (node) node.textContent = text;
    });
  };

  replaceText(".login-brand p", "ระบบสอบออนไลน์พร้อมประวัติผลสอบและแผงจัดการข้อสอบ");
  replaceText(".info-card:nth-of-type(1) strong", "ผู้เข้าสอบ");
  replaceText(".info-card:nth-of-type(1) p", "ล็อกอินเป็นพนักงานหรือผู้ดูแลระบบ");
  replaceText(".info-card:nth-of-type(2) strong", "ประวัติผลสอบ");
  replaceText(".info-card:nth-of-type(2) p", "บันทึกคะแนนและตรวจสอบผลย้อนหลังได้ทันที");
  replaceText(".info-card:nth-of-type(3) strong", "อัปโหลดข้อสอบ");
  replaceText(".info-card:nth-of-type(3) p", "อัปโหลดไฟล์ JSON ใหม่ผ่านหน้าเว็บได้ทันที");
  replaceText(".side-block .side-label", "เมนูหลัก");
  replaceText(".side-card:first-of-type .side-label", "ผู้ใช้งานปัจจุบัน");
  replaceText(".side-card.highlight .side-label", "แหล่งข้อสอบ");
  replaceText(".eyebrow", "Online Examination Dashboard");
  replaceText("#historyView .card-label", "History");
  replaceText("#historyView h3", "ประวัติผลสอบ");
  replaceText("#profileView .card-label", "Profile");
  replaceText("#profileView h3", "ข้อมูลบัญชีผู้ใช้");
  replaceText("#evaluationView .card-label", "Evaluation", true);
  replaceText("#evaluationView h3", "แบบฟอร์มประเมินหน้างาน");
  replaceText("#adminView .card-label", "Admin");
  replaceText("#adminView h3", "อัปโหลดคลังข้อสอบ JSON");

  const loginFieldLabel = document.querySelector(".login-form .field span");
  if (loginFieldLabel) {
    loginFieldLabel.textContent = "รหัสพนักงาน";
  }

  const hintNodes = document.querySelectorAll(".login-hint span");
  if (hintNodes[0]) {
    hintNodes[0].textContent = "ใช้รหัสพนักงานอย่างเดียวในการเข้าใช้งาน";
  }
  if (hintNodes[1]) {
    hintNodes[1].textContent = "สำหรับผู้มีสิทธิ์ในระบบเท่านั้น";
  }

  const navMap = {
    exam: "หน้าสอบ",
    history: "ผลคะแนน",
    profile: "บัญชีผู้ใช้",
    evaluation: "Evaluation",
    admin: "Admin Upload"
  };
  navItems.forEach((button) => {
    if (navMap[button.dataset.view]) {
      button.textContent = navMap[button.dataset.view];
    }
  });

  const profileLabels = document.querySelectorAll("#profileView .stat-box span");
  [
    "ชื่อพนักงาน",
    "รหัสพนักงาน",
    "สิทธิ์การใช้งาน",
    "แผนก",
    "ตำแหน่ง",
    "จำนวนครั้งที่สอบ",
    "คะแนนล่าสุด"
  ].forEach((text, index) => {
    if (profileLabels[index]) profileLabels[index].textContent = text;
  });

  const summaryLabels = document.querySelectorAll(".summary-panel .stat-box span");
  ["ข้อปัจจุบัน", "ยังไม่ตอบ", "ตอบแล้ว", "สถานะ"].forEach((text, index) => {
    if (summaryLabels[index]) summaryLabels[index].textContent = text;
  });

  const heroLabels = document.querySelectorAll(".hero-card .card-label");
  ["ชุดข้อสอบ", "เวลาคงเหลือ", "ตอบแล้ว", "ความคืบหน้า"].forEach((text, index) => {
    if (heroLabels[index]) heroLabels[index].textContent = text;
  });

  const legendNodes = document.querySelectorAll(".legend-list div");
  ["ข้อปัจจุบัน", "ตอบแล้ว", "ยังไม่ตอบ"].forEach((text, index) => {
    if (legendNodes[index]) {
      legendNodes[index].lastChild.textContent = ` ${text}`;
    }
  });

  const resultBoxLabels = document.querySelectorAll(".result-box span");
  ["คะแนนรวม", "คิดเป็นร้อยละ", "คำตอบถูก", "คำตอบผิด"].forEach((text, index) => {
    if (resultBoxLabels[index]) resultBoxLabels[index].textContent = text;
  });

  const buttons = [
    [els.startExamBtn, "เริ่มสอบ"],
    [els.submitExamBtn, "ส่งข้อสอบ"],
    [els.prevBtn, "ย้อนกลับ"],
    [els.nextBtn, "ถัดไป"],
    [els.restartExamBtn, "เริ่มทำใหม่"],
    [els.logoutBtn, "ออกจากระบบ"],
    [els.saveEvaluationBtn, "บันทึกการประเมิน"],
    [els.resetEvaluationBtn, "ล้างแบบฟอร์ม"],
    [els.importJsonBtn, "นำเข้าข้อสอบ"],
    [els.resetJsonBtn, "กลับไปใช้ไฟล์เดิม"]
  ];
  buttons.forEach(([node, text]) => {
    if (node) node.textContent = text;
  });

  els.employeeCodeInput.placeholder = "เช่น L00489";
}

function init() {
  applyStaticThaiText();
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

