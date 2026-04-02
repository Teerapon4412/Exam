const STORAGE_KEYS = {
  auth: "factory_exam_auth"
};

const EVALUATION_ASSIGNED_EVALUATORS = [
  "206006 - เธเธนเนเธเธฃเธฐเน€เธกเธดเธ",
  "210027 - เธเธนเนเธเธฃเธฐเน€เธกเธดเธ",
  "211075 - เธเธนเนเธเธฃเธฐเน€เธกเธดเธ",
  "204041 - เธเธนเนเธเธฃเธฐเน€เธกเธดเธ",
  "206029 - เธเธนเนเธเธฃเธฐเน€เธกเธดเธ",
  "199033 - เธเธนเนเธเธฃเธฐเน€เธกเธดเธ",
  "197036 - เธเธนเนเธเธฃเธฐเน€เธกเธดเธ",
  "203009 - เธเธนเนเธเธฃเธฐเน€เธกเธดเธ"
];

const EVALUATION_SCORE_LEVELS = [1, 2, 3, 4];

const EVALUATION_ROW_SEED = [
  { item: "เธเธงเธฒเธกเน€เธเนเธฒเนเธเธเธฑเนเธเธ•เธญเธเธเธฒเธฃเธ—เธณเธเธฒเธเนเธฅเธฐเธเธฒเธฃเธญเนเธฒเธเธญเธดเธ WI เธญเธขเนเธฒเธเธ–เธนเธเธ•เนเธญเธ", method: "เธชเธฑเธเน€เธเธ•", weight: 1 },
  { item: "เธเธงเธฒเธกเธ–เธนเธเธ•เนเธญเธเธเธญเธเธเธฒเธฃเธเธเธดเธเธฑเธ•เธดเธเธฒเธเธ•เธฒเธกเธกเธฒเธ•เธฃเธเธฒเธเธ—เธตเนเธเธณเธซเธเธ”", method: "เธ•เธฃเธงเธเธเธฒเธ", weight: 3 },
  { item: "เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เนเธเธเธฒเธฃเธ—เธณเธเธฒเธเนเธ”เนเธญเธขเนเธฒเธเธ•เนเธญเน€เธเธทเนเธญเธเนเธฅเธฐเธเธฅเธญเธ”เธ เธฑเธข", method: "เธ—เธ”เธชเธญเธ", weight: 5 },
  { item: "เธเธฒเธฃเธ•เธญเธเธชเธเธญเธเน€เธกเธทเนเธญเธเธเธเธงเธฒเธกเธเธดเธ”เธเธเธ•เธดเนเธฅเธฐเธเธฒเธฃเนเธขเธเธเธดเนเธเธเธฒเธ NG เนเธ”เนเน€เธซเธกเธฒเธฐเธชเธก", method: "เธชเธฑเธกเธ เธฒเธฉเธ“เน", weight: 6 }
];

const state = {
  examTitle: "Factory Online Exam",
  examSets: [],
  models: [],
  selectedModelKey: "",
  currentExamIndex: 0,
  currentQuestionIndex: 0,
  answers: [],
  timerId: null,
  remainingSeconds: 0,
  started: false,
  submitted: false,
  loading: true,
  loadError: "",
  currentUser: null,
  currentView: "exam",
  dataSource: "default",
  results: [],
  updatedAt: "",
  lastSubmittedSignature: "",
  employees: [],
  evaluations: [],
  evaluationSearch: "",
  evaluationPartFilter: "ALL",
  evaluationEvaluatorFilter: "ALL",
  evaluationForm: null
};

