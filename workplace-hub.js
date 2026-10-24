"use strict";
let workplaceHub = {
  token: "",
  period: "",
  tab: "overview",
  employeeCode: "",
  request: 0,
  settingsDirty: false,
  manualRulesDirty: false,
};
function workplaceHubPeriod() {
  return workplaceHub.token === state.authToken && workplaceHub.period
    ? workplaceHub.period
    : scoreEntryMonth();
}
async function openWorkplaceHub(tab = "overview") {
  const admin = state.user?.role === "admin";
  if (!state.user) return;
  if (workplaceHub.token !== state.authToken)
    workplaceHub = {
      token: state.authToken,
      period: scoreEntryMonth(),
      tab: "overview",
      employeeCode: "",
      request: 0,
      settingsDirty: false,
      manualRulesDirty: false,
    };
  if (!admin && !["overview", "quizzes"].includes(tab)) tab = "overview";
  if (tab !== workplaceHub.tab && !canLeaveWorkplaceHub()) return;
  workplaceHub.settingsDirty = false;
  workplaceHub.manualRulesDirty = false;
  workplaceHub.tab = tab;
  const ticket = ++workplaceHub.request;
  const modes = {
    overview: "workplaceHubView",
    quizzes: "workplaceView",
    scores: "workplaceScorePreviewView",
    settings: "workplaceSettingsView",
    evaluation: "evaluationView",
  };
  document
    .querySelectorAll(".view-section")
    .forEach((node) => node.classList.add("hidden"));
  $("workplaceHubView").classList.remove("hidden");
  $(modes[tab]).classList.remove("hidden");
  document.body.classList.add("workplace-hub-open");
  document.body.classList.toggle("score-entry-preview-open", tab === "scores");
  state.activeView = {
    overview: "workplaceHub",
    quizzes: "workplace",
    scores: "workplaceScorePreview",
    settings: "workplaceSettings",
    evaluation: "evaluation",
  }[tab];
  els.topbar.classList.remove("hidden");
  setText(els.pageHeading, "ประเมินหน้างาน");
  navItems.forEach((button) =>
    button.classList.toggle("active", button.dataset.view === "workplaceHub"),
  );
  const tabs = admin
    ? [
        ["overview", "ภาพรวม / สถานะ"],
        ["quizzes", "ข้อสอบของฉัน"],
        ["scores", "กรอกคะแนนข้อ 2–3"],
        ["settings", "ตั้งค่าข้อสอบข้อ 1 / 4"],
        ["evaluation", "สรุปและบันทึกผล"],
      ]
    : [
        ["overview", "สถานะของฉัน"],
        ["quizzes", "ทำข้อสอบ"],
      ];
  $("workplaceHubView").innerHTML =
    `<section class="panel workplace-hub-header"><div class="workplace-hub-heading"><div><p class="card-label">WORKPLACE ASSESSMENT</p><h3>ประเมินหน้างาน</h3><p>ข้อสอบ คะแนนปริมาณงาน/คุณภาพงาน และผลประเมิน เชื่อมตามพนักงานและงวดเดียวกัน</p></div><label class="field"><span>งวดประเมินร่วม</span><input id="hubPeriod" type="month" value="${escapeHtml(workplaceHub.period)}"></label></div><nav class="workplace-hub-tabs" aria-label="เมนูย่อยการประเมินหน้างาน">${tabs.map(([key, label]) => `<button type="button" class="${key === tab ? "primary-btn" : "secondary-btn"}" data-hub-tab="${key}" ${key === tab ? 'aria-current="page"' : ""}>${label}</button>`).join("")}</nav></section>${tab === "overview" ? '<section class="panel"><p id="hubOverviewMessage" role="status">กำลังโหลดสถานะ…</p><div id="hubOverviewBody"></div></section>' : ""}`;
  $("hubPeriod").onchange = (event) => {
    const period = event.target.value;
    if (!period) {
      event.target.value = workplaceHub.period;
      return;
    }
    if (!canLeaveWorkplaceHub()) {
      event.target.value = workplaceHub.period;
      return;
    }
    workplaceHub.period = period;
    workplaceHub.settingsDirty = false;
    workplaceHub.manualRulesDirty = false;
    openWorkplaceHub(workplaceHub.tab);
  };
  $("workplaceHubView")
    .querySelectorAll("[data-hub-tab]")
    .forEach(
      (button) =>
        (button.onclick = () => openWorkplaceHub(button.dataset.hubTab)),
    );
  if (tab === "quizzes") workplaceOpen();
  else if (tab === "settings") {
    workplaceOpen("settings");
    $("workplaceSettingsView").oninput = () => {
      workplaceHub.settingsDirty = true;
    };
  } else if (tab === "evaluation") {
    workplaceOpen("evaluation");
  } else if (tab === "scores") {
    await openWorkplaceScorePreview();
    if (ticket === workplaceHub.request) await renderManualRules();
  } else await loadWorkplaceOverview(ticket);
}
async function loadWorkplaceOverview(ticket) {
  const token = state.authToken,
    period = workplaceHub.period;
  try {
    const data = await api(
      "/api/workplace/overview?period=" + encodeURIComponent(period),
    );
    if (ticket !== workplaceHub.request || token !== state.authToken) return;
    const root = $("hubOverviewBody");
    $("hubOverviewMessage").textContent =
      (!data.configReady ? "ยังไม่มีข้อสอบ/เกณฑ์ข้อ 1 และ 4 · " : "") +
      (!data.manualRulesReady
        ? "Admin ต้องตั้งเกณฑ์แปลงคะแนนดิบในเมนูกรอกคะแนนข้อ 2–3"
        : "");
    root.innerHTML = `<div class="score-entry-stats"><article><span>พนักงาน</span><strong>${data.entries.length}</strong></article><article><span>ข้อมูลครบพร้อมสรุป</span><strong>${data.entries.filter((e) => e.ready).length}</strong></article><article><span>บันทึกผลแล้ว</span><strong>${data.entries.filter((e) => e.saved && !e.saved.needsUpdate).length}</strong></article></div><div class="score-entry-table-wrap"><table class="score-entry-table"><thead><tr><th>พนักงาน</th><th>1. เตรียมตัว</th><th>2. ปริมาณงาน</th><th>3. คุณภาพงาน</th><th>4. ติดตามปัญหา</th><th>ผลประเมินงวดนี้</th>${state.user.role === "admin" ? "<th>ดำเนินการ</th>" : ""}</tr></thead><tbody>${data.entries.map((entry) => `<tr><th>${escapeHtml(entry.fullName)}<span>${escapeHtml(entry.employeeCode)}</span></th><td>${entry.quiz.preparation ? entry.quiz.preparation.percent.toFixed(2) + "%" : "ยังไม่สอบ"}</td><td>${entry.manual ? entry.manual.quantity : "ยังไม่กรอก"}</td><td>${entry.manual ? entry.manual.quality : "ยังไม่กรอก"}</td><td>${entry.quiz.response ? entry.quiz.response.percent.toFixed(2) + "%" : "ยังไม่สอบ"}</td><td>${entry.saved ? `${entry.saved.percent.toFixed(2)}% · ${entry.saved.needsUpdate ? "ข้อมูลเปลี่ยน ต้องสรุปใหม่" : "บันทึกแล้ว"}` : entry.calculated ? entry.calculated.percent + "% · พร้อมบันทึก" : "ข้อมูลยังไม่ครบ"}</td>${state.user.role === "admin" ? `<td><button type="button" class="secondary-btn" data-hub-employee="${escapeHtml(entry.employeeCode)}">สรุปผล</button></td>` : ""}</tr>`).join("") || '<tr><td colspan="7">ไม่พบพนักงาน</td></tr>'}</tbody></table></div>`;
    root.querySelectorAll("[data-hub-employee]").forEach(
      (button) =>
        (button.onclick = () => {
          workplaceHub.employeeCode = button.dataset.hubEmployee;
          openWorkplaceHub("evaluation");
        }),
    );
  } catch (error) {
    if (
      ticket === workplaceHub.request &&
      token === state.authToken &&
      $("hubOverviewMessage")
    )
      $("hubOverviewMessage").textContent = error.message;
  }
}
async function renderManualRules() {
  if (state.user?.role !== "admin") return;
  const ticket = workplaceHub.request,
    token = state.authToken;
  const panel = document.createElement("section");
  panel.className = "panel";
  panel.id = "manualRulesPanel";
  $("workplaceScorePreviewView").insertBefore(
    panel,
    $("workplaceScorePreviewView").querySelector(".score-entry-panel"),
  );
  panel.textContent = "กำลังโหลดเกณฑ์แปลงคะแนนดิบ…";
  try {
    const data = await api("/api/workplace/manual-rules");
    if (ticket !== workplaceHub.request || token !== state.authToken) return;
    panel.innerHTML = `<div class="panel-head"><div><p class="card-label">SCORING CRITERIA · ADMIN</p><h3>กำหนดเกณฑ์คะแนนข้อ 2–3</h3></div><span id="manualRulesRevision">${data.rules ? "เวอร์ชัน " + data.rules.revision : "ยังไม่กำหนดเกณฑ์"}</span></div><p>กำหนดเพียงครั้งเดียวเพื่อใช้ร่วมทุกงวด ค่าที่ไม่ถึงระดับ 2 จะได้ระดับ 1 การแก้เกณฑ์นี้ไม่ทำให้พนักงานต้องสอบใหม่ ผลที่บันทึกแล้วจะไม่เปลี่ยนจนกว่าจะสรุปผลใหม่</p><form id="manualRulesForm" novalidate>${[
      "quantity",
      "quality",
    ]
      .map((key, index) => {
        const rule = data.rules?.groups.find((g) => g.key === key);
        return `<fieldset><legend>${index + 2}. ${key === "quantity" ? "ปริมาณงาน" : "คุณภาพงาน"}</legend><div class="workplace-fields">${workplaceField("น้ำหนัก", "manual-weight-" + key, "number", rule?.weight ?? "")}<label class="field"><span>ทิศทางคะแนน</span><select id="manual-direction-${key}"><option value="higher">ยิ่งสูงยิ่งดี (≥)</option><option value="lower" ${rule?.direction === "lower" ? "selected" : ""}>ยิ่งต่ำยิ่งดี (≤)</option></select></label>${[0, 1, 2].map((i) => workplaceField("เกณฑ์ระดับ " + (i + 2), "manual-threshold-" + key + "-" + i, "number", rule?.metrics[key + "Raw"][i] ?? "")).join("")}</div><div id="manual-ranges-${key}" class="manual-ranges" aria-live="polite"></div></fieldset>`;
      })
      .join(
        "",
      )}<p id="manualRulesMessage" role="status"></p><button class="primary-btn" type="submit">บันทึกเกณฑ์คะแนนดิบ</button></form>`;
    renderManualRuleRanges();
    $("manualRulesForm").oninput = () => {
      renderManualRuleRanges();
      workplaceHub.manualRulesDirty = true;
    };
    $("manualRulesForm").onsubmit = async (event) => {
      event.preventDefault();
      const button =
        event.submitter ||
        $("manualRulesForm").querySelector("button[type=submit]");
      const invalid = $("manualRulesForm").querySelector(":invalid");
      if (invalid) {
        $("manualRulesMessage").textContent =
          "กรุณาตรวจสอบ " +
          (invalid.closest("label")?.querySelector("span")?.textContent ||
            "ช่องข้อมูล") +
          ": " +
          invalid.validationMessage;
        invalid.focus();
        invalid.reportValidity();
        return;
      }
      button.disabled = true;
      $("manualRulesMessage").textContent = "กำลังบันทึกเกณฑ์…";
      try {
        const rules = WorkplaceScoring.validateManualRules({
          groups: ["quantity", "quality"].map((key) => ({
            key,
            weight: Number($("manual-weight-" + key).value),
            direction: $("manual-direction-" + key).value,
            metrics: {
              [key + "Raw"]: [0, 1, 2].map((i) =>
                Number($("manual-threshold-" + key + "-" + i).value),
              ),
            },
          })),
        });
        const saved = await api("/api/workplace/manual-rules", {
          method: "PUT",
          body: JSON.stringify({ rules, revision: data.rules?.revision || 0 }),
        });
        data.rules = saved.rules;
        $("manualRulesRevision").textContent =
          "เวอร์ชัน " + saved.rules.revision;
        workplaceHub.manualRulesDirty = false;
        $("manualRulesMessage").textContent =
          "บันทึกเกณฑ์คะแนนดิบเรียบร้อยแล้ว";
      } catch (error) {
        $("manualRulesMessage").textContent = error.message;
      } finally {
        button.disabled = false;
      }
    };
  } catch (error) {
    if (panel.isConnected) panel.textContent = error.message;
  }
}

