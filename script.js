const STORAGE_KEYS = {
  auth: "factory_exam_auth",
  history: "factory_exam_history",
  customBank: "factory_exam_custom_bank",
};

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
};

const elements = {
  loginShell: document.getElementById("loginShell"),
  appShell: document.getElementById("appShell"),
  loginForm: document.getElementById("loginForm"),
  usernameInput: document.getElementById("usernameInput"),
  passwordInput: document.getElementById("passwordInput"),
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
  adminView: document.getElementById("adminView"),
  adminPanel: document.getElementById("adminPanel"),
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
  profileUserRole: document.getElementById("profileUserRole"),
  profileExamCount: document.getElementById("profileExamCount"),
  profileLastScore: document.getElementById("profileLastScore"),
  adminFileInput: document.getElementById("adminFileInput"),
  importJsonBtn: document.getElementById("importJsonBtn"),
  resetJsonBtn: document.getElementById("resetJsonBtn"),
  adminMessage: document.getElementById("adminMessage"),
  adminDataInfo: document.getElementById("adminDataInfo"),
  adminOnlyNodes: Array.from(document.querySelectorAll(".admin-only")),
};

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

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeExamData(data) {
  if (data && Array.isArray(data.examSets)) {
    return {
      title: data.title || "Factory Online Exam",
      examSets: data.examSets.map((exam) => ({
        ...exam,
        description: (exam.description || exam.modelName || "").trim(),
        durationMinutes: Number(exam.durationMinutes) || 10,
        passScore: Number(exam.passScore) || 0,
        randomizeQuestions: Boolean(exam.randomizeQuestions),
        showResultImmediately: exam.showResultImmediately !== false,
        questions: exam.questions.map((question, index) => ({
          ...question,
          number: Number(question.number || question.questionNo || index + 1),
          text: (question.text || question.questionText || "").trim(),
          imageUrl: question.imageUrl || null,
          choiceKeys: question.choiceKeys || ["A", "B", "C", "D"].slice(0, (question.choices || []).length),
          choices: Array.isArray(question.choices)
            ? question.choices.map((choice) => String(choice).trim())
            : [],
          answer: Number(question.answer),
          score: Number(question.score) || 1,
        })),
      })),
    };
  }

  if (data && Array.isArray(data.models)) {
    const examSets = [];

    data.models.forEach((model) => {
      (model.parts || []).forEach((part) => {
        const questions = (part.questions || []).map((question, index) => {
          const entries = Object.entries(question.choices || {}).sort(([left], [right]) => left.localeCompare(right));
          const choiceKeys = entries.map(([key]) => key.trim());
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
            score: Number(question.score) || 1,
          };
        });

        examSets.push({
          id: part.id,
          title: String(part.partName || "").trim(),
          description: String(part.subtitle || model.modelName || "").trim(),
          modelCode: String(model.modelCode || "").trim(),
          modelName: String(model.modelName || "").trim(),
          partCode: String(part.partCode || "").trim(),
          durationMinutes: Math.max(Math.ceil(questions.length * 1.5), 10),
          passScore: Number(part.passScore) || 0,
          randomizeQuestions: Boolean(part.randomizeQuestions),
          showResultImmediately: part.showResultImmediately !== false,
          questions,
        });
      });
    });

    return {
      title: data.title || "Factory Online Exam",
      examSets,
    };
  }

  throw new Error("Unsupported exam JSON structure");
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
            count: state.examSets.filter((item) => `${item.modelCode}|${item.modelName}` === key).length,
          },
        ];
      })
    ).values()
  );
}

function resetExamState() {
  const exam = getCurrentExam();
  if (!exam) return;

  state.currentQuestionIndex = 0;
  state.answers = Array(exam.questions.length).fill(null);
  state.remainingSeconds = exam.durationMinutes * 60;
  state.started = false;
  state.submitted = false;

  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  elements.resultPanel.classList.add("hidden");
}