const elements = {
  loginShell: document.getElementById("loginShell"),
  appShell: document.getElementById("appShell"),
  loginForm: document.getElementById("loginForm"),
  employeeCodeInput: document.getElementById("employeeCodeInput"),
  loginMessage: document.getElementById("loginMessage"),
  systemTitle: document.getElementById("systemTitle"),
  sidebarUserName: document.getElementById("sidebarUserName"),
  sidebarUserRole: document.getElementById("sidebarUserRole"),
  sidebarUserId: document.getElementById("sidebarUserId"),
  dataSourceLabel: document.getElementById("dataSourceLabel"),
  dataSummaryLabel: document.getElementById("dataSummaryLabel"),
  logoutBtn: document.getElementById("logoutBtn"),
  navItems: Array.from(document.querySelectorAll(".nav-item[data-view]")),
  examView: document.getElementById("examView"),
  historyView: document.getElementById("historyView"),
  profileView: document.getElementById("profileView"),
  evaluationView: document.getElementById("evaluationView"),
  adminView: document.getElementById("adminView"),
  pageHeading: document.getElementById("pageHeading"),
  modelSelector: document.getElementById("modelSelector"),
  examSelector: document.getElementById("examSelector"),
  examTitle: document.getElementById("examTitle"),
  examDescription: document.getElementById("examDescription"),
  examMetaQuestions: document.getElementById("examMetaQuestions"),
  examMetaTime: document.getElementById("examMetaTime"),
  examMetaPassScore: document.getElementById("examMetaPassScore"),
  timeRemaining: document.getElementById("timeRemaining"),
  answeredCount: document.getElementById("answeredCount"),
  progressPercent: document.getElementById("progressPercent"),
  progressBar: document.getElementById("progressBar"),
  currentQuestionText: document.getElementById("currentQuestionText"),
  unansweredCount: document.getElementById("unansweredCount"),
  summaryAnsweredCount: document.getElementById("summaryAnsweredCount"),
  summaryStatus: document.getElementById("summaryStatus"),
  examStatus: document.getElementById("examStatus"),
  loadStatus: document.getElementById("loadStatus"),
  startExamBtn: document.getElementById("startExamBtn"),
  submitExamBtn: document.getElementById("submitExamBtn"),
  questionTitle: document.getElementById("questionTitle"),
  questionBadge: document.getElementById("questionBadge"),
  questionText: document.getElementById("questionText"),
  questionImage: document.getElementById("questionImage"),
  choicesContainer: document.getElementById("choicesContainer"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  questionNav: document.getElementById("questionNav"),
  resultPanel: document.getElementById("resultPanel"),
  scoreValue: document.getElementById("scoreValue"),
  scorePercent: document.getElementById("scorePercent"),
  correctCount: document.getElementById("correctCount"),
  wrongCount: document.getElementById("wrongCount"),
  resultMessage: document.getElementById("resultMessage"),
  restartExamBtn: document.getElementById("restartExamBtn"),
  historyStats: document.getElementById("historyStats"),
  historyList: document.getElementById("historyList"),
  profileUserName: document.getElementById("profileUserName"),
  profileEmployeeCode: document.getElementById("profileEmployeeCode"),
  profileUserRole: document.getElementById("profileUserRole"),
  profileDepartment: document.getElementById("profileDepartment"),
  profilePosition: document.getElementById("profilePosition"),
  profileExamCount: document.getElementById("profileExamCount"),
  profileLastScore: document.getElementById("profileLastScore"),
  adminFileInput: document.getElementById("adminFileInput"),
  importJsonBtn: document.getElementById("importJsonBtn"),
  resetJsonBtn: document.getElementById("resetJsonBtn"),
  adminMessage: document.getElementById("adminMessage"),
  adminDataInfo: document.getElementById("adminDataInfo"),
  adminOnlyNodes: Array.from(document.querySelectorAll(".admin-only")),
  evaluationSectionTitle: document.getElementById("evaluationSectionTitle"),
  evaluationModelSelect: document.getElementById("evaluationModelSelect"),
  evaluationPartSelect: document.getElementById("evaluationPartSelect"),
  evaluationEmployeeCodeSelect: document.getElementById("evaluationEmployeeCodeSelect"),
  evaluationEmployeeNameSelect: document.getElementById("evaluationEmployeeNameSelect"),
  evaluationEvaluatorSelect: document.getElementById("evaluationEvaluatorSelect"),
  evaluationSelectedPart: document.getElementById("evaluationSelectedPart"),
  evaluationLatestExam: document.getElementById("evaluationLatestExam"),
  evaluationMessage: document.getElementById("evaluationMessage"),
  saveEvaluationBtn: document.getElementById("saveEvaluationBtn"),
  resetEvaluationBtn: document.getElementById("resetEvaluationBtn"),
  evaluationSheetTitle: document.getElementById("evaluationSheetTitle"),
  evaluationMetaCode: document.getElementById("evaluationMetaCode"),
  evaluationMetaName: document.getElementById("evaluationMetaName"),
  evaluationMetaPart: document.getElementById("evaluationMetaPart"),
  evaluationMetaEvaluator: document.getElementById("evaluationMetaEvaluator"),
  evaluationRows: document.getElementById("evaluationRows"),
  evaluationTotal: document.getElementById("evaluationTotal"),
  evaluationMax: document.getElementById("evaluationMax"),
  evaluationSearchInput: document.getElementById("evaluationSearchInput"),
  evaluationHistoryPartFilter: document.getElementById("evaluationHistoryPartFilter"),
  evaluationHistoryEvaluatorFilter: document.getElementById("evaluationHistoryEvaluatorFilter"),
  evaluationHistoryEmpty: document.getElementById("evaluationHistoryEmpty"),
  evaluationHistoryTableWrap: document.getElementById("evaluationHistoryTableWrap"),
  evaluationHistoryBody: document.getElementById("evaluationHistoryBody")
};

function createEvaluationDraft() {
  return {
    sectionTitle: "เธซเธฑเธงเธเนเธญเธ—เธตเน 1 : เธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธเธซเธเนเธฒเธเธฒเธ เนเธฅเธฐเธ—เธฑเธเธฉเธฐเธเธฒเธ",
    modelKey: "",
    examId: "",
    employeeId: "",
    employeeCode: "",
    employeeName: "",
    evaluator: state.currentUser?.role === "admin" ? (state.currentUser.fullName || "") : "",
    rows: EVALUATION_ROW_SEED.map((row, index) => ({
      id: `eval-row-${index + 1}`,
      no: index + 1,
      item: row.item,
      method: row.method,
      weight: row.weight,
      score: 0
    }))
  };
}

state.evaluationForm = createEvaluationDraft();

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(payload.error || payload || `Request failed: ${response.status}`);
  }

  return payload;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatDateTime(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function getCurrentExam() {
  return state.examSets[state.currentExamIndex];
}

function getFilteredExamSets() {
  if (!state.selectedModelKey) {
    return state.examSets;
  }
  return state.examSets.filter((exam) => `${exam.modelCode}|${exam.modelName}` === state.selectedModelKey);
}

function getCurrentFilteredIndex() {
  const filtered = getFilteredExamSets();
  const current = getCurrentExam();
  return filtered.findIndex((exam) => exam.id === current?.id);
}

function buildModelList() {
  state.models = Array.from(
    new Map(
      state.examSets.map((exam) => {
        const key = `${exam.modelCode}|${exam.modelName}`;
        return [
          key,
          {
            key,
            modelCode: exam.modelCode,
            modelName: exam.modelName,
            count: state.examSets.filter((item) => `${item.modelCode}|${item.modelName}` === key).length
          }
        ];
      })
    ).values()
  );
}

function setMessage(target, message, isError = false) {
  target.textContent = message;
  target.classList.remove("hidden");
  target.style.background = isError ? "#ffeceb" : "#f6f9fd";
  target.style.borderColor = isError ? "#ffc3bc" : "#dbe5f1";
  target.style.color = isError ? "#9f3c33" : "#52627e";
}

function resetExamState() {
  const exam = getCurrentExam();
  if (!exam) return;

  state.currentQuestionIndex = 0;
  state.answers = Array(exam.questions.length).fill(null);
  state.remainingSeconds = exam.durationMinutes * 60;
  state.started = false;
  state.submitted = false;
  state.lastSubmittedSignature = "";

  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  elements.resultPanel.classList.add("hidden");
}

function renderAuth() {
  if (!state.currentUser) {
    elements.loginShell.classList.remove("hidden");
    elements.appShell.classList.add("hidden");
    return;
  }

  elements.loginShell.classList.add("hidden");
  elements.appShell.classList.remove("hidden");

  const roleText = state.currentUser.role === "admin" ? "เธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ" : "เธเธเธฑเธเธเธฒเธ";
  const displayName = state.currentUser.fullName || state.currentUser.username || state.currentUser.employeeCode;
  const employeeCode = state.currentUser.employeeCode || state.currentUser.username || "-";

  elements.sidebarUserName.textContent = displayName;
  elements.sidebarUserRole.textContent = `เธชเธดเธ—เธเธดเน: ${roleText}`;
  elements.sidebarUserId.textContent = `เธฃเธซเธฑเธชเธเธเธฑเธเธเธฒเธ: ${employeeCode}`;

  elements.profileUserName.textContent = displayName;
  elements.profileEmployeeCode.textContent = employeeCode;
  elements.profileUserRole.textContent = roleText;
  elements.profileDepartment.textContent = state.currentUser.department || "-";
  elements.profilePosition.textContent = state.currentUser.position || "-";

  elements.adminOnlyNodes.forEach((node) => {
    node.classList.toggle("hidden", state.currentUser.role !== "admin");
  });

  if (state.currentView === "admin" && state.currentUser.role !== "admin") {
    state.currentView = "exam";
  }
}

function setView(viewName) {
  state.currentView = viewName;

  const titleMap = {
    exam: "เธ—เธณเธเนเธญเธชเธญเธเธญเธญเธเนเธฅเธเน",
    history: state.currentUser?.role === "admin" ? "เธเธฅเธชเธญเธเธเธญเธเธเธนเนเนเธเนเธเธฒเธเธ—เธฑเนเธเธซเธกเธ”" : "เธเธฅเธเธฐเนเธเธเธขเนเธญเธเธซเธฅเธฑเธ",
    profile: "เธเนเธญเธกเธนเธฅเธเธเธฑเธเธเธฒเธ",
    admin: "เธเธฑเธ”เธเธฒเธฃเธเธฅเธฑเธเธเนเธญเธชเธญเธ"
  };

  elements.pageHeading.textContent = titleMap[viewName] || "Factory Online Exam";
  elements.examView.classList.toggle("hidden", viewName !== "exam");
  elements.historyView.classList.toggle("hidden", viewName !== "history");
  elements.profileView.classList.toggle("hidden", viewName !== "profile");
  elements.adminView.classList.toggle("hidden", viewName !== "admin");

  elements.navItems.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
}

function renderAdminInfo() {
  elements.dataSourceLabel.textContent =
    state.dataSource === "custom" ? "เนเธเนเธเธฅเธฑเธเธเนเธญเธชเธญเธเนเธเธเธญเธฑเธเนเธซเธฅเธ”" : "เนเธเนเธเธฅเธฑเธเธเนเธญเธชเธญเธเธซเธฅเธฑเธเธเธญเธเธฃเธฐเธเธ";
  elements.dataSummaryLabel.textContent = `${state.models.length} models / ${state.examSets.length} parts`;
  elements.adminDataInfo.innerHTML = `
    <span>Exam sets: ${state.examSets.length}</span>
    <span>Models: ${state.models.length}</span>
    <span>Source: ${state.dataSource}</span>
    <span>Updated: ${formatDateTime(state.updatedAt)}</span>
  `;
}

function renderModelSelector() {
  elements.modelSelector.innerHTML = "";
  state.models.forEach((model) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `model-pill${state.selectedModelKey === model.key ? " active" : ""}`;
    button.textContent = `${model.modelCode} - ${model.modelName} (${model.count})`;
    button.addEventListener("click", () => {
      state.selectedModelKey = model.key;
      const firstExam = getFilteredExamSets()[0];
      const nextIndex = state.examSets.findIndex((exam) => exam.id === firstExam?.id);
      if (nextIndex >= 0) {
        state.currentExamIndex = nextIndex;
        resetExamState();
        renderAll();
      }
    });
    elements.modelSelector.appendChild(button);
  });
}

