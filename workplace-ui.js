"use strict";
const workplaceTitles = [
  "การเตรียมตัวก่อนปฏิบัติงาน",
  "ปริมาณงาน",
  "คุณภาพงาน",
  "การตอบสนองต่อปัญหา",
];
const workplaceKinds = {
  preparation: "ข้อสอบเตรียมตัวก่อนปฏิบัติงาน",
  response: "ข้อสอบการติดตามปัญหา",
};
let workplaceConfig = null,
  workplaceRevision = 0,
  workplaceQuestions = {},
  workplaceRequest = 0;
function workplaceMessage(text) {
  $("workplaceMessage").textContent = text;
}
function workplaceField(label, id, type = "number", value = "") {
  return `<label class="field"><span>${escapeHtml(label)}</span><input id="${id}" type="${type}" ${type === "number" ? 'min="0" step="any"' : ""} value="${escapeHtml(value)}" required></label>`;
}
let workplaceMode = "quizzes";
function workplaceOpen(mode = "quizzes") {
  if (mode !== "quizzes" && state.user?.role !== "admin") return;
  workplaceMode = mode;
  for (const id of [
    "workplaceView",
    "workplaceSettingsView",
    "workplaceEvaluationMount",
  ])
    $(id).innerHTML = "";
  const root = $(
    mode === "settings"
      ? "workplaceSettingsView"
      : mode === "evaluation"
        ? "workplaceEvaluationMount"
        : "workplaceView",
  );
  const quizzes = `<h3>ข้อสอบประเมินหน้างาน</h3><p>ทำข้อสอบชุดรวมของคุณเพื่อใช้ในการประเมินหน้างาน</p><div class="workplace-quizzes">${Object.entries(
    workplaceKinds,
  )
    .map(
      ([kind, title]) =>
        `<section><h4>${title}</h4><button class="secondary-btn" type="button" data-workplace-quiz="${kind}">ทำข้อสอบของฉัน</button><div id="workplaceQuiz-${kind}"></div></section>`,
    )
    .join("")}</div>`;
  root.innerHTML = `<section class="panel"><p id="workplaceMessage" role="status" aria-live="polite"></p><button type="button" class="secondary-btn" id="workplaceReload">โหลดข้อมูลใหม่</button>${mode === "settings" ? `<section><h3>ตั้งค่าเกณฑ์ น้ำหนัก และข้อสอบ (Admin)</h3><p>แต่ละตัวชี้วัดกำหนดเกณฑ์ระดับ 2, 3, 4 ส่วนค่าที่ไม่ถึงระดับ 2 จะได้ระดับ 1 หัวข้อที่มีหลายตัวชี้วัดใช้ระดับต่ำสุด</p><p>บันทึกการตั้งค่าใหม่จะเริ่มเวอร์ชันใหม่ พนักงานต้องทำข้อสอบทั้งสองชุดใหม่ก่อนประเมิน ผลประเมินที่บันทึกแล้วไม่ถูกคำนวณย้อนหลัง</p><form id="workplaceConfigForm"><div id="workplaceRules"></div><div id="workplaceQuestionEditors"></div><button type="submit" class="primary-btn">บันทึกเกณฑ์และข้อสอบ</button></form></section>` : mode === "evaluation" ? `<form id="workplaceEvaluationForm"><h4>ข้อมูลประเมินของพนักงาน</h4><label class="field"><span>พนักงาน</span><select id="workplaceEmployee"></select></label><div class="workplace-fields">${workplaceField("รอบประเมิน (เดือน)", "wp-period", "month")}${workplaceField("ผู้ประเมิน", "wp-evaluator", "text", state.user.fullName || "")}${workplaceField("ยอดงานจริง", "wp-actual")}${workplaceField("เป้าหมายงาน", "wp-target")}${workplaceField("จำนวน Over cut", "wp-overCut")}${workplaceField("จำนวนตัดกินเนื้อ", "wp-undercut")}${workplaceField("จำนวน Out Flow", "wp-outFlow")}${workplaceField("จำนวน NC", "wp-nc")}${workplaceField("จำนวน CAR", "wp-car")}</div><p>กรอกจำนวนจากรอบประเมินเดียวกัน กรอก 0 เมื่อไม่มีเหตุการณ์ ระบบใช้ผลข้อสอบแยกครั้งล่าสุดในเวอร์ชันเกณฑ์ปัจจุบัน</p><button type="button" class="secondary-btn" id="workplacePreview">คำนวณคะแนน</button> <button type="submit" class="primary-btn">คำนวณและบันทึกผลประเมิน</button><p>บันทึกใหม่จะแทนผลล่าสุดของพนักงานคนนี้ และเก็บหลักฐานการเปลี่ยนแปลงในประวัติผู้ดูแล</p><div id="workplaceScore"></div></form><details><summary>ผลประเมินที่บันทึกไว้</summary><button type="button" class="secondary-btn" id="workplaceHistoryButton">ดูผลล่าสุดของพนักงานที่เลือก</button><div id="workplaceHistory"></div></details>` : quizzes}</section>`;
  $("workplaceReload").onclick = workplaceLoad;
  root
    .querySelectorAll("[data-workplace-quiz]")
    .forEach(
      (b) => (b.onclick = () => workplaceTakeQuiz(b.dataset.workplaceQuiz)),
    );
  if (mode === "settings")
    $("workplaceConfigForm").onsubmit = workplaceSaveConfig;
  if (mode === "evaluation") {
    $("workplacePreview").onclick = () => workplaceEvaluate(false);
    $("workplaceEvaluationForm").onsubmit = (e) => {
      e.preventDefault();
      workplaceEvaluate(true);
    };
    $("workplaceEmployee").onchange = workplaceClearEvidence;
    $("workplaceHistoryButton").onclick = workplaceHistory;
    $("wp-evaluator").oninput = workplaceUpdateMeta;
    $("evaluationSheetTitle").textContent =
      "ส่วนที่ 1 : การปฏิบัติงาน และ ความร่วมมือ";
  }
  workplaceLoad();
}
function workplaceUpdateMeta() {
  if (workplaceMode !== "evaluation") return;
  const name = $("workplaceEmployee")?.selectedOptions[0]?.textContent || "—";
  $("evaluationMetaPart").textContent =
    `พนักงาน: ${name} · ประเมินรวมทุก Model/Part · ผู้ประเมิน: ${$("wp-evaluator").value}`;
}
function workplaceRenderSheet(rows = []) {
  if (workplaceMode !== "evaluation") return;
  const groups = workplaceConfig?.groups || workplaceConfig?.schema || [];
  $("evaluationRows").innerHTML = workplaceTitles
    .map((title, index) => {
      const row = rows[index],
        weight = row?.weight ?? groups[index]?.weight,
        score = row?.score;
      return `<tr><td>${index + 1}</td><td>${escapeHtml(title)}</td>${[1, 2, 3, 4].map((level) => `<td class="evaluation-level-cell">${score === level ? "●" : "—"}</td>`).join("")}<td>คำนวณอัตโนมัติตามเกณฑ์ Admin</td><td>${score ?? "—"}</td><td>${weight ?? "—"}</td><td>${row ? score * weight : "—"}</td></tr>`;
    })
    .join("");
  $("evaluationTotal").textContent = rows.length
    ? rows.reduce((n, r) => n + r.score * r.weight, 0)
    : "—";
  $("evaluationMax").textContent =
    groups.length && groups.every((g) => g.weight)
      ? groups.reduce((n, g) => n + 4 * g.weight, 0)
      : "—";
  workplaceUpdateMeta();
}
function workplaceClearEvidence() {
  for (const key of [
    "actual",
    "target",
    "overCut",
    "undercut",
    "outFlow",
    "nc",
    "car",
  ])
    if ($("wp-" + key)) $("wp-" + key).value = "";
  if ($("workplaceScore")) $("workplaceScore").innerHTML = "";
  if ($("workplaceHistory")) $("workplaceHistory").innerHTML = "";
  workplaceRenderSheet();
}
async function workplaceLoad() {
  const ticket = ++workplaceRequest;
  const token = state.authToken;
  workplaceConfig = null;
  workplaceRevision = 0;
  workplaceClearEvidence();
  for (const kind of Object.keys(workplaceKinds))
    if ($("workplaceQuiz-" + kind)) $("workplaceQuiz-" + kind).innerHTML = "";
  workplaceMessage("กำลังโหลด…");
  if (workplaceMode === "quizzes") {
    workplaceMessage(
      "เลือกข้อสอบแยกที่ต้องการทำ ผลจะส่งเข้าการประเมินหน้างานของคุณ",
    );
    return;
  }
  if ($("workplaceConfigForm"))
    $("workplaceConfigForm").querySelector("button[type=submit]").disabled =
      true;
  if ($("workplacePreview")) $("workplacePreview").disabled = true;
  if ($("workplaceEvaluationForm"))
    $("workplaceEvaluationForm").querySelector("button[type=submit]").disabled =
      true;
  try {
    const [data, roster] = await Promise.all([
      api("/api/workplace/config"),
      workplaceMode === "evaluation"
        ? api("/api/admin/employees")
        : Promise.resolve({ employees: [] }),
    ]);
    if (ticket !== workplaceRequest || token !== state.authToken) return;
    workplaceConfig = data.config;
    workplaceRevision = data.config?.revision || 0;
    if ($("workplaceEmployee"))
      $("workplaceEmployee").innerHTML = roster.employees
        .map(
          (e) =>
            `<option value="${escapeHtml(e.employeeCode)}">${escapeHtml(e.fullName)} (${escapeHtml(e.employeeCode)})</option>`,
        )
        .join("");
    if ($("workplaceRules"))
      $("workplaceRules").innerHTML = data.groups
        .map((group, index) => {
          const saved = data.config?.groups.find((g) => g.key === group.key);
          return `<fieldset><legend>${index + 1}. ${workplaceTitles[index]}</legend>${workplaceField("น้ำหนัก", "wp-weight-" + group.key, "number", saved?.weight ?? "")}${group.metrics.map((key) => `<div class="workplace-rule"><p>${escapeHtml(data.metrics[key][0])} — ${data.metrics[key][1] === "higher" ? "ค่าต้อง ≥ เกณฑ์ (ยิ่งสูงยิ่งดี)" : "ค่าต้อง ≤ เกณฑ์ (ยิ่งต่ำยิ่งดี)"}</p><div class="workplace-fields">${[2, 3, 4].map((level, i) => workplaceField("ระดับ " + level, "wp-threshold-" + key + "-" + i, "number", saved?.metrics[key]?.[i] ?? "")).join("")}</div></div>`).join("")}</fieldset>`;
        })
        .join("");
    workplaceQuestions = structuredClone(
      data.config?.quizzes || { preparation: [], response: [] },
    );
    if (workplaceMode === "settings") workplaceRenderQuestionEditors();
    // Keep schema separately from editable form values.
    workplaceConfig = { ...(workplaceConfig || {}), schema: data.groups };
    workplaceMessage(
      workplaceRevision
        ? "ใช้เกณฑ์เวอร์ชัน " + workplaceRevision
        : "ยังไม่มีเกณฑ์ กรุณาตั้งค่าครบทั้ง 4 หัวข้อและสร้างข้อสอบทั้งสองชุด",
    );
    if ($("workplaceConfigForm"))
      $("workplaceConfigForm").querySelector("button[type=submit]").disabled =
        false;
    if ($("workplacePreview"))
      $("workplacePreview").disabled = !workplaceRevision;
    if ($("workplaceEvaluationForm"))
      $("workplaceEvaluationForm").querySelector(
        "button[type=submit]",
      ).disabled = !workplaceRevision;
    if (workplaceMode === "evaluation") {
      workplaceRenderSheet();
      await loadEvaluations();
    }
  } catch (error) {
    if (ticket === workplaceRequest && token === state.authToken)
      workplaceMessage(error.message);
  }
}
function workplaceReadQuestions() {
  for (const kind of Object.keys(workplaceKinds)) {
    const container = $("wp-editor-" + kind);
    if (!container) continue;
    workplaceQuestions[kind] = [
      ...container.querySelectorAll("[data-question]"),
    ].map((row) => ({
      text: row.querySelector("textarea").value,
      choices: [...row.querySelectorAll("input")].map((i) => i.value),
      answer: Number(row.querySelector("select").value),
    }));
  }
}
function workplaceRenderQuestionEditors() {
  $("workplaceQuestionEditors").innerHTML = Object.entries(workplaceKinds)
    .map(
      ([kind, title]) =>
        `<fieldset><legend>${title}</legend><div id="wp-editor-${kind}">${workplaceQuestions[kind].map((q, index) => `<section data-question class="workplace-question"><label class="field"><span>ข้อ ${index + 1}</span><textarea required>${escapeHtml(q.text)}</textarea></label>${q.choices.map((choice, i) => workplaceField("ตัวเลือก " + (i + 1), "wp-choice-" + kind + "-" + index + "-" + i, "text", choice)).join("")}<label class="field"><span>คำตอบที่ถูกต้อง</span><select>${[0, 1, 2, 3].map((i) => `<option value="${i}" ${q.answer === i ? "selected" : ""}>ตัวเลือก ${i + 1}</option>`).join("")}</select></label><button type="button" data-remove="${kind}:${index}" class="secondary-btn">ลบข้อ</button></section>`).join("")}</div><button type="button" data-add="${kind}" class="secondary-btn">เพิ่มคำถาม</button></fieldset>`,
    )
    .join("");
  $("workplaceQuestionEditors")
    .querySelectorAll("[data-add]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          workplaceReadQuestions();
          workplaceQuestions[b.dataset.add].push({
            text: "",
            choices: ["", "", "", ""],
            answer: 0,
          });
          workplaceRenderQuestionEditors();
        }),
    );
  $("workplaceQuestionEditors")
    .querySelectorAll("[data-remove]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          workplaceReadQuestions();
          const [kind, index] = b.dataset.remove.split(":");
          workplaceQuestions[kind].splice(Number(index), 1);
          workplaceRenderQuestionEditors();
        }),
    );
}
async function workplaceSaveConfig(event) {
  event.preventDefault();
  workplaceReadQuestions();
  const config = {
    groups: workplaceConfig.schema.map((g) => ({
      key: g.key,
      weight: Number($("wp-weight-" + g.key).value),
      metrics: Object.fromEntries(
        g.metrics.map((key) => [
          key,
          [0, 1, 2].map((i) =>
            Number($("wp-threshold-" + key + "-" + i).value),
          ),
        ]),
      ),
    })),
    quizzes: workplaceQuestions,
  };
  const button = event.submitter;
  button.disabled = true;
  try {
    await api("/api/workplace/config", {
      method: "PUT",
      body: JSON.stringify({
        revision: workplaceRevision,
        config,
      }),
    });
    await workplaceLoad();
    workplaceMessage("บันทึกเกณฑ์แล้ว เวอร์ชัน " + workplaceRevision);
  } catch (error) {
    workplaceMessage(error.message);
  } finally {
    button.disabled = false;
  }
}
async function workplaceTakeQuiz(kind) {
  const token = state.authToken;
  const ticket = workplaceRequest;
  const target = $("workplaceQuiz-" + kind);
  target.textContent = "กำลังโหลดข้อสอบ…";
  try {
    const data = await api("/api/workplace/quizzes");
    if (ticket !== workplaceRequest || token !== state.authToken) return;
    target.innerHTML = `<form>${data.quizzes[kind].map((q, index) => `<fieldset><legend>${index + 1}. ${escapeHtml(q.text)}</legend>${q.choices.map((choice, i) => `<label class="workplace-choice"><input type="radio" name="wp-answer-${kind}-${index}" value="${i}" required> ${escapeHtml(choice)}</label>`).join("")}</fieldset>`).join("")}<button type="submit" class="primary-btn">ส่งคำตอบ</button></form>`;
    target.querySelector("form").onsubmit = async (event) => {
      event.preventDefault();
      const button = event.submitter;
      button.disabled = true;
      try {
        const answers = data.quizzes[kind].map((q, index) =>
          Number(
            target.querySelector(
              `input[name="wp-answer-${kind}-${index}"]:checked`,
            ).value,
          ),
        );
        const result = await api("/api/workplace/attempts", {
          method: "POST",
          body: JSON.stringify({
            kind,
            revision: data.revision,
            answers,
          }),
        });
        if (ticket === workplaceRequest && token === state.authToken)
          target.textContent = `บันทึกผลแล้ว ${result.correct}/${result.total} ข้อ (${result.percent.toFixed(2)}%)`;
      } catch (error) {
        workplaceMessage(error.message);
        button.disabled = false;
      }
    };
  } catch (error) {
    if (ticket === workplaceRequest && token === state.authToken)
      target.textContent = error.message;
  }
}
async function workplaceEvaluate(save) {
  const form = $("workplaceEvaluationForm");
  if (!form.reportValidity()) return;
  const body = {
    revision: workplaceRevision,
    employeeCode: $("workplaceEmployee").value,
    period: $("wp-period").value,
    evaluator: $("wp-evaluator").value,
    evidence: Object.fromEntries(
      ["actual", "target", "overCut", "undercut", "outFlow", "nc", "car"].map(
        (key) => [key, Number($("wp-" + key).value)],
      ),
    ),
  };
  const ticket = workplaceRequest,
    employeeCode = body.employeeCode;
  const button = save
    ? form.querySelector("button[type=submit]")
    : $("workplacePreview");
  button.disabled = true;
  try {
    const result = await api(
      "/api/workplace/" + (save ? "evaluations" : "preview"),
      { method: "POST", body: JSON.stringify(body) },
    );
    if (
      ticket !== workplaceRequest ||
      employeeCode !== $("workplaceEmployee").value
    )
      return;
    workplaceRenderSheet(result.rows);
    $("workplaceScore").innerHTML =
      `<h4>${save ? "บันทึกแล้ว" : "ผลคำนวณ"}: ${result.totalScore}/${result.maxScore} (${result.percent}%)</h4><p>คิดเป็น ${(result.percent * 0.6).toFixed(2)} จาก 60 คะแนนของ Skill Matrix</p>${result.rows ? "<ul>" + result.rows.map((r) => `<li>${escapeHtml(r.title)}: ระดับ ${r.score} × น้ำหนัก ${r.weight} = ${r.score * r.weight}</li>`).join("") + "</ul>" : ""}`;
    if (save) {
      await loadEvaluations();
      workplaceMessage("บันทึกผลประเมินเรียบร้อยแล้ว");
    }
  } catch (error) {
    if (ticket === workplaceRequest) {
      $("workplaceScore").innerHTML = "";
      workplaceMessage(error.message);
    }
  } finally {
    button.disabled = false;
  }
}