function setLoadMessage(message, isError = false, target = elements.loadStatus) {
  target.textContent = message;
  target.classList.remove("hidden");
  target.style.background = isError ? "#ffeceb" : "#f6f9fd";
  target.style.borderColor = isError ? "#ffc3bc" : "#dbe5f1";
  target.style.color = isError ? "#9f3c33" : "#52627e";
}

function saveAuth(user) {
  state.currentUser = user;
  safeWrite(STORAGE_KEYS.auth, user);
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.auth);
  state.currentUser = null;
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  elements.appShell.classList.add("hidden");
  elements.loginShell.classList.remove("hidden");
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
  elements.sidebarUserName.textContent = state.currentUser.username;
  elements.sidebarUserRole.textContent = `สิทธิ์: ${roleText}`;
  elements.sidebarUserId.textContent = `ID: ${state.currentUser.id}`;
  elements.profileUserName.textContent = state.currentUser.username;
  elements.profileUserRole.textContent = roleText;

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
    exam: "ทำข้อสอบออนไลน์",
    history: "ผลคะแนนย้อนหลัง",
    profile: "บัญชีผู้ใช้",
    admin: "Admin Upload",
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

function getHistory() {
  return safeRead(STORAGE_KEYS.history, []);
}

function saveHistoryEntry(entry) {
  const history = getHistory();
  history.unshift(entry);
  safeWrite(STORAGE_KEYS.history, history.slice(0, 200));
}

function renderHistory() {
  const history = getHistory().filter((item) => item.userId === state.currentUser?.id);

  const average = history.length
    ? Math.round(history.reduce((sum, item) => sum + item.percent, 0) / history.length)
    : 0;
  const passed = history.filter((item) => item.passed).length;
  const last = history[0];

  elements.historyStats.innerHTML = `
    <div class="stat-box"><span>จำนวนครั้งที่สอบ</span><strong>${history.length}</strong></div>
    <div class="stat-box"><span>ค่าเฉลี่ยล่าสุด</span><strong>${average}%</strong></div>
    <div class="stat-box"><span>ผ่านเกณฑ์</span><strong>${passed}</strong></div>
  `;

  elements.profileExamCount.textContent = String(history.length);
  elements.profileLastScore.textContent = last ? `${last.score} / ${last.totalScore}` : "-";

  if (!history.length) {
    elements.historyList.innerHTML = '<article class="history-card"><h4>ยังไม่มีประวัติผลสอบ</h4><p>เมื่อส่งข้อสอบแล้ว ระบบจะบันทึกคะแนนไว้ในเบราว์เซอร์นี้อัตโนมัติ</p></article>';
    return;
  }

  elements.historyList.innerHTML = history
    .map(
      (item) => `
        <article class="history-card">
          <h4>${item.examTitle}</h4>
          <p>${item.modelCode} / ${item.modelName} / ${item.partCode}</p>
          <div class="history-meta">
            <span>${item.score} / ${item.totalScore}</span>
            <span>${item.percent}%</span>
            <span>${item.passed ? "ผ่าน" : "ไม่ผ่าน"}</span>
            <span>${formatDateTime(item.submittedAt)}</span>
          </div>
          <strong>ตอบถูก ${item.correctCount} ข้อ จาก ${item.questionCount} ข้อ</strong>
        </article>
      `
    )
    .join("");
}