function renderExamSelector() {
  elements.examSelector.innerHTML = "";
  getFilteredExamSets().forEach((exam) => {
    const index = state.examSets.findIndex((item) => item.id === exam.id);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `exam-card${index === state.currentExamIndex ? " active" : ""}`;
    card.innerHTML = `
      <h4>${exam.title}</h4>
      <p>${exam.description}</p>
      <div class="exam-tags">
        <span>${exam.questions.length} เธเนเธญ</span>
        <span>${exam.durationMinutes} เธเธฒเธ—เธต</span>
        <span>เธเนเธฒเธ ${exam.passScore} เธเธฐเนเธเธ</span>
      </div>
    `;
    card.addEventListener("click", () => {
      state.currentExamIndex = index;
      resetExamState();
      renderAll();
    });
    elements.examSelector.appendChild(card);
  });
}

function renderHeader() {
  const exam = getCurrentExam();
  if (!exam) return;

  document.title = `${state.examTitle} - ${exam.title}`;
  elements.systemTitle.textContent = state.examTitle;
  elements.examTitle.textContent = exam.title;
  elements.examDescription.textContent = `${exam.description} (${exam.modelCode} / ${exam.modelName} / ${exam.partCode})`;
  elements.examMetaQuestions.textContent = `${exam.questions.length} เธเนเธญ`;
  elements.examMetaTime.textContent = `${exam.durationMinutes} เธเธฒเธ—เธต`;
  elements.examMetaPassScore.textContent = `เธเนเธฒเธ ${exam.passScore} เธเธฐเนเธเธ`;
}

function renderQuestion() {
  const exam = getCurrentExam();
  if (!exam) return;

  const question = exam.questions[state.currentQuestionIndex];
  const answer = state.answers[state.currentQuestionIndex];

  elements.questionTitle.textContent = `เธเนเธญ ${question.number}`;
  elements.currentQuestionText.textContent = `เธเนเธญ ${state.currentQuestionIndex + 1} เธเธฒเธ ${exam.questions.length}`;
  elements.questionText.textContent = question.text;
  elements.questionBadge.textContent =
    answer === null ? "เธขเธฑเธเนเธกเนเนเธ”เนเน€เธฅเธทเธญเธเธเธณเธ•เธญเธ" : `เน€เธฅเธทเธญเธเธเนเธญ ${question.choiceKeys[answer]} เนเธฅเนเธง`;
  elements.choicesContainer.innerHTML = "";

  if (question.imageUrl) {
    elements.questionImage.src = question.imageUrl;
    elements.questionImage.classList.remove("hidden");
  } else {
    elements.questionImage.classList.add("hidden");
    elements.questionImage.removeAttribute("src");
  }

  question.choices.forEach((choice, index) => {
    const choiceBtn = document.createElement("button");
    choiceBtn.type = "button";
    choiceBtn.className = "exam-option";

    if (answer === index) {
      choiceBtn.classList.add("selected");
    }

    if (state.submitted) {
      if (index === question.answer) choiceBtn.classList.add("correct");
      else if (answer === index) choiceBtn.classList.add("wrong");
    }

    choiceBtn.innerHTML = `<strong>${question.choiceKeys[index]}</strong>${choice}`;
    choiceBtn.addEventListener("click", () => {
      if (!state.started || state.submitted) return;
      state.answers[state.currentQuestionIndex] = index;
      renderAll();
    });
    elements.choicesContainer.appendChild(choiceBtn);
  });

  elements.prevBtn.disabled = state.currentQuestionIndex === 0;
  elements.nextBtn.disabled = state.currentQuestionIndex === exam.questions.length - 1;
}

function renderQuestionNav() {
  const exam = getCurrentExam();
  if (!exam) return;

  elements.questionNav.innerHTML = "";
  exam.questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "question-index";
    button.textContent = question.number;

    if (index === state.currentQuestionIndex) button.classList.add("current");
    if (state.answers[index] !== null) button.classList.add("answered");

    button.addEventListener("click", () => {
      state.currentQuestionIndex = index;
      renderAll();
    });
    elements.questionNav.appendChild(button);
  });
}

