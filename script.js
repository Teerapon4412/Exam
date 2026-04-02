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
};

const elements = {
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
};

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

function resetExamState() {
  const exam = getCurrentExam();

  if (!exam) {
    return;
  }

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

function setLoadMessage(message, isError = false) {
  elements.loadStatus.textContent = message;
  elements.loadStatus.style.background = isError ? "#ffeceb" : "#f6f9fd";
  elements.loadStatus.style.borderColor = isError ? "#ffc3bc" : "";
  elements.loadStatus.style.color = isError ? "#9f3c33" : "#52627e";
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

  const filteredExamSets = getFilteredExamSets();

  filteredExamSets.forEach((exam) => {
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

  if (!exam) {
    return;
  }

  document.title = `${state.examTitle} - ${exam.title}`;
  elements.examTitle.textContent = exam.title;
  elements.examDescription.textContent = `${exam.description} (${exam.modelCode} / ${exam.modelName} / ${exam.partCode})`;
  elements.examMetaQuestions.textContent = `${exam.questions.length} ข้อ`;
  elements.examMetaTime.textContent = `${exam.durationMinutes} นาที`;
  elements.examMetaPassScore.textContent = `ผ่าน ${exam.passScore} คะแนน`;
}

function renderQuestion() {
  const exam = getCurrentExam();

  if (!exam) {
    return;
  }

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
    elements.questionImage.removeAttribute("src");
    elements.questionImage.classList.add("hidden");
  }

  question.choices.forEach((choice, index) => {
    const choiceBtn = document.createElement("button");
    choiceBtn.type = "button";
    choiceBtn.className = "exam-option";

    if (answer === index) {
      choiceBtn.classList.add("selected");
    }

    if (state.submitted) {
      if (index === question.answer) {
        choiceBtn.classList.add("correct");
      } else if (answer === index && index !== question.answer) {
        choiceBtn.classList.add("wrong");
      }
    }

    choiceBtn.innerHTML = `<strong>${question.choiceKeys[index]}</strong>${choice}`;
    choiceBtn.addEventListener("click", () => {
      if (!state.started || state.submitted) {
        return;
      }

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

  if (!exam) {
    return;
  }

  elements.questionNav.innerHTML = "";

  exam.questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "question-index";
    button.textContent = question.number;

    if (index === state.currentQuestionIndex) {
      button.classList.add("current");
    }

    if (state.answers[index] !== null) {
      button.classList.add("answered");
    }

    button.addEventListener("click", () => {
      state.currentQuestionIndex = index;
      renderAll();
    });

    elements.questionNav.appendChild(button);
  });
}

function renderSummary() {
  const exam = getCurrentExam();

  if (!exam) {
    return;
  }

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

  elements.startExamBtn.textContent = state.started && !state.submitted ? "กำลังทำข้อสอบ" : "เริ่มสอบ";
  elements.startExamBtn.disabled = state.loading || !!state.loadError || (state.started && !state.submitted);
  elements.submitExamBtn.disabled = state.loading || !!state.loadError;
  elements.loadStatus.textContent = state.loadError
    ? elements.loadStatus.textContent
    : `โมเดลนี้มี ${filtered.length} ชุดข้อสอบ | ชุดปัจจุบัน ${filteredIndex + 1} จาก ${filtered.length}`;
}

function renderResult() {
  const exam = getCurrentExam();

  if (!exam || !state.submitted) {
    elements.resultPanel.classList.add("hidden");
    return;
  }

  let correct = 0;
  let earnedScore = 0;

  exam.questions.forEach((question, index) => {
    if (state.answers[index] === question.answer) {
      correct += 1;
      earnedScore += question.score;
    }
  });

  const totalScore = exam.questions.reduce((sum, question) => sum + question.score, 0);
  const wrong = exam.questions.length - correct;
  const percent = Math.round((earnedScore / totalScore) * 100);
  const passed = earnedScore >= exam.passScore;

  elements.scoreValue.textContent = `${earnedScore} / ${totalScore}`;
  elements.scorePercent.textContent = `${percent}%`;
  elements.correctCount.textContent = `${correct} ข้อ`;
  elements.wrongCount.textContent = `${wrong} ข้อ`;
  elements.resultMessage.textContent = passed
    ? `ผ่านเกณฑ์แล้ว คะแนนขั้นต่ำคือ ${exam.passScore} คะแนน และคุณทำได้ ${earnedScore} คะแนน`
    : `ยังไม่ผ่านเกณฑ์ คะแนนขั้นต่ำคือ ${exam.passScore} คะแนน แต่คุณทำได้ ${earnedScore} คะแนน`;

  elements.resultPanel.classList.remove("hidden");
}

function submitExam(autoSubmit = false) {
  if (!state.started || state.submitted) {
    return;
  }

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
  if (state.started && !state.submitted) {
    return;
  }

  resetExamState();
  state.started = true;

  const exam = getCurrentExam();
  const questions = exam.randomizeQuestions
    ? exam.questions
        .map((question) => ({ question, sort: Math.random() }))
        .sort((left, right) => left.sort - right.sort)
        .map(({ question }) => question)
    : exam.questions;

  exam.questions = questions;

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
  if (!state.examSets.length) {
    return;
  }

  renderModelSelector();
  renderExamSelector();
  renderHeader();
  renderSummary();
  renderQuestion();
  renderQuestionNav();
  renderResult();
}

async function loadExamData() {
  try {
    setLoadMessage("กำลังโหลดชุดข้อสอบ...");

    const response = await fetch("./exam-data.json");
    if (!response.ok) {
      throw new Error(`โหลดข้อมูลไม่สำเร็จ (${response.status})`);
    }

    const data = await response.json();
    state.examTitle = data.title || "Factory Online Exam";
    state.examSets = data.examSets || [];
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
    state.loading = false;

    if (!state.examSets.length) {
      throw new Error("ไม่พบชุดข้อสอบในไฟล์ exam-data.json");
    }

    if (state.models.length) {
      state.selectedModelKey = state.models[0].key;
    }

    resetExamState();
    setLoadMessage(`โหลดข้อสอบสำเร็จ ${state.examSets.length} ชุด`);
    renderAll();
  } catch (error) {
    state.loading = false;
    state.loadError = error.message;
    setLoadMessage(
      "โหลด exam-data.json ไม่สำเร็จ ถ้าเปิดไฟล์แบบตรง ๆ ให้รันผ่าน local server ก่อน เช่น Live Server",
      true
    );
    elements.examStatus.textContent = "โหลดข้อสอบไม่สำเร็จ";
    elements.summaryStatus.textContent = "เกิดข้อผิดพลาด";
  }
}

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

  if (!exam) {
    return;
  }

  if (state.currentQuestionIndex < exam.questions.length - 1) {
    state.currentQuestionIndex += 1;
    renderAll();
  }
});
elements.restartExamBtn.addEventListener("click", () => {
  resetExamState();
  renderAll();
});

loadExamData();