function renderAdminInfo() {
  elements.dataSourceLabel.textContent = state.dataSource === "custom" ? "ใช้คลังข้อสอบที่อัปโหลด" : "ใช้ไฟล์ exam-data.json";
  elements.dataSummaryLabel.textContent = `${state.models.length} models / ${state.examSets.length} parts`;

  elements.adminDataInfo.innerHTML = `
    <span>Exam sets: ${state.examSets.length}</span>
    <span>Models: ${state.models.length}</span>
    <span>Source: ${state.dataSource}</span>
    <span>User: ${state.currentUser?.username || "-"}</span>
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
      const filtered = getFilteredExamSets();
      const nextExam = filtered[0];
      const nextIndex = state.examSets.findIndex((exam) => exam.id === nextExam?.id);
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
        <span>${exam.questions.length} ข้อ</span>
        <span>${exam.durationMinutes} นาที</span>
        <span>ผ่าน ${exam.passScore} คะแนน</span>
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
  elements.examMetaQuestions.textContent = `${exam.questions.length} ข้อ`;
  elements.examMetaTime.textContent = `${exam.durationMinutes} นาที`;
  elements.examMetaPassScore.textContent = `ผ่าน ${exam.passScore} คะแนน`;
}

function renderQuestion() {
  const exam = getCurrentExam();
  if (!exam) return;

  const question = exam.questions[state.currentQuestionIndex];
  const answer = state.answers[state.currentQuestionIndex];

  elements.questionTitle.textContent = `ข้อ ${question.number}`;
  elements.currentQuestionText.textContent = `ข้อ ${state.currentQuestionIndex + 1} จาก ${exam.questions.length}`;
  elements.questionText.textContent = question.text;
  elements.questionBadge.textContent = answer === null ? "ยังไม่เลือกคำตอบ" : `เลือกข้อ ${question.choiceKeys[answer]} แล้ว`;
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
    if (answer === index) choiceBtn.classList.add("selected");

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
    if (index === state.currentQuestionIndex) button.classList.add("current");
    if (state.answers[index] !== null) button.classList.add("answered");
    button.textContent = question.number;
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

  const answered = state.answers.filter((answer) => answer !== null).length;
  const unanswered = exam.questions.length - answered;
  const percent = Math.round((answered / exam.questions.length) * 100);
  const filtered = getFilteredExamSets();
  const filteredIndex = getCurrentFilteredIndex();

  elements.timeRemaining.textContent = formatTime(state.remainingSeconds);
  elements.answeredCount.textContent = `${answered} / ${exam.questions.length}`;
  elements.summaryAnsweredCount.textContent = `${answered} ข้อ`;
  elements.unansweredCount.textContent = `${unanswered} ข้อ`;
  elements.progressPercent.textContent = `${percent}%`;
  elements.progressBar.style.width = `${percent}%`;

  if (state.submitted) {
    elements.examStatus.textContent = "ส่งข้อสอบแล้ว";
    elements.summaryStatus.textContent = "เสร็จสิ้น";
  } else if (state.started) {
    elements.examStatus.textContent = "กำลังทำข้อสอบ";
    elements.summaryStatus.textContent = "กำลังสอบ";
  } else {
    elements.examStatus.textContent = "ยังไม่ได้เริ่มสอบ";
    elements.summaryStatus.textContent = "รอเริ่มสอบ";
  }

  elements.startExamBtn.disabled = state.loading || Boolean(state.loadError) || (state.started && !state.submitted);
  elements.submitExamBtn.disabled = state.loading || Boolean(state.loadError);
  if (!state.loadError) {
    setLoadMessage(`โมเดลนี้มี ${filtered.length} ชุดข้อสอบ | ชุดปัจจุบัน ${filteredIndex + 1} จาก ${filtered.length}`);
  }
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
  const percent = Math.round((earnedScore / totalScore) * 100);
  const wrongCount = exam.questions.length - correctCount;
  const passed = earnedScore >= exam.passScore;

  elements.scoreValue.textContent = `${earnedScore} / ${totalScore}`;
  elements.scorePercent.textContent = `${percent}%`;
  elements.correctCount.textContent = `${correctCount} ข้อ`;
  elements.wrongCount.textContent = `${wrongCount} ข้อ`;
  elements.resultMessage.textContent = passed
    ? `ผ่านเกณฑ์แล้ว คะแนนขั้นต่ำคือ ${exam.passScore} คะแนน และคุณทำได้ ${earnedScore} คะแนน`
    : `ยังไม่ผ่านเกณฑ์ คะแนนขั้นต่ำคือ ${exam.passScore} คะแนน แต่คุณทำได้ ${earnedScore} คะแนน`;

  elements.resultPanel.classList.remove("hidden");

  const history = getHistory();
  const latestKey = `${state.currentUser.id}|${exam.id}|${earnedScore}|${percent}|${correctCount}|${wrongCount}`;
  if (!history[0] || history[0].entryKey !== latestKey) {
    saveHistoryEntry({
      entryKey: latestKey,
      userId: state.currentUser.id,
      username: state.currentUser.username,
      examId: exam.id,
      examTitle: exam.title,
      modelCode: exam.modelCode,
      modelName: exam.modelName,
      partCode: exam.partCode,
      score: earnedScore,
      totalScore,
      percent,
      correctCount,
      wrongCount,
      questionCount: exam.questions.length,
      passed,
      submittedAt: new Date().toISOString(),
    });
  }

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
    elements.examStatus.textContent = "หมดเวลา ระบบส่งข้อสอบแล้ว";
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
  if (!state.examSets.length || !state.currentUser) return;
  renderAuth();
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

async function loadDefaultBank() {
  const response = await fetch("./exam-data.json");
  if (!response.ok) {
    throw new Error(`Unable to load exam-data.json (${response.status})`);
  }
  return normalizeExamData(await response.json());
}

async function loadExamData() {
  try {
    state.loading = true;
    setLoadMessage("กำลังโหลดชุดข้อสอบ...");

    const customBank = safeRead(STORAGE_KEYS.customBank, null);
    const normalized = customBank ? normalizeExamData(customBank) : await loadDefaultBank();

    state.examTitle = normalized.title || "Factory Online Exam";
    state.examSets = normalized.examSets || [];
    state.dataSource = customBank ? "custom" : "default";

    if (!state.examSets.length) {
      throw new Error("ไม่พบชุดข้อสอบในข้อมูลที่โหลด");
    }

    buildModelList();
    state.selectedModelKey = state.models[0]?.key || "";
    state.currentExamIndex = 0;
    state.loading = false;
    state.loadError = "";
    resetExamState();
    setLoadMessage(`โหลดข้อสอบสำเร็จ ${state.examSets.length} ชุด`);
    renderAll();
  } catch (error) {
    state.loading = false;
    state.loadError = error.message;
    setLoadMessage("โหลดข้อสอบไม่สำเร็จ ถ้าเปิดผ่านไฟล์ตรง ๆ ให้ใช้ local server เช่น Live Server", true);
  }
}

async function importCustomJson() {
  const file = elements.adminFileInput.files[0];
  if (!file) {
    setLoadMessage("กรุณาเลือกไฟล์ JSON ก่อน", true, elements.adminMessage);
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizeExamData(parsed);
    safeWrite(STORAGE_KEYS.customBank, normalized);
    setLoadMessage(`นำเข้าข้อสอบสำเร็จ ${normalized.examSets.length} ชุด`, false, elements.adminMessage);
    await loadExamData();
  } catch (error) {
    setLoadMessage(`นำเข้าไม่สำเร็จ: ${error.message}`, true, elements.adminMessage);
  }
}

async function resetCustomJson() {
  localStorage.removeItem(STORAGE_KEYS.customBank);
  setLoadMessage("ล้างคลังข้อสอบที่อัปโหลดแล้ว กลับไปใช้ไฟล์เดิม", false, elements.adminMessage);
  await loadExamData();
}

function handleLogin(event) {
  event.preventDefault();
  const username = elements.usernameInput.value.trim();
  const password = elements.passwordInput.value.trim();

  if (!username || !password) {
    setLoadMessage("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน", true, elements.loginMessage);
    return;
  }

  const isAdmin = username.toLowerCase() === "admin" && password === "admin123";
  const user = {
    id: isAdmin ? "ADMIN-001" : `USER-${username.toUpperCase()}`,
    username,
    role: isAdmin ? "admin" : "student",
  };

  saveAuth(user);
  elements.loginMessage.classList.add("hidden");
  renderAuth();
  setView("exam");

  if (!state.examSets.length) {
    loadExamData();
  } else {
    renderAll();
  }
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

elements.navItems.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "admin" && state.currentUser?.role !== "admin") return;
    setView(button.dataset.view);
  });
});

function init() {
  state.currentUser = safeRead(STORAGE_KEYS.auth, null);
  renderAuth();
  setView(state.currentView);
  if (state.currentUser) {
    loadExamData();
  }
}

init();