function renderSummary() {
  const exam = getCurrentExam();
  if (!exam) return;

  const answered = state.answers.filter((item) => item !== null).length;
  const unanswered = exam.questions.length - answered;
  const percent = Math.round((answered / exam.questions.length) * 100);
  const filtered = getFilteredExamSets();
  const filteredIndex = getCurrentFilteredIndex();

  elements.timeRemaining.textContent = formatTime(state.remainingSeconds);
  elements.answeredCount.textContent = `${answered} / ${exam.questions.length}`;
  elements.summaryAnsweredCount.textContent = `${answered} เธเนเธญ`;
  elements.unansweredCount.textContent = `${unanswered} เธเนเธญ`;
  elements.progressPercent.textContent = `${percent}%`;
  elements.progressBar.style.width = `${percent}%`;

  if (state.submitted) {
    elements.examStatus.textContent = "เธชเนเธเธเนเธญเธชเธญเธเนเธฅเนเธง";
    elements.summaryStatus.textContent = "เน€เธชเธฃเนเธเธชเธดเนเธ";
  } else if (state.started) {
    elements.examStatus.textContent = "เธเธณเธฅเธฑเธเธ—เธณเธเนเธญเธชเธญเธ";
    elements.summaryStatus.textContent = "เธเธณเธฅเธฑเธเธชเธญเธ";
  } else {
    elements.examStatus.textContent = "เธขเธฑเธเนเธกเนเนเธ”เนเน€เธฃเธดเนเธกเธชเธญเธ";
    elements.summaryStatus.textContent = "เธฃเธญเน€เธฃเธดเนเธกเธชเธญเธ";
  }

  elements.startExamBtn.disabled = state.loading || Boolean(state.loadError) || (state.started && !state.submitted);
  elements.submitExamBtn.disabled = state.loading || Boolean(state.loadError) || !state.started || state.submitted;

  if (!state.loadError) {
    setMessage(elements.loadStatus, `เนเธกเน€เธ”เธฅเธเธตเนเธกเธต ${filtered.length} เธเธธเธ”เธเนเธญเธชเธญเธ | เธเธธเธ”เธเธฑเธเธเธธเธเธฑเธ ${filteredIndex + 1} เธเธฒเธ ${filtered.length}`);
  }
}