async function workplaceHistory() {
  const employeeCode = $("workplaceEmployee").value,
    ticket = workplaceRequest;
  try {
    const data = await api(
      "/api/workplace/history?employeeCode=" + encodeURIComponent(employeeCode),
    );
    if (
      ticket !== workplaceRequest ||
      employeeCode !== $("workplaceEmployee").value
    )
      return;
    $("workplaceHistory").innerHTML =
      data.records
        .map(
          (record) =>
            `<article><h4>${escapeHtml(record.updatedAt)} — ${record.totalScore}/${record.maxScore}</h4><p>ผู้ประเมิน: ${escapeHtml(record.evaluator)} · ${record.scope === "legacy" ? "ผลเดิมราย Model/Part: " + escapeHtml(record.modelName) + " / " + escapeHtml(record.partCode) + " · " : "ประเมินรวม · "}${record.evidence ? "รอบ " + escapeHtml(record.evidence.period) : "ผลประเมินเดิม"}</p><ul>${record.rows
              .map(
                (row) =>
                  `<li>${escapeHtml(row.title || row.item || "หัวข้อ")}: ${escapeHtml(row.score)} × ${escapeHtml(row.weight)}${
                    row.evidence
                      ? " — " +
                        escapeHtml(
                          Object.entries(row.evidence)
                            .map(([key, value]) => key + ": " + value)
                            .join(", "),
                        )
                      : ""
                  }</li>`,
              )
              .join("")}</ul></article>`,
        )
        .join("") || "<p>ยังไม่มีผลประเมิน</p>";
  } catch (error) {
    workplaceMessage(error.message);
  }
}
