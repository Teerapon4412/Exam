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
  if ($("workplaceMessage")) $("workplaceMessage").textContent = text;
  if ($("workplaceSaveStatus")) $("workplaceSaveStatus").textContent = text;
}
function workplaceField(label, id, type = "number", value = "") {
  return `<label class="field"><span>${escapeHtml(label)}</span><input id="${id}" type="${type}" ${type === "number" ? 'min="0" step="any"' : ""} value="${escapeHtml(value)}" required></label>`;
}
let workplaceMode = "quizzes";
let workplaceWeightOverrides = null;
let workplaceSheetRows = [];
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
  root.innerHTML = `<section class="panel"><p id="workplaceMessage" role="status" aria-live="polite"></p><button type="button" class="secondary-btn" id="workplaceReload">โหลดข้อมูลใหม่</button>${mode === "settings" ? `<section><h3>ตั้งค่าเกณฑ์ น้ำหนัก และข้อสอบ (Admin)</h3><p>ตั้งเฉพาะข้อ 1 การเตรียมตัวก่อนปฏิบัติงาน และข้อ 4 การตอบสนองต่อปัญหา โดยกำหนดเกณฑ์ระดับ 2, 3, 4 ส่วนค่าที่ไม่ถึงระดับ 2 จะได้ระดับ 1 ข้อ 2 และข้อ 3 รับข้อมูลและตั้งเกณฑ์คะแนนดิบในเมนูกรอกคะแนนข้อ 2–3</p><p>การแก้เกณฑ์หรือน้ำหนักใช้ผลสอบเดิมในงวดเดียวกันได้ หากเปลี่ยนคำถาม เฉลย คะแนนรายข้อ หรือรูปประกอบ ต้องสอบใหม่เฉพาะชุดที่เปลี่ยน ผลประเมินที่บันทึกแล้วจะไม่เปลี่ยนย้อนหลัง</p><form id="workplaceConfigForm" novalidate><div id="workplaceRules"></div><div id="workplaceQuestionEditors"></div><p id="workplaceSaveStatus" role="status" aria-live="polite"></p><button type="submit" class="primary-btn">บันทึกเกณฑ์และข้อสอบ</button></form></section>` : mode === "evaluation" ? `<form id="workplaceEvaluationForm"><h4>ข้อมูลประเมินของพนักงาน</h4><label class="field"><span>พนักงาน</span><select id="workplaceEmployee"></select></label><div class="workplace-fields">${workplaceField("รอบประเมิน (เดือน)", "wp-period", "month")}${workplaceField("ผู้ประเมิน", "wp-evaluator", "text", state.user.fullName || "")}</div><p>ระบบดึงผลข้อสอบและคะแนนดิบจากพนักงานและงวดที่เลือก คำนวณระดับ 1–4 และน้ำหนักให้อัตโนมัติ</p><div id="workplaceManualScores" role="status"></div><p>Admin แก้ค่าน้ำหนัก (B) ในตารางได้ น้ำหนักที่แก้จะใช้เฉพาะพนักงานและงวดนี้</p><button type="button" class="secondary-btn" id="workplaceResetWeights">ใช้น้ำหนักตามเกณฑ์</button> <button type="button" class="secondary-btn" id="workplacePreview">คำนวณคะแนน</button> <button type="submit" class="primary-btn">คำนวณและบันทึกผลประเมิน</button><p>บันทึกใหม่จะแทนผลล่าสุดของพนักงานคนนี้ และเก็บหลักฐานการเปลี่ยนแปลงในประวัติผู้ดูแล</p><div id="workplaceScore"></div></form><details><summary>ผลประเมินที่บันทึกไว้</summary><button type="button" class="secondary-btn" id="workplaceHistoryButton">ดูผลล่าสุดของพนักงานที่เลือก</button><div id="workplaceHistory"></div></details>` : quizzes}</section>`;
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
    $("workplaceResetWeights").onclick = () => {
      workplaceWeightOverrides = {};
      workplaceEvaluate(false);
    };
    $("workplaceEvaluationForm").onsubmit = (e) => {
      e.preventDefault();
      workplaceEvaluate(true);
    };
    $("workplaceEmployee").onchange = () => {
      workplaceHub.employeeCode = $("workplaceEmployee").value;
      workplaceClearEvidence();
      loadWorkplaceManualEvidence();
    };
    $("wp-period").value = workplaceHubPeriod();
    $("wp-period").closest("label").classList.add("hidden");
    $("wp-period").onchange = loadWorkplaceManualEvidence;
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
  workplaceSheetRows = structuredClone(rows);
  const groups = workplaceConfig?.groups || workplaceConfig?.schema || [];
  $("evaluationRows").innerHTML = workplaceTitles
    .map((title, index) => {
      const row = rows[index],
        weight =
          row?.weight ??
          groups.find(
            (group) =>
              group.key ===
              ["preparation", "quantity", "quality", "response"][index],
          )?.weight,
        score = row?.score;
      return `<tr><td>${index + 1}</td><td>${escapeHtml(title)}</td>${[1, 2, 3, 4].map((level) => `<td class="evaluation-level-cell">${score === level ? "●" : "—"}</td>`).join("")}<td>คำนวณอัตโนมัติตามเกณฑ์ Admin</td><td>${score ?? "—"}</td><td>${state.user?.role === "admin" ? `<input type="number" class="evaluation-weight-input" data-workplace-weight="${["preparation", "quantity", "quality", "response"][index]}" value="${weight ?? ""}" min="0" max="100" step="any" ${row ? "" : "disabled"} aria-label="น้ำหนัก ${escapeHtml(title)}">` : (weight ?? "—")}</td><td>${row ? score * weight : "—"}</td></tr>`;
    })
    .join("");
  $("evaluationTotal").textContent = rows.length
    ? rows.reduce((n, r) => n + r.score * r.weight, 0)
    : "—";
  $("evaluationMax").textContent =
    rows.length === 4
      ? rows.reduce((n, row) => n + 4 * row.weight, 0)
      : groups.length === 4 && groups.every((g) => g.weight)
        ? groups.reduce((n, g) => n + 4 * g.weight, 0)
        : "—";
  $("evaluationRows")
    .querySelectorAll("[data-workplace-weight]")
    .forEach(
      (input, index) =>
        (input.oninput = () => {
          const value = Number(input.value);
          const valid =
            input.value !== "" &&
            Number.isFinite(value) &&
            value > 0 &&
            value <= 100;
          input.setCustomValidity(
            valid ? "" : "น้ำหนักต้องมากกว่า 0 และไม่เกิน 100",
          );
          if (!valid) {
            workplaceMessage("น้ำหนักต้องมากกว่า 0 และไม่เกิน 100");
            return;
          }
          workplaceWeightOverrides = {
            ...(workplaceWeightOverrides || {}),
            [input.dataset.workplaceWeight]: value,
          };
          workplaceSheetRows[index].weight = value;
          input.closest("tr").children[9].textContent = String(
            workplaceSheetRows[index].score * value,
          );
          const total = workplaceSheetRows.reduce(
              (sum, row) => sum + row.score * row.weight,
              0,
            ),
            max = workplaceSheetRows.reduce(
              (sum, row) => sum + 4 * row.weight,
              0,
            );
          $("evaluationTotal").textContent = String(total);
          $("evaluationMax").textContent = String(max);
          $("workplaceScore").textContent =
            `ปรับน้ำหนักแล้ว (ยังไม่บันทึก): ${total}/${max} (${((total / max) * 100).toFixed(2)}%)`;
        }),
    );
  workplaceUpdateMeta();
}
function workplaceClearEvidence() {
  workplaceWeightOverrides = null;
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
          return `<fieldset><legend>${group.key === "preparation" ? 1 : 4}. ${escapeHtml(group.title)}</legend>${workplaceField("น้ำหนัก", "wp-weight-" + group.key, "number", saved?.weight ?? "")}${group.metrics.map((key) => `<div class="workplace-rule"><p>${escapeHtml(data.metrics[key][0])} — ${data.metrics[key][1] === "higher" ? "ค่าต้อง ≥ เกณฑ์ (ยิ่งสูงยิ่งดี)" : "ค่าต้อง ≤ เกณฑ์ (ยิ่งต่ำยิ่งดี)"}</p><div class="workplace-fields">${[2, 3, 4].map((level, i) => workplaceField("ระดับ " + level, "wp-threshold-" + key + "-" + i, "number", saved?.metrics[key]?.[i] ?? "")).join("")}</div></div>`).join("")}</fieldset>`;
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
        : "ยังไม่มีเกณฑ์ กรุณาตั้งค่าข้อ 1 และข้อ 4 และสร้างข้อสอบทั้งสองชุด",
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
      if (
        workplaceHub.employeeCode &&
        [...$("workplaceEmployee").options].some(
          (option) => option.value === workplaceHub.employeeCode,
        )
      )
        $("workplaceEmployee").value = workplaceHub.employeeCode;
      workplaceRenderSheet();
      await loadEvaluations();
      loadWorkplaceManualEvidence();
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
      text: row.querySelector('[data-wp-field="text"]').value,
      score: Number(row.querySelector('[data-wp-field="score"]').value),
      imageUrl: row.querySelector('[data-wp-field="image"]').value.trim(),
      choices: [...row.querySelectorAll('[data-wp-field="choice"]')].map(
        (input) => input.value,
      ),
      answer: Number(row.querySelector('[data-wp-field="answer"]').value),
    }));
  }
}
function workplaceRenderQuestionEditors() {
  $("workplaceQuestionEditors").innerHTML = Object.entries(workplaceKinds)
    .map(
      ([kind, title]) =>
        `<fieldset><legend>${title}</legend><div class="admin-question-head"><p>${workplaceQuestions[kind].length} ข้อ · คะแนนเต็ม ${workplaceQuestions[kind].reduce((sum, q) => sum + (Number(q.score) || 1), 0)}</p><button type="button" data-add="${kind}" class="primary-btn">เพิ่มคำถาม</button></div><div id="wp-editor-${kind}">${workplaceQuestions[
          kind
        ]
          .map(
            (
              q,
              index,
            ) => `<article data-question class="admin-question-card" tabindex="-1"><div class="admin-question-head"><div><span class="card-label">ข้อที่ ${index + 1}</span><strong>Question ${index + 1}</strong></div><div class="admin-question-actions"><button type="button" data-copy="${kind}:${index}" class="secondary-btn">คัดลอกข้อนี้</button><button type="button" data-remove="${kind}:${index}" class="secondary-btn">ลบข้อนี้</button></div></div>
 <div class="evaluation-grid admin-question-grid"><label class="field admin-question-main"><span>คำถาม</span><textarea data-wp-field="text" required rows="3" placeholder="พิมพ์ข้อความคำถามที่ต้องการแสดง">${escapeHtml(q.text)}</textarea></label><label class="field"><span>คะแนนข้อนี้</span><input data-wp-field="score" type="number" min="1" max="1000" step="any" required value="${q.score ?? 1}"></label><label class="field"><span>คำตอบที่ถูก</span><select data-wp-field="answer">${["A", "B", "C", "D"].map((letter, i) => `<option value="${i}" ${q.answer === i ? "selected" : ""}>${letter}</option>`).join("")}</select></label></div>
 <div class="admin-question-media"><div class="admin-question-media-row"><label class="field"><span>รูปประกอบคำถาม (URL)</span><input data-wp-field="image" type="text" value="${escapeHtml(q.imageUrl || "")}" placeholder="https://example.com/question-image.jpg"></label><div class="admin-image-actions"><input type="file" class="hidden" data-wp-file accept="image/png,image/jpeg,image/gif,image/webp"><button type="button" data-pick-image class="secondary-btn">เลือกรูปจากเครื่อง</button><button type="button" data-clear-image class="secondary-btn">ลบรูป</button></div></div><div data-wp-preview>${q.imageUrl ? `<img class="admin-question-preview" src="${escapeHtml(q.imageUrl)}" alt="รูปประกอบข้อ ${index + 1}">` : ""}</div></div>
 <div class="admin-choice-grid">${["A", "B", "C", "D"].map((letter, i) => `<label class="field"><span>ตัวเลือก ${letter}</span><input data-wp-field="choice" type="text" required value="${escapeHtml(q.choices[i])}" placeholder="พิมพ์ตัวเลือก ${letter}"></label>`).join("")}</div></article>`,
          )
          .join("")}</div></fieldset>`,
    )
    .join("");
  const root = $("workplaceQuestionEditors");
  root.querySelectorAll("[data-add]").forEach(
    (button) =>
      (button.onclick = () => {
        workplaceReadQuestions();
        const kind = button.dataset.add;
        if (workplaceQuestions[kind].length >= 100) {
          workplaceMessage("เพิ่มได้ไม่เกิน 100 ข้อต่อชุด");
          return;
        }
        workplaceQuestions[kind].push({
          text: "",
          choices: ["", "", "", ""],
          answer: 0,
          score: 1,
          imageUrl: "",
        });
        workplaceRenderQuestionEditors();
        $("wp-editor-" + kind)
          .lastElementChild.querySelector("textarea")
          .focus();
      }),
  );
  root.querySelectorAll("[data-copy],[data-remove]").forEach(
    (button) =>
      (button.onclick = () => {
        workplaceReadQuestions();
        const [kind, indexText] = (
          button.dataset.copy || button.dataset.remove
        ).split(":");
        const index = Number(indexText);
        if (button.dataset.copy) {
          if (workplaceQuestions[kind].length >= 100) {
            workplaceMessage("เพิ่มได้ไม่เกิน 100 ข้อต่อชุด");
            return;
          }
          workplaceQuestions[kind].splice(
            index + 1,
            0,
            structuredClone(workplaceQuestions[kind][index]),
          );
        } else workplaceQuestions[kind].splice(index, 1);
        workplaceRenderQuestionEditors();
      }),
  );
  root.querySelectorAll("[data-question]").forEach((row) => {
    const image = row.querySelector('[data-wp-field="image"]');
    const updatePreview = () => {
      const value = image.value.trim(),
        preview = row.querySelector("[data-wp-preview]");
      preview.innerHTML = "";
      if (
        value &&
        (/^https?:\/\//i.test(value) ||
          /^data:image\/(png|jpeg|gif|webp);base64,/i.test(value))
      ) {
        const img = document.createElement("img");
        img.className = "admin-question-preview";
        img.alt = "รูปประกอบคำถาม";
        img.src = value;
        preview.append(img);
      }
    };
    image.onchange = updatePreview;
    row.querySelector("[data-pick-image]").onclick = () =>
      row.querySelector("[data-wp-file]").click();
    row.querySelector("[data-clear-image]").onclick = () => {
      image.value = "";
      updatePreview();
    };
    row.querySelector("[data-wp-file]").onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      if (
        !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
          file.type,
        ) ||
        file.size > 5 * 1024 * 1024
      ) {
        workplaceMessage("เลือกรูป PNG, JPEG, GIF หรือ WebP ขนาดไม่เกิน 5 MB");
        return;
      }
      const ticket = workplaceRequest;
      try {
        const value = await readFileAsDataUrl(file);
        if (ticket !== workplaceRequest || !row.isConnected) return;
        image.value = value;
        updatePreview();
      } catch (error) {
        workplaceMessage(error.message);
      }
    };
  });
}
async function workplaceSaveConfig(event) {
  event.preventDefault();
  const form = $("workplaceConfigForm");
  const button = event.submitter || form.querySelector('button[type="submit"]');
  if (button.disabled) return;
  form
    .querySelectorAll("[aria-invalid]")
    .forEach((field) => field.removeAttribute("aria-invalid"));
  const invalid = [...form.elements].find(
    (field) => field.willValidate && !field.checkValidity(),
  );
  if (invalid) {
    const section =
      invalid.closest("fieldset")?.querySelector("legend")?.textContent || "";
    const question =
      invalid.closest("[data-question]")?.querySelector(".card-label")
        ?.textContent || "";
    const label =
      invalid.closest("label")?.querySelector("span")?.textContent ||
      "ช่องข้อมูล";
    workplaceMessage(
      `บันทึกไม่ได้: ${[section, question, label].filter(Boolean).join(" / ")} — ${invalid.validationMessage}`,
    );
    invalid.setAttribute("aria-invalid", "true");
    invalid.focus();
    invalid.reportValidity();
    return;
  }
  const ticket = workplaceRequest,
    token = state.authToken;
  try {
    if (!workplaceConfig?.schema)
      throw new Error("ยังโหลดข้อมูลไม่สำเร็จ กรุณากดโหลดข้อมูลใหม่");
    workplaceReadQuestions();
    const raw = {
      groups: workplaceConfig.schema.map((group) => ({
        key: group.key,
        weight: Number($("wp-weight-" + group.key).value),
        metrics: Object.fromEntries(
          group.metrics.map((key) => [
            key,
            [0, 1, 2].map((index) =>
              Number($("wp-threshold-" + key + "-" + index).value),
            ),
          ]),
        ),
      })),
      quizzes: workplaceQuestions,
    };
    const config = WorkplaceScoring.validateConfig(raw);
    const body = JSON.stringify({ revision: workplaceRevision, config });
    if (new TextEncoder().encode(body).length > 29 * 1024 * 1024)
      throw new Error("รูปประกอบรวมมีขนาดใหญ่เกินไป กรุณาลดขนาดรูปก่อนบันทึก");
    button.disabled = true;
    button.textContent = "กำลังบันทึก…";
    workplaceMessage("กำลังบันทึกเกณฑ์และข้อสอบ…");
    const saved = await api("/api/workplace/config", { method: "PUT", body });
    if (ticket !== workplaceRequest || token !== state.authToken) return;
    workplaceRevision = saved.config.revision;
    workplaceConfig = { ...saved.config, schema: workplaceConfig.schema };
    workplaceQuestions = structuredClone(saved.config.quizzes);
    workplaceHub.settingsDirty = false;
    workplaceRenderQuestionEditors();
    workplaceMessage(
      "บันทึกเกณฑ์และข้อสอบเรียบร้อยแล้ว เวอร์ชัน " + workplaceRevision,
    );
  } catch (error) {
    if (ticket === workplaceRequest && token === state.authToken) {
      workplaceMessage("บันทึกไม่ได้: " + error.message);
      $("workplaceSaveStatus")?.scrollIntoView({ block: "center" });
    }
  } finally {
    button.disabled = false;
    button.textContent = "บันทึกเกณฑ์และข้อสอบ";
  }
}
async function workplaceTakeQuiz(kind) {
  const token = state.authToken,
    ticket = workplaceRequest;
  const target = $("workplaceQuiz-" + kind);
  const startButton = document.querySelector(`[data-workplace-quiz="${kind}"]`);
  startButton.disabled = true;
  target.textContent = "กำลังโหลดข้อสอบ…";
  try {
    const data = await api("/api/workplace/quizzes");
    if (ticket !== workplaceRequest || token !== state.authToken) return;
    const session = {
      kind,
      questions: data.quizzes[kind],
      revision: data.revision,
      period: workplaceHubPeriod(),
      answers: data.quizzes[kind].map(() => null),
      index: 0,
      submitting: false,
      result: null,
      message: "",
    };
    workplaceRenderQuiz(target, session, token, ticket);
    startButton.textContent = "กำลังทำข้อสอบ";
  } catch (error) {
    if (ticket === workplaceRequest && token === state.authToken)
      target.textContent = error.message;
  } finally {
    if (ticket === workplaceRequest)
      startButton.disabled = !!target.querySelector("form");
  }
}
function workplaceRenderQuiz(target, quiz, token, ticket) {
  if (ticket !== workplaceRequest || token !== state.authToken) return;
  const total = quiz.questions.length,
    answered = quiz.answers.filter((a) => a !== null).length;
  const question = quiz.questions[quiz.index],
    selected = quiz.answers[quiz.index];
  const locked = quiz.submitting || !!quiz.result;
  target.innerHTML = `<form class="workplace-quiz-runner">
    <div class="exam-kpi-grid"><article class="exam-kpi-card"><p class="card-label">Answer Progress</p><h3>${answered} / ${total}</h3><p>จำนวนข้อที่ตอบแล้ว</p></article><article class="exam-kpi-card exam-progress-card"><h3>${Math.round((answered / total) * 100)}%</h3><div class="progress-track"><div class="progress-bar" style="width:${(answered / total) * 100}%"></div></div></article><article class="exam-kpi-card"><p class="card-label">Exam Status</p><h3>${quiz.result ? "ส่งข้อสอบแล้ว" : quiz.submitting ? "กำลังส่งข้อสอบ…" : "กำลังทำข้อสอบ"}</h3></article></div>
    <div class="workplace-quiz-layout"><article class="panel exam-question-panel"><div class="panel-head"><h3 tabindex="-1" data-quiz-heading>ข้อ ${quiz.index + 1} / ${total}</h3><span class="question-badge">${selected === null ? "ยังไม่ได้เลือกคำตอบ" : `เลือกข้อ ${["A", "B", "C", "D"][selected]} แล้ว`}</span></div><div class="question-card"><p class="question-text">${escapeHtml(question.text)}</p>${question.imageUrl ? `<img class="question-image" src="${escapeHtml(question.imageUrl)}" alt="รูปประกอบข้อ ${quiz.index + 1}">` : ""}<p>คะแนนข้อนี้: ${question.score ?? 1}</p><div class="choices-container">${question.choices.map((choice, index) => `<label class="choice-item ${selected === index ? "selected" : ""}"><input type="radio" name="wp-answer-${quiz.kind}" value="${index}" ${selected === index ? "checked" : ""} ${locked ? "disabled" : ""}><span>${["A", "B", "C", "D"][index]}. ${escapeHtml(choice)}</span></label>`).join("")}</div></div><div class="question-actions"><button type="button" class="secondary-btn" data-quiz-prev ${quiz.index === 0 || quiz.submitting ? "disabled" : ""}>ก่อนหน้า</button><button type="button" class="primary-btn" data-quiz-next ${quiz.index === total - 1 || quiz.submitting ? "disabled" : ""}>ถัดไป</button></div></article>
    <aside class="panel exam-side-rail"><h3>เลือกข้อสอบ</h3><div class="question-nav">${quiz.questions.map((q, index) => `<button type="button" class="nav-chip ${quiz.index === index ? "current" : ""} ${quiz.answers[index] !== null ? "answered" : ""}" data-quiz-index="${index}" aria-label="ข้อ ${index + 1}${quiz.answers[index] !== null ? " ตอบแล้ว" : " ยังไม่ตอบ"}" ${quiz.index === index ? 'aria-current="step"' : ""} ${quiz.submitting ? "disabled" : ""}>${index + 1}</button>`).join("")}</div><p data-quiz-message role="status" aria-live="polite">${escapeHtml(quiz.message)}</p><button type="submit" class="primary-btn danger wide" ${locked ? "disabled" : ""}>${quiz.submitting ? "กำลังส่ง…" : "ส่งข้อสอบ"}</button></aside></div>
    ${quiz.result ? `<section class="panel result-panel"><h3>สรุปผลการสอบ</h3><p role="status">บันทึกผลแล้ว</p><p>รหัสพนักงาน ${escapeHtml(state.user.employeeCode)} · งวด ${escapeHtml(quiz.period)}</p><div class="result-grid"><div class="result-box"><span>คะแนน</span><strong>${quiz.result.score ?? quiz.result.correct} / ${quiz.result.totalScore ?? quiz.result.total}</strong></div><div class="result-box"><span>เปอร์เซ็นต์</span><strong>${quiz.result.percent.toFixed(2)}%</strong></div><div class="result-box"><span>ตอบถูก</span><strong>${quiz.result.correct} ข้อ</strong></div><div class="result-box"><span>ตอบผิด</span><strong>${quiz.result.total - quiz.result.correct} ข้อ</strong></div></div><p>ผลนี้ใช้สำหรับประเมินหน้างาน แยกจากคะแนนข้อสอบ Part</p><button type="button" class="secondary-btn" data-quiz-restart>เริ่มทำใหม่</button></section>` : ""}
  </form>`;
  const draw = () => workplaceRenderQuiz(target, quiz, token, ticket);
  function move(index) {
    quiz.index = index;
    draw();
    target.querySelector("[data-quiz-heading]").focus();
  }
  target.querySelectorAll("input[type=radio]").forEach(
    (input) =>
      (input.onchange = () => {
        if (locked) return;
        quiz.answers[quiz.index] = Number(input.value);
        quiz.message = "";
        draw();
      }),
  );
  target.querySelector("[data-quiz-prev]").onclick = () =>
    move(Math.max(0, quiz.index - 1));
  target.querySelector("[data-quiz-next]").onclick = () =>
    move(Math.min(total - 1, quiz.index + 1));
  target
    .querySelectorAll("[data-quiz-index]")
    .forEach(
      (button) =>
        (button.onclick = () => move(Number(button.dataset.quizIndex))),
    );
  if (quiz.result)
    target.querySelector("[data-quiz-restart]").onclick = () =>
      workplaceTakeQuiz(quiz.kind);
  target.querySelector("form").onsubmit = async (event) => {
    event.preventDefault();
    if (quiz.submitting || quiz.result) return;
    if (answered < total) {
      quiz.message = `ยังไม่ได้ตอบ ${total - answered} ข้อ กรุณาตอบให้ครบก่อนส่ง`;
      move(quiz.answers.indexOf(null));
      return;
    }
    quiz.submitting = true;
    quiz.message = "";
    draw();
    try {
      const result = await api("/api/workplace/attempts", {
        method: "POST",
        body: JSON.stringify({
          kind: quiz.kind,
          period: quiz.period,
          revision: quiz.revision,
          answers: quiz.answers,
        }),
      });
      if (ticket !== workplaceRequest || token !== state.authToken) return;
      quiz.result = result;
      const startButton = document.querySelector(
        `[data-workplace-quiz="${quiz.kind}"]`,
      );
      if (startButton) {
        startButton.disabled = false;
        startButton.textContent = "ทำข้อสอบอีกครั้ง";
      }
    } catch (error) {
      quiz.message = error.message;
    } finally {
      quiz.submitting = false;
      draw();
    }
  };
}
async function workplaceEvaluate(save) {
  const form = $("workplaceEvaluationForm");
  const invalidWeight = $("evaluationRows").querySelector("input:invalid");
  if (invalidWeight) {
    invalidWeight.focus();
    invalidWeight.reportValidity();
    return;
  }
  if (!form.reportValidity()) return;
  const body = {
    revision: workplaceRevision,
    employeeCode: $("workplaceEmployee").value,
    period: $("wp-period").value,
    evaluator: $("wp-evaluator").value,
    ...(workplaceWeightOverrides === null
      ? {}
      : { weights: workplaceWeightOverrides }),
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
    workplaceWeightOverrides = result.weightOverrides || {};
    workplaceRenderSheet(result.rows);
    $("workplaceScore").innerHTML =
      `<h4>${save ? "บันทึกแล้ว" : "ผลคำนวณ"}: ${result.totalScore}/${result.maxScore} (${result.percent}%)</h4><p>คิดเป็น ${(result.percent * 0.6).toFixed(2)} จาก 60 คะแนนของ Skill Matrix</p>${result.rows ? "<ul>" + result.rows.map((r) => `<li>${escapeHtml(r.title)}: ระดับ ${r.score} × น้ำหนัก ${r.weight} = ${r.score * r.weight}</li>`).join("") + "</ul>" : ""}`;
    if (!save)
      workplaceMessage(
        "คำนวณคะแนนตามข้อมูลและน้ำหนักปัจจุบันแล้ว (ยังไม่บันทึก)",
      );
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

let manualEvidenceRequest = 0;
async function loadWorkplaceManualEvidence() {
  const target = $("workplaceManualScores");
  if (!target) return;
  const period = $("wp-period").value,
    employeeCode = $("workplaceEmployee").value,
    ticket = ++manualEvidenceRequest,
    token = state.authToken;
  if (!period) {
    target.textContent =
      "เลือกงวดประเมินเพื่อแสดงคะแนนดิบข้อ 2–3 ที่ Admin บันทึกไว้";
    return;
  }
  target.textContent = "กำลังโหลดคะแนนดิบข้อ 2–3…";
  try {
    const data = await api(
      "/api/workplace/manual-scores?period=" + encodeURIComponent(period),
    );
    if (
      ticket !== manualEvidenceRequest ||
      token !== state.authToken ||
      !target.isConnected
    )
      return;
    const entry = data.entries.find((e) => e.employeeCode === employeeCode);
    target.textContent = entry
      ? `คะแนนดิบงวด ${period}: ปริมาณงาน ${entry.quantity} · คุณภาพงาน ${entry.quality}`
      : "ยังไม่มีคะแนนดิบข้อ 2–3 สำหรับพนักงานในงวดนี้ ให้ Admin บันทึกที่หน้า “กรอกคะแนนข้อ 2–3”";
    if (workplaceRevision) {
      try {
        const result = await api("/api/workplace/preview", {
          method: "POST",
          body: JSON.stringify({
            employeeCode,
            period,
            revision: workplaceRevision,
          }),
        });
        if (ticket === manualEvidenceRequest && token === state.authToken) {
          workplaceMessage(
            "ข้อมูลครบสำหรับ " + employeeCode + " งวด " + period,
          );
          workplaceWeightOverrides = result.weightOverrides || {};
          workplaceRenderSheet(result.rows);
          $("workplaceScore").textContent =
            `พร้อมบันทึก: ${result.totalScore}/${result.maxScore} (${result.percent}%)`;
        }
      } catch (error) {
        if (ticket === manualEvidenceRequest && token === state.authToken)
          workplaceMessage(error.message);
      }
    }
  } catch (error) {
    if (
      ticket === manualEvidenceRequest &&
      token === state.authToken &&
      target.isConnected
    )
      target.textContent = "โหลดคะแนนดิบไม่ได้: " + error.message;
  }
}