async function saveResultToServer(payload) {
  await api("/api/results", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function renderResult() {
  const exam = getCurrentExam();
  if (!exam || !state.submitted) {
    elements.resultPanel.classList.add("hidden");
    return;
  }

  let correctCount = 0;
  let earnedScore = 0;

  exam.questions.forEach((question, index) => {
    if (state.answers[index] === question.answer) {
      correctCount += 1;
      earnedScore += question.score;
    }
  });

  const totalScore = exam.questions.reduce((sum, question) => sum + question.score, 0);
  const percent = totalScore ? Math.round((earnedScore / totalScore) * 100) : 0;
  const wrongCount = exam.questions.length - correctCount;
  const passed = earnedScore >= exam.passScore;

  elements.scoreValue.textContent = `${earnedScore} / ${totalScore}`;
  elements.scorePercent.textContent = `${percent}%`;
  elements.correctCount.textContent = `${correctCount} เธเนเธญ`;
  elements.wrongCount.textContent = `${wrongCount} เธเนเธญ`;
  elements.resultMessage.textContent = passed
    ? `เธเนเธฒเธเน€เธเธ“เธ‘เนเนเธฅเนเธง เธเธฑเนเธเธ•เนเธณ ${exam.passScore} เธเธฐเนเธเธ เนเธฅเธฐเธเธธเธ“เธ—เธณเนเธ”เน ${earnedScore} เธเธฐเนเธเธ`
    : `เธขเธฑเธเนเธกเนเธเนเธฒเธเน€เธเธ“เธ‘เน เธเธฑเนเธเธ•เนเธณ ${exam.passScore} เธเธฐเนเธเธ เนเธ•เนเธเธธเธ“เธ—เธณเนเธ”เน ${earnedScore} เธเธฐเนเธเธ`;

  elements.resultPanel.classList.remove("hidden");

  const payload = {
    user_id: state.currentUser.id,
    username: state.currentUser.username || state.currentUser.employeeCode,
    employee_code: state.currentUser.employeeCode || state.currentUser.username,
    full_name: state.currentUser.fullName || state.currentUser.username || state.currentUser.employeeCode,
    role: state.currentUser.role,
    exam_id: exam.id,
    exam_title: exam.title,
    model_code: exam.modelCode,
    model_name: exam.modelName,
    part_code: exam.partCode,
    score: earnedScore,
    total_score: totalScore,
    percent,
    correct_count: correctCount,
    wrong_count: wrongCount,
    question_count: exam.questions.length,
    passed,
    submitted_at: new Date().toISOString()
  };

  const signature = JSON.stringify(payload);
  if (state.lastSubmittedSignature === signature) {
    return;
  }

  state.lastSubmittedSignature = signature;
  saveResultToServer(payload)
    .then(loadResults)
    .catch((error) => {
      setMessage(elements.resultMessage, `เธเธฑเธเธ—เธถเธเธเธฅเธชเธญเธเนเธกเนเธชเธณเน€เธฃเนเธ: ${error.message}`, true);
    });
}

function renderHistory() {
  const results = state.results;
  const average = results.length ? Math.round(results.reduce((sum, item) => sum + item.percent, 0) / results.length) : 0;
  const passed = results.filter((item) => item.passed).length;
  const last = results[0];

  elements.historyStats.innerHTML = `
    <div class="stat-box"><span>${state.currentUser?.role === "admin" ? "เธเธฅเธชเธญเธเธ—เธฑเนเธเธซเธกเธ”" : "เธเธณเธเธงเธเธเธฃเธฑเนเธเธ—เธตเนเธชเธญเธ"}</span><strong>${results.length}</strong></div>
    <div class="stat-box"><span>เธเนเธฒเน€เธเธฅเธตเนเธข</span><strong>${average}%</strong></div>
    <div class="stat-box"><span>${state.currentUser?.role === "admin" ? "เธฃเธฒเธขเธเธฒเธฃเธเนเธฒเธเน€เธเธ“เธ‘เน" : "เธเนเธฒเธเน€เธเธ“เธ‘เน"}</span><strong>${passed}</strong></div>
  `;

  elements.profileExamCount.textContent = String(results.length);
  elements.profileLastScore.textContent = last ? `${last.score} / ${last.total_score}` : "-";

  if (!results.length) {
    elements.historyList.innerHTML = `
      <article class="history-card">
        <h4>เธขเธฑเธเนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธเธฅเธชเธญเธ</h4>
        <p>${state.currentUser?.role === "admin" ? "เน€เธกเธทเนเธญเธกเธตเธเธนเนเนเธเนเธเธฒเธเธชเนเธเธเนเธญเธชเธญเธ เธฃเธฐเธเธเธเธฐเนเธชเธ”เธเธฃเธฒเธขเธเธฒเธฃเธ—เธฑเนเธเธซเธกเธ”เธ—เธตเนเธเธตเน" : "เน€เธกเธทเนเธญเธชเนเธเธเนเธญเธชเธญเธเนเธฅเนเธง เธฃเธฐเธเธเธเธฐเธเธฑเธเธ—เธถเธเธเธฅเธชเธญเธเนเธงเนเนเธเธเธฒเธเธเนเธญเธกเธนเธฅ"}</p>
      </article>
    `;
    return;
  }

  elements.historyList.innerHTML = results
    .map((item) => {
      const ownerLabel =
        state.currentUser?.role === "admin"
          ? `<span>${item.employee_code || "-"}</span><span>${item.full_name || item.username}</span>`
          : "";

      return `
        <article class="history-card">
          <h4>${item.exam_title}</h4>
          <p>${item.model_code} / ${item.model_name} / ${item.part_code}</p>
          <div class="history-meta">
            <span>${item.score} / ${item.total_score}</span>
            <span>${item.percent}%</span>
            <span>${item.passed ? "เธเนเธฒเธ" : "เนเธกเนเธเนเธฒเธ"}</span>
            <span>${formatDateTime(item.submitted_at)}</span>
            ${ownerLabel}
          </div>
          <strong>เธ•เธญเธเธ–เธนเธ ${item.correct_count} เธเนเธญ เธเธฒเธ ${item.question_count} เธเนเธญ</strong>
        </article>
      `;
    })
    .join("");
}

async function loadResults() {
  if (!state.currentUser) return;

  const query = new URLSearchParams({
    role: state.currentUser.role,
    userId: state.currentUser.id
  });

  const payload = await api(`/api/results?${query.toString()}`);
  state.results = payload.results || [];
  renderHistory();
}

function submitExam(autoSubmit = false) {
  if (!state.started || state.submitted) return;
  state.submitted = true;

  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  if (autoSubmit) {
    elements.examStatus.textContent = "เธซเธกเธ”เน€เธงเธฅเธฒ เธฃเธฐเธเธเธชเนเธเธเนเธญเธชเธญเธเนเธซเนเธญเธฑเธ•เนเธเธกเธฑเธ•เธดเนเธฅเนเธง";
  }

  renderAll();
}

function startExam() {
  if (state.started && !state.submitted) return;
  const exam = getCurrentExam();
  if (!exam) return;

  resetExamState();
  state.started = true;

  if (exam.randomizeQuestions) {
    exam.questions = exam.questions
      .map((question) => ({ question, sort: Math.random() }))
      .sort((left, right) => left.sort - right.sort)
      .map(({ question }) => question);
  }

  state.timerId = setInterval(() => {
    state.remainingSeconds -= 1;
    if (state.remainingSeconds <= 0) {
      state.remainingSeconds = 0;
      submitExam(true);
      return;
    }
    renderSummary();
  }, 1000);

  renderAll();
}

function renderAll() {
  renderAuth();
  if (!state.currentUser || !state.examSets.length) return;

  renderModelSelector();
  renderExamSelector();
  renderHeader();
  renderSummary();
  renderQuestion();
  renderQuestionNav();
  renderResult();
  renderHistory();
  renderAdminInfo();
}

async function loadExamData() {
  try {
    state.loading = true;
    state.loadError = "";
    setMessage(elements.loadStatus, "เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธธเธ”เธเนเธญเธชเธญเธ...");

    const payload = await api("/api/exams");
    state.examTitle = payload.title || "Factory Online Exam";
    state.examSets = payload.examSets || [];
    state.dataSource = payload.source || "default";
    state.updatedAt = payload.updatedAt || "";

    if (!state.examSets.length) {
      throw new Error("เนเธกเนเธเธเธเธธเธ”เธเนเธญเธชเธญเธเนเธเธฃเธฐเธเธ");
    }

    buildModelList();
    state.selectedModelKey = state.models[0]?.key || "";
    state.currentExamIndex = 0;
    state.loading = false;
    resetExamState();
    renderAll();
  } catch (error) {
    state.loading = false;
    state.loadError = error.message;
    setMessage(elements.loadStatus, `เนเธซเธฅเธ”เธเนเธญเธชเธญเธเนเธกเนเธชเธณเน€เธฃเนเธ: ${error.message}`, true);
  }
}

async function importCustomJson() {
  const file = elements.adminFileInput.files[0];
  if (!file) {
    setMessage(elements.adminMessage, "เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเนเธเธฅเน JSON เธเนเธญเธ", true);
    return;
  }

  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const result = await api("/api/admin/exam-bank", {
      method: "POST",
      body: JSON.stringify({
        role: state.currentUser.role,
        payload
      })
    });
    setMessage(elements.adminMessage, `เธเธณเน€เธเนเธฒเธเนเธญเธชเธญเธเธชเธณเน€เธฃเนเธ ${result.examSetCount} เธเธธเธ”`);
    await loadExamData();
  } catch (error) {
    setMessage(elements.adminMessage, `เธเธณเน€เธเนเธฒเนเธกเนเธชเธณเน€เธฃเนเธ: ${error.message}`, true);
  }
}

async function resetCustomJson() {
  try {
    await api("/api/admin/reset-exam-bank", {
      method: "POST",
      body: JSON.stringify({ role: state.currentUser.role })
    });
    setMessage(elements.adminMessage, "เธเธฅเธฑเธเนเธเนเธเนเธเธฅเธฑเธเธเนเธญเธชเธญเธเน€เธ”เธดเธกเนเธฅเนเธง");
    await loadExamData();
  } catch (error) {
    setMessage(elements.adminMessage, `เธฃเธตเน€เธเนเธ•เนเธกเนเธชเธณเน€เธฃเนเธ: ${error.message}`, true);
  }
}

function getEvaluationModelKey(exam) {
  return `${exam.modelCode}|${exam.modelName}`;
}

function getEvaluationModelOptions() {
  return Array.from(
    new Map(
      state.examSets.map((exam) => [
        getEvaluationModelKey(exam),
        {
          key: getEvaluationModelKey(exam),
          modelCode: exam.modelCode,
          modelName: exam.modelName
        }
      ])
    ).values()
  );
}

function getEvaluationExamOptions() {
  if (!state.evaluationForm.modelKey) {
    return [];
  }

  return state.examSets.filter((exam) => getEvaluationModelKey(exam) === state.evaluationForm.modelKey);
}

function getSelectedEvaluationExam() {
  return state.examSets.find((exam) => exam.id === state.evaluationForm.examId) || null;
}

function findEmployeeById(employeeId) {
  return state.employees.find((employee) => employee.id === employeeId) || null;
}

function findEmployeeByCode(employeeCode) {
  return state.employees.find((employee) => employee.employeeCode === employeeCode) || null;
}

function findEmployeeByName(fullName) {
  return state.employees.find((employee) => employee.fullName === fullName) || null;
}

function calculateEvaluationTotal(rows = state.evaluationForm.rows) {
  return rows.reduce((sum, row) => sum + Number(row.weight || 0) * Number(row.score || 0), 0);
}

function calculateEvaluationMax(rows = state.evaluationForm.rows) {
  return rows.reduce((sum, row) => sum + Number(row.weight || 0) * EVALUATION_SCORE_LEVELS[EVALUATION_SCORE_LEVELS.length - 1], 0);
}

function getLatestEvaluationExamResult() {
  const exam = getSelectedEvaluationExam();
  const employeeCode = state.evaluationForm.employeeCode;

  if (!exam || !employeeCode) {
    return null;
  }

  return [...state.results]
    .filter((item) => item.employee_code === employeeCode && item.part_code === exam.partCode)
    .sort((left, right) => new Date(right.submitted_at) - new Date(left.submitted_at))[0] || null;
}

function ensureEvaluationSelection() {
  if (!state.examSets.length) {
    return;
  }

  const modelOptions = getEvaluationModelOptions();
  if (!state.evaluationForm.modelKey || !modelOptions.some((model) => model.key === state.evaluationForm.modelKey)) {
    state.evaluationForm.modelKey = modelOptions[0]?.key || "";
  }

  const examOptions = getEvaluationExamOptions();
  if (!state.evaluationForm.examId || !examOptions.some((exam) => exam.id === state.evaluationForm.examId)) {
    state.evaluationForm.examId = examOptions[0]?.id || "";
  }

  if (state.employees.length) {
    if (!state.evaluationForm.employeeId || !findEmployeeById(state.evaluationForm.employeeId)) {
      const firstEmployee = state.employees[0];
      state.evaluationForm.employeeId = firstEmployee.id;
      state.evaluationForm.employeeCode = firstEmployee.employeeCode;
      state.evaluationForm.employeeName = firstEmployee.fullName;
    }
  } else {
    state.evaluationForm.employeeId = "";
    state.evaluationForm.employeeCode = "";
    state.evaluationForm.employeeName = "";
  }

  if (!state.evaluationForm.evaluator) {
    state.evaluationForm.evaluator = state.currentUser?.fullName || EVALUATION_ASSIGNED_EVALUATORS[0] || "";
  }

  if (!state.evaluationForm.sectionTitle) {
    state.evaluationForm.sectionTitle = createEvaluationDraft().sectionTitle;
  }
}

function syncEvaluationEmployee(employee) {
  if (!employee) {
    state.evaluationForm.employeeId = "";
    state.evaluationForm.employeeCode = "";
    state.evaluationForm.employeeName = "";
    return;
  }

  state.evaluationForm.employeeId = employee.id;
  state.evaluationForm.employeeCode = employee.employeeCode;
  state.evaluationForm.employeeName = employee.fullName;
}

function buildEvaluationPartFilterOptions() {
  const map = new Map();
  state.evaluations.forEach((evaluation) => {
    if (!map.has(evaluation.partCode)) {
      map.set(evaluation.partCode, {
        value: evaluation.partCode,
        label: `${evaluation.partCode} - ${evaluation.partName}`
      });
    }
  });
  return Array.from(map.values());
}

function buildEvaluationEvaluatorOptions() {
  const set = new Set(EVALUATION_ASSIGNED_EVALUATORS);
  state.evaluations.forEach((evaluation) => {
    if (evaluation.evaluator) {
      set.add(evaluation.evaluator);
    }
  });
  return Array.from(set.values());
}

function getFilteredEvaluations() {
  const query = state.evaluationSearch.trim().toLowerCase();

  return [...state.evaluations]
    .filter((evaluation) => {
      if (state.evaluationPartFilter !== "ALL" && evaluation.partCode !== state.evaluationPartFilter) {
        return false;
      }
      if (state.evaluationEvaluatorFilter !== "ALL" && evaluation.evaluator !== state.evaluationEvaluatorFilter) {
        return false;
      }
      if (!query) {
        return true;
      }

      const haystack = [
        evaluation.employeeCode,
        evaluation.employeeName,
        evaluation.partCode,
        evaluation.partName,
        evaluation.modelCode,
        evaluation.modelName,
        evaluation.evaluator
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .sort((left, right) => new Date(right.updatedAt || right.createdAt) - new Date(left.updatedAt || left.createdAt));
}

function renderEvaluationRows() {
  elements.evaluationRows.innerHTML = "";

  state.evaluationForm.rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.no}</td>
      <td>${row.item}</td>
      <td>${row.method}</td>
      <td>${row.weight}</td>
      <td><div class="evaluation-score-options" data-row-id="${row.id}"></div></td>
      <td>${Number(row.weight || 0) * Number(row.score || 0)}</td>
    `;

    const scoreWrap = tr.querySelector(".evaluation-score-options");
    EVALUATION_SCORE_LEVELS.forEach((level) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `evaluation-score-pill${Number(row.score) === level ? " active" : ""}`;
      button.textContent = String(level);
      button.addEventListener("click", () => {
        state.evaluationForm.rows = state.evaluationForm.rows.map((item) =>
          item.id === row.id ? { ...item, score: level } : item
        );
        renderEvaluation();
      });
      scoreWrap.appendChild(button);
    });

    elements.evaluationRows.appendChild(tr);
  });
}

function renderEvaluationHistory() {
  const evaluations = getFilteredEvaluations();

  elements.evaluationHistoryBody.innerHTML = "";
  elements.evaluationHistoryEmpty.classList.toggle("hidden", evaluations.length > 0);
  elements.evaluationHistoryTableWrap.classList.toggle("hidden", evaluations.length === 0);

  if (!evaluations.length) {
    return;
  }

  evaluations.forEach((evaluation) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${evaluation.employeeCode}</td>
      <td>${evaluation.employeeName}</td>
      <td>${evaluation.modelCode}</td>
      <td>${evaluation.partCode} - ${evaluation.partName}</td>
      <td>${evaluation.examScore} / ${evaluation.examTotalScore} (${evaluation.examPercent}%)</td>
      <td>${evaluation.totalScore} / ${evaluation.maxScore}</td>
      <td>${evaluation.evaluator}</td>
      <td>${formatDateTime(evaluation.updatedAt || evaluation.createdAt)}</td>
    `;
    elements.evaluationHistoryBody.appendChild(tr);
  });
}

function renderEvaluation() {
  if (state.currentUser?.role !== "admin") {
    return;
  }

  ensureEvaluationSelection();

  const modelOptions = getEvaluationModelOptions();
  const examOptions = getEvaluationExamOptions();
  const selectedExam = getSelectedEvaluationExam();
  const latestExam = getLatestEvaluationExamResult();
  const total = calculateEvaluationTotal();
  const maxScore = calculateEvaluationMax();

  elements.evaluationSectionTitle.value = state.evaluationForm.sectionTitle;

  elements.evaluationModelSelect.innerHTML = modelOptions
    .map(
      (model) =>
        `<option value="${model.key}"${model.key === state.evaluationForm.modelKey ? " selected" : ""}>${model.modelCode} - ${model.modelName}</option>`
    )
    .join("");

  elements.evaluationPartSelect.innerHTML = examOptions
    .map(
      (exam) =>
        `<option value="${exam.id}"${exam.id === state.evaluationForm.examId ? " selected" : ""}>${exam.partCode} - ${exam.title}</option>`
    )
    .join("");

  elements.evaluationEmployeeCodeSelect.innerHTML = state.employees
    .map(
      (employee) =>
        `<option value="${employee.employeeCode}"${employee.employeeCode === state.evaluationForm.employeeCode ? " selected" : ""}>${employee.employeeCode}</option>`
    )
    .join("");

  elements.evaluationEmployeeNameSelect.innerHTML = state.employees
    .map(
      (employee) =>
        `<option value="${employee.fullName}"${employee.fullName === state.evaluationForm.employeeName ? " selected" : ""}>${employee.fullName}</option>`
    )
    .join("");

  elements.evaluationEvaluatorSelect.innerHTML = buildEvaluationEvaluatorOptions()
    .map(
      (evaluator) =>
        `<option value="${evaluator}"${evaluator === state.evaluationForm.evaluator ? " selected" : ""}>${evaluator}</option>`
    )
    .join("");

  elements.evaluationSelectedPart.textContent = selectedExam
    ? `${selectedExam.modelCode} / ${selectedExam.modelName} / ${selectedExam.partCode}`
    : "-";
  elements.evaluationLatestExam.textContent = latestExam
    ? `${latestExam.score} / ${latestExam.total_score} (${latestExam.percent}%)`
    : "-";

  elements.evaluationSheetTitle.textContent = state.evaluationForm.sectionTitle;
  elements.evaluationMetaCode.textContent = state.evaluationForm.employeeCode || "-";
  elements.evaluationMetaName.textContent = state.evaluationForm.employeeName || "-";
  elements.evaluationMetaPart.textContent = selectedExam ? `${selectedExam.partCode} - ${selectedExam.title}` : "-";
  elements.evaluationMetaEvaluator.textContent = state.evaluationForm.evaluator || "-";
  elements.evaluationTotal.textContent = String(total);
  elements.evaluationMax.textContent = String(maxScore);

  elements.evaluationHistoryPartFilter.innerHTML = [
    `<option value="ALL">ทุก Part</option>`,
    ...buildEvaluationPartFilterOptions().map(
      (option) => `<option value="${option.value}"${option.value === state.evaluationPartFilter ? " selected" : ""}>${option.label}</option>`
    )
  ].join("");

  elements.evaluationHistoryEvaluatorFilter.innerHTML = [
    `<option value="ALL">ผู้ประเมินทั้งหมด</option>`,
    ...buildEvaluationEvaluatorOptions().map(
      (option) => `<option value="${option}"${option === state.evaluationEvaluatorFilter ? " selected" : ""}>${option}</option>`
    )
  ].join("");

  elements.evaluationSearchInput.value = state.evaluationSearch;

  renderEvaluationRows();
  renderEvaluationHistory();
}

async function loadEmployees() {
  if (state.currentUser?.role !== "admin") {
    return;
  }

  const query = new URLSearchParams({ role: state.currentUser.role });
  const payload = await api(`/api/admin/employees?${query.toString()}`);
  state.employees = payload.employees || [];
  ensureEvaluationSelection();
}

async function loadEvaluations() {
  if (state.currentUser?.role !== "admin") {
    return;
  }

  const query = new URLSearchParams({ role: state.currentUser.role });
  const payload = await api(`/api/evaluations?${query.toString()}`);
  state.evaluations = payload.evaluations || [];
}

async function saveEvaluation() {
  const exam = getSelectedEvaluationExam();
  const employee = findEmployeeById(state.evaluationForm.employeeId);

  if (!exam || !employee) {
    setMessage(elements.evaluationMessage, "กรุณาเลือกพนักงานและ Part ที่ต้องการประเมิน", true);
    return;
  }

  const payload = {
    role: state.currentUser.role,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: employee.fullName,
    evaluator: state.evaluationForm.evaluator,
    sectionTitle: state.evaluationForm.sectionTitle.trim(),
    modelCode: exam.modelCode,
    modelName: exam.modelName,
    partCode: exam.partCode,
    partName: exam.title,
    totalScore: calculateEvaluationTotal(),
    maxScore: calculateEvaluationMax(),
    rows: state.evaluationForm.rows
  };

  try {
    const response = await api("/api/evaluations", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const evaluation = response.evaluation;
    const existingIndex = state.evaluations.findIndex((item) => item.id === evaluation.id);
    if (existingIndex >= 0) {
      state.evaluations.splice(existingIndex, 1, evaluation);
    } else {
      state.evaluations.unshift(evaluation);
    }

    setMessage(elements.evaluationMessage, "บันทึกผลการประเมินเรียบร้อยแล้ว");
    renderEvaluation();
  } catch (error) {
    setMessage(elements.evaluationMessage, `บันทึกผลการประเมินไม่สำเร็จ: ${error.message}`, true);
  }
}

function resetEvaluationForm() {
  state.evaluationForm = createEvaluationDraft();
  ensureEvaluationSelection();
  elements.evaluationMessage.classList.add("hidden");
  renderEvaluation();
}

function renderAuth() {
  if (!state.currentUser) {
    elements.loginShell.classList.remove("hidden");
    elements.appShell.classList.add("hidden");
    return;
  }

  elements.loginShell.classList.add("hidden");
  elements.appShell.classList.remove("hidden");

  const roleText = state.currentUser.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน";
  const displayName = state.currentUser.fullName || state.currentUser.username || state.currentUser.employeeCode;
  const employeeCode = state.currentUser.employeeCode || state.currentUser.username || "-";

  elements.sidebarUserName.textContent = displayName;
  elements.sidebarUserRole.textContent = `สิทธิ์: ${roleText}`;
  elements.sidebarUserId.textContent = `รหัสพนักงาน: ${employeeCode}`;

  elements.profileUserName.textContent = displayName;
  elements.profileEmployeeCode.textContent = employeeCode;
  elements.profileUserRole.textContent = roleText;
  elements.profileDepartment.textContent = state.currentUser.department || "-";
  elements.profilePosition.textContent = state.currentUser.position || "-";

  elements.adminOnlyNodes.forEach((node) => {
    node.classList.toggle("hidden", state.currentUser.role !== "admin");
  });

  if ((state.currentView === "admin" || state.currentView === "evaluation") && state.currentUser.role !== "admin") {
    state.currentView = "exam";
  }
}

function setView(viewName) {
  if ((viewName === "admin" || viewName === "evaluation") && state.currentUser?.role !== "admin") {
    viewName = "exam";
  }

  state.currentView = viewName;

  const titleMap = {
    exam: "ทำข้อสอบออนไลน์",
    history: state.currentUser?.role === "admin" ? "ผลสอบของผู้ใช้งานทั้งหมด" : "ผลคะแนนย้อนหลัง",
    profile: "ข้อมูลพนักงาน",
    evaluation: "ประเมินผลหน้างาน",
    admin: "จัดการคลังข้อสอบ"
  };

  elements.pageHeading.textContent = titleMap[viewName] || "Factory Online Exam";
  elements.examView.classList.toggle("hidden", viewName !== "exam");
  elements.historyView.classList.toggle("hidden", viewName !== "history");
  elements.profileView.classList.toggle("hidden", viewName !== "profile");
  elements.evaluationView.classList.toggle("hidden", viewName !== "evaluation");
  elements.adminView.classList.toggle("hidden", viewName !== "admin");

  elements.navItems.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
}

function renderAll() {
  renderAuth();
  if (!state.currentUser || !state.examSets.length) return;

  renderModelSelector();
  renderExamSelector();
  renderHeader();
  renderSummary();
  renderQuestion();
  renderQuestionNav();
  renderResult();
  renderHistory();
  renderAdminInfo();
  renderEvaluation();
}

async function handleLogin(event) {
  event.preventDefault();
  const employeeCode = elements.employeeCodeInput.value.trim().toUpperCase();

  if (!employeeCode) {
    setMessage(elements.loginMessage, "กรุณากรอกรหัสพนักงาน", true);
    return;
  }

  try {
    const payload = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ employeeCode })
    });

    state.currentUser = payload.user;
    safeWrite(STORAGE_KEYS.auth, state.currentUser);
    elements.loginMessage.classList.add("hidden");
    renderAuth();
    setView("exam");
    await loadExamData();
    await loadResults();

    if (state.currentUser.role === "admin") {
      await loadEmployees();
      await loadEvaluations();
    }

    renderAll();
  } catch (error) {
    setMessage(elements.loginMessage, error.message, true);
  }
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.auth);
  state.currentUser = null;
  state.results = [];
  state.examSets = [];
  state.models = [];
  state.employees = [];
  state.evaluations = [];
  state.evaluationSearch = "";
  state.evaluationPartFilter = "ALL";
  state.evaluationEvaluatorFilter = "ALL";
  state.evaluationForm = createEvaluationDraft();

  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  renderAuth();
}