function canLeaveWorkplaceHub() {
  const pendingQuiz =
    workplaceHub.tab === "quizzes" &&
    [...document.querySelectorAll(".workplace-quiz-runner")].some(
      (form) =>
        form.querySelector("input:checked") &&
        !form.querySelector(".result-panel"),
    );
  if (
    !pendingQuiz &&
    !workplaceHub.settingsDirty &&
    !workplaceHub.manualRulesDirty
  )
    return true;
  return window.confirm(
    pendingQuiz
      ? "ยังมีข้อสอบที่ตอบแล้วแต่ยังไม่ส่ง ต้องการออกและเริ่มใหม่ภายหลังหรือไม่?"
      : "มีการตั้งค่าที่ยังไม่บันทึก ต้องการออกจากหน้านี้หรือไม่?",
  );
}
function clearWorkplaceHub() {
  workplaceHub.request++;
  workplaceHub.token = "";
  workplaceHub.period = "";
  workplaceHub.settingsDirty = false;
  workplaceHub.manualRulesDirty = false;
  const root = $("workplaceHubView");
  if (root) root.innerHTML = "";
  document.body.classList.remove("workplace-hub-open");
}

function renderManualRuleRanges() {
  for (const key of ["quantity", "quality"]) {
    const values = [0, 1, 2].map(
        (i) => $("manual-threshold-" + key + "-" + i).value,
      ),
      numbers = values.map(Number),
      higher = $("manual-direction-" + key).value === "higher";
    const valid =
      values.every((value) => value !== "") &&
      numbers.every((value) => Number.isFinite(value) && value >= 0) &&
      (higher
        ? numbers[0] < numbers[1] && numbers[1] < numbers[2]
        : numbers[0] > numbers[1] && numbers[1] > numbers[2]);
    const ranges = valid
      ? higher
        ? [
            `น้อยกว่า ${numbers[0]}`,
            `${numbers[0]} ถึงน้อยกว่า ${numbers[1]}`,
            `${numbers[1]} ถึงน้อยกว่า ${numbers[2]}`,
            `ตั้งแต่ ${numbers[2]} ขึ้นไป`,
          ]
        : [
            `มากกว่า ${numbers[0]}`,
            `มากกว่า ${numbers[1]} ถึง ${numbers[0]}`,
            `มากกว่า ${numbers[2]} ถึง ${numbers[1]}`,
            `ไม่เกิน ${numbers[2]}`,
          ]
      : ["รอกำหนดเกณฑ์", "—", "—", "—"];
    $("manual-ranges-" + key).innerHTML = ranges
      .map(
        (text, index) =>
          `<div><strong>ระดับ ${index + 1}</strong><span>${text}</span></div>`,
      )
      .join("");
  }
}