elements.loginForm.addEventListener("submit", handleLogin);
elements.logoutBtn.addEventListener("click", logout);
elements.startExamBtn.addEventListener("click", startExam);
elements.submitExamBtn.addEventListener("click", () => submitExam(false));
elements.prevBtn.addEventListener("click", () => {
  if (state.currentQuestionIndex > 0) {
    state.currentQuestionIndex -= 1;
    renderAll();
  }
});
elements.nextBtn.addEventListener("click", () => {
  const exam = getCurrentExam();
  if (exam && state.currentQuestionIndex < exam.questions.length - 1) {
    state.currentQuestionIndex += 1;
    renderAll();
  }
});
elements.restartExamBtn.addEventListener("click", () => {
  resetExamState();
  renderAll();
});
elements.importJsonBtn.addEventListener("click", importCustomJson);
elements.resetJsonBtn.addEventListener("click", resetCustomJson);
elements.evaluationSectionTitle.addEventListener("input", (event) => {
  state.evaluationForm.sectionTitle = event.target.value;
  renderEvaluation();
});
elements.evaluationModelSelect.addEventListener("change", (event) => {
  state.evaluationForm.modelKey = event.target.value;
  state.evaluationForm.examId = "";
  ensureEvaluationSelection();
  renderEvaluation();
});
elements.evaluationPartSelect.addEventListener("change", (event) => {
  state.evaluationForm.examId = event.target.value;
  renderEvaluation();
});
elements.evaluationEmployeeCodeSelect.addEventListener("change", (event) => {
  syncEvaluationEmployee(findEmployeeByCode(event.target.value));
  renderEvaluation();
});
elements.evaluationEmployeeNameSelect.addEventListener("change", (event) => {
  syncEvaluationEmployee(findEmployeeByName(event.target.value));
  renderEvaluation();
});
elements.evaluationEvaluatorSelect.addEventListener("change", (event) => {
  state.evaluationForm.evaluator = event.target.value;
  renderEvaluation();
});
elements.evaluationSearchInput.addEventListener("input", (event) => {
  state.evaluationSearch = event.target.value;
  renderEvaluationHistory();
});
elements.evaluationHistoryPartFilter.addEventListener("change", (event) => {
  state.evaluationPartFilter = event.target.value;
  renderEvaluationHistory();
});
elements.evaluationHistoryEvaluatorFilter.addEventListener("change", (event) => {
  state.evaluationEvaluatorFilter = event.target.value;
  renderEvaluationHistory();
});
elements.saveEvaluationBtn.addEventListener("click", saveEvaluation);
elements.resetEvaluationBtn.addEventListener("click", resetEvaluationForm);
elements.navItems.forEach((button) => {
  button.addEventListener("click", async () => {
    if ((button.dataset.view === "admin" || button.dataset.view === "evaluation") && state.currentUser?.role !== "admin") {
      return;
    }
    setView(button.dataset.view);
    if (button.dataset.view === "history") {
      await loadResults();
      renderAll();
    }
    if (button.dataset.view === "evaluation" && state.currentUser?.role === "admin") {
      await loadEmployees();
      await loadEvaluations();
      renderEvaluation();
    }
  });
});

async function init() {
  state.currentUser = safeRead(STORAGE_KEYS.auth, null);
  renderAuth();
  setView(state.currentView);

  if (!state.currentUser) {
    return;
  }

  try {
    await loadExamData();
    await loadResults();

    if (state.currentUser.role === "admin") {
      await loadEmployees();
      await loadEvaluations();
    }

    renderAll();
  } catch {
    // handled in load functions
  }
}

init();
