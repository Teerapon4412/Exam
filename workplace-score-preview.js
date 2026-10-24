"use strict";
let scoreEntryPreview = {
  token: "",
  people: [],
  drafts: {},
  month: "",
  assessor: "",
  keyword: "",
  department: "",
  missingOnly: false,
  loading: false,
  error: "",
};
function scoreEntryMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  return (
    parts.find((p) => p.type === "year").value +
    "-" +
    parts.find((p) => p.type === "month").value
  );
}
async function openWorkplaceScorePreview() {
  const root = $("workplaceScorePreviewView");
  if (state.user?.role !== "admin") {
    root.innerHTML = "";
    return;
  }
  if (scoreEntryPreview.token !== state.authToken)
    scoreEntryPreview = {
      token: state.authToken,
      people: [],
      drafts: {},
      month: scoreEntryMonth(),
      assessor: state.user.fullName || "",
      keyword: "",
      department: "",
      missingOnly: false,
      loading: false,
      error: "",
    };
  root.innerHTML = `<section class="panel score-entry-heading"><div><p class="card-label">WORKPLACE ASSESSMENT</p><h3>กรอกคะแนนปริมาณงานและคุณภาพงาน</h3><p>เลือกงวดประเมิน แล้วกรอกคะแนนข้อ 2 และข้อ 3 ของพนักงานแต่ละคน</p></div><span class="score-entry-preview-badge">Admin เท่านั้นที่ลงคะแนนได้</span></section>
  <section class="panel"><div class="score-entry-period"><label class="field"><span>งวดประเมิน</span><input id="scoreEntryMonth" type="month" value="${escapeHtml(scoreEntryPreview.month)}"></label><label class="field"><span>ผู้บันทึกคะแนน</span><input id="scoreEntryAssessor" type="text" value="${escapeHtml(scoreEntryPreview.assessor)}" placeholder="ชื่อผู้บันทึก"></label></div><div id="scoreEntryStats" class="score-entry-stats"></div></section>
  <section class="panel score-entry-panel"><div class="score-entry-toolbar"><label class="field"><span>ค้นหาพนักงาน</span><input id="scoreEntrySearch" type="search" placeholder="ค้นหาชื่อ หรือรหัสพนักงาน" value="${escapeHtml(scoreEntryPreview.keyword)}"></label><label class="field"><span>แผนก</span><select id="scoreEntryDepartment"><option value="">ทุกแผนก</option></select></label><label class="score-entry-checkbox"><input id="scoreEntryMissing" type="checkbox" ${scoreEntryPreview.missingOnly ? "checked" : ""}> เฉพาะที่ยังกรอกไม่ครบ</label></div>
  <p id="scoreEntryMessage" role="status" aria-live="polite"></p><div class="score-entry-table-wrap"><table class="score-entry-table"><thead><tr><th scope="col">พนักงาน</th><th scope="col">แผนก</th><th scope="col">2. ปริมาณงาน<span>กรอกยอดคะแนน</span></th><th scope="col">3. คุณภาพงาน<span>กรอกยอดคะแนน</span></th><th scope="col">สถานะ</th></tr></thead><tbody id="scoreEntryBody"></tbody></table></div>
  <div class="score-entry-footer"><div><strong id="scoreEntryCount"></strong><p>ช่องว่างหมายถึงยังไม่กรอก · กรอก 0 หากได้ศูนย์คะแนน</p></div><div><button id="scoreEntryReload" type="button" class="secondary-btn">โหลดคะแนนล่าสุด</button> <button id="scoreEntryReview" type="button" class="primary-btn">ตรวจทานคะแนน</button></div></div><p class="score-entry-footnote">เก็บเป็นคะแนนดิบ ยังไม่แปลงเป็นระดับ 1–4 · คะแนนที่ยังไม่ยืนยันจะหายเมื่อรีเฟรชหน้า</p></section>
  <dialog id="scoreEntryReviewDialog" class="score-entry-dialog"><h3>ตรวจทานคะแนนที่กรอก</h3><p id="scoreEntryReviewMeta"></p><div id="scoreEntryReviewBody"></div><p>ตรวจสอบงวดและคะแนนก่อนยืนยันบันทึก ข้อมูลจะบันทึกตามพนักงานและงวดที่เลือก</p><button type="button" class="primary-btn" id="scoreEntryReviewClose">กลับไปแก้ไข</button><button type="button" class="primary-btn" id="scoreEntrySave">ยืนยันบันทึกคะแนน</button><p id="scoreEntrySaveMessage" role="status"></p></dialog>`;
  $("scoreEntryMonth").onchange = (e) => {
    if (!e.target.value) {
      e.target.value = scoreEntryPreview.month;
      return;
    }
    scoreEntryPreview.month = e.target.value;
    loadWorkplaceManualScores();
  };
  $("scoreEntryAssessor").oninput = (e) =>
    (scoreEntryPreview.assessor = e.target.value);
  $("scoreEntrySearch").oninput = (e) => {
    scoreEntryPreview.keyword = e.target.value;
    renderScoreEntryRows();
  };
  $("scoreEntryDepartment").onchange = (e) => {
    scoreEntryPreview.department = e.target.value;
    renderScoreEntryRows();
  };
  $("scoreEntryMissing").onchange = (e) => {
    scoreEntryPreview.missingOnly = e.target.checked;
    renderScoreEntryRows();
  };
  $("scoreEntryReview").onclick = reviewScoreEntryPreview;
  $("scoreEntryReload").onclick = () => {
    const dirty = Object.values(
      scoreEntryPreview.drafts[scoreEntryPreview.month] || {},
    ).some((d) => d.dirty);
    if (
      dirty &&
      !window.confirm(
        "โหลดคะแนนล่าสุดจะแทนข้อมูลที่ยังไม่บันทึก ต้องการดำเนินการต่อหรือไม่?",
      )
    )
      return;
    delete scoreEntryPreview.drafts[scoreEntryPreview.month];
    loadWorkplaceManualScores();
  };
  $("scoreEntrySave").onclick = saveWorkplaceManualScores;
  $("scoreEntryReviewClose").onclick = () =>
    $("scoreEntryReviewDialog").close();
  if (!scoreEntryPreview.people.length) {
    const token = state.authToken;
    scoreEntryPreview.loading = true;
    renderScoreEntryRows();
    try {
      const data = await api("/api/admin/employees");
      if (token !== state.authToken || token !== scoreEntryPreview.token)
        return;
      scoreEntryPreview.people = data.employees
        .filter((p) => p.isActive !== false)
        .sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
      scoreEntryPreview.error = "";
    } catch (error) {
      if (token !== state.authToken) return;
      scoreEntryPreview.error = error.message;
    } finally {
      if (token === state.authToken) scoreEntryPreview.loading = false;
    }
  }
  if (!$("scoreEntryBody")) return;
  $("scoreEntryDepartment").innerHTML =
    '<option value="">ทุกแผนก</option>' +
    [
      ...new Set(
        scoreEntryPreview.people.map((p) => p.department).filter(Boolean),
      ),
    ]
      .sort()
      .map(
        (name) =>
          `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`,
      )
      .join("");
  $("scoreEntryDepartment").value = scoreEntryPreview.department;
  await loadWorkplaceManualScores();
}
function scoreEntryDraft(code) {
  const month = (scoreEntryPreview.drafts[scoreEntryPreview.month] ??= {});
  return (month[code] ??= {
    quantity: "",
    quality: "",
    revision: 0,
    scale: "raw",
    dirty: false,
  });
}
function scoreEntryState(draft) {
  const present = [draft.quantity, draft.quality].filter(
    (v) => v !== "",
  ).length;
  return present === 2 ? "complete" : present === 1 ? "partial" : "empty";
}
function scoreEntryLabel(draft) {
  const status = scoreEntryState(draft);
  return status === "complete"
    ? draft.revision > 0 && !draft.dirty
      ? "บันทึกแล้ว"
      : "กรอกครบแล้ว"
    : status === "partial"
      ? "กรอกไม่ครบ"
      : "ยังไม่กรอก";
}
function scoreEntryStats() {
  const people = scoreEntryPreview.people,
    complete = people.filter(
      (p) => scoreEntryState(scoreEntryDraft(p.employeeCode)) === "complete",
    ).length;
  $("scoreEntryStats").innerHTML =
    `<article><span>พนักงานทั้งหมด</span><strong>${people.length}<small> คน</small></strong></article><article class="is-complete"><span>กรอกครบ 2 หัวข้อ</span><strong>${complete}<small> คน</small></strong></article><article><span>รอกรอกให้ครบ</span><strong>${people.length - complete}<small> คน</small></strong></article>`;
  $("scoreEntryReview").disabled =
    complete === 0 || scoreEntryPreview.loading || !!scoreEntryPreview.error;
}
function renderScoreEntryRows() {
  if (!$("scoreEntryBody")) return;
  const keyword = scoreEntryPreview.keyword.trim().toLowerCase();
  const people = scoreEntryPreview.people.filter(
    (p) =>
      (!keyword ||
        `${p.employeeCode} ${p.fullName}`.toLowerCase().includes(keyword)) &&
      (!scoreEntryPreview.department ||
        p.department === scoreEntryPreview.department) &&
      (!scoreEntryPreview.missingOnly ||
        scoreEntryState(scoreEntryDraft(p.employeeCode)) !== "complete"),
  );
  $("scoreEntryMessage").textContent = scoreEntryPreview.loading
    ? "กำลังโหลดรายชื่อพนักงาน…"
    : scoreEntryPreview.error
      ? "โหลดรายชื่อไม่สำเร็จ: " + scoreEntryPreview.error
      : "";
  $("scoreEntryBody").innerHTML = people.length
    ? people
        .map((person) => {
          const draft = scoreEntryDraft(person.employeeCode),
            status = scoreEntryState(draft);
          return `<tr data-score-employee="${escapeHtml(person.employeeCode)}"><th scope="row"><strong>${escapeHtml(person.fullName)}</strong><span>${escapeHtml(person.employeeCode)}</span></th><td>${escapeHtml(person.department || "—")}</td>${["quantity", "quality"].map((key) => `<td><input class="score-entry-input" type="number" min="0" step="any" inputmode="decimal" placeholder="ยังไม่กรอก" data-score-key="${key}" value="${escapeHtml(draft[key])}" aria-label="คะแนน${key === "quantity" ? "ปริมาณงาน" : "คุณภาพงาน"} ${escapeHtml(person.fullName)} ${escapeHtml(person.employeeCode)}"></td>`).join("")}<td data-score-status><span class="score-entry-status ${status}">${scoreEntryLabel(draft)}</span></td></tr>`;
        })
        .join("")
    : `<tr><td colspan="5">${scoreEntryPreview.loading ? "กำลังโหลด…" : "ไม่พบพนักงานตามตัวกรอง"}</td></tr>`;
  $("scoreEntryCount").textContent =
    `แสดง ${people.length} จาก ${scoreEntryPreview.people.length} คน`;
  scoreEntryStats();
  $("scoreEntryBody")
    .querySelectorAll("input")
    .forEach(
      (input) =>
        (input.oninput = () => {
          const code = input.closest("tr").dataset.scoreEmployee;
          if (!input.validity.valid) {
            input.setAttribute("aria-invalid", "true");
            scoreEntryDraft(code).dirty = true;
            scoreEntryDraft(code)[input.dataset.scoreKey] = "";
            scoreEntryStats();
            input.setCustomValidity("");
            $("scoreEntryMessage").textContent =
              "กรุณากรอกคะแนนเป็นตัวเลขตั้งแต่ 0 ขึ้นไป";
            return;
          }
          input.removeAttribute("aria-invalid");
          $("scoreEntryMessage").textContent = "";
          scoreEntryDraft(code)[input.dataset.scoreKey] = input.value;
          scoreEntryDraft(code).dirty = true;
          const status = scoreEntryState(scoreEntryDraft(code));
          input.closest("tr").querySelector("[data-score-status]").innerHTML =
            `<span class="score-entry-status ${status}">${scoreEntryLabel(scoreEntryDraft(code))}</span>`;
          scoreEntryStats();
        }),
    );
}
function reviewScoreEntryPreview() {
  const invalid = $("scoreEntryBody").querySelector("[aria-invalid]");
  if (invalid) {
    invalid.focus();
    invalid.reportValidity();
    return;
  }
  const completed = scoreEntryPreview.people.filter(
    (p) => scoreEntryState(scoreEntryDraft(p.employeeCode)) === "complete",
  );
  $("scoreEntryReviewMeta").textContent =
    `งวด ${scoreEntryPreview.month} · ผู้บันทึก ${scoreEntryPreview.assessor || "ยังไม่ระบุ"} · กรอกครบ ${completed.length} คน`;
  $("scoreEntryReviewBody").innerHTML =
    '<div class="score-entry-table-wrap"><table class="score-entry-table"><thead><tr><th>พนักงาน</th><th>ปริมาณงาน</th><th>คุณภาพงาน</th></tr></thead><tbody>' +
    completed
      .map((p) => {
        const d = scoreEntryDraft(p.employeeCode);
        return `<tr><th>${escapeHtml(p.fullName)}<span>${escapeHtml(p.employeeCode)}</span></th><td>${escapeHtml(d.quantity)}</td><td>${escapeHtml(d.quality)}</td></tr>`;
      })
      .join("") +
    "</tbody></table></div>";
  $("scoreEntrySaveMessage").textContent = "";
  $("scoreEntryReviewDialog").showModal();
}

let manualScoresRequest = 0;
async function loadWorkplaceManualScores() {
  const period = scoreEntryPreview.month,
    token = state.authToken,
    ticket = ++manualScoresRequest;
  scoreEntryPreview.loading = true;
  renderScoreEntryRows();
  try {
    const data = await api(
      "/api/workplace/manual-scores?period=" + encodeURIComponent(period),
    );
    if (token !== state.authToken || ticket !== manualScoresRequest) return;
    for (const entry of data.entries) {
      const draft = scoreEntryDraft(entry.employeeCode);
      if (!draft.dirty)
        Object.assign(draft, {
          quantity: String(entry.quantity),
          quality: String(entry.quality),
          revision: entry.revision,
          scale: entry.scale,
          dirty: false,
        });
    }
    scoreEntryPreview.error = "";
  } catch (error) {
    if (token === state.authToken && ticket === manualScoresRequest)
      scoreEntryPreview.error = error.message;
  } finally {
    if (token === state.authToken && ticket === manualScoresRequest) {
      scoreEntryPreview.loading = false;
      renderScoreEntryRows();
    }
  }
}
async function saveWorkplaceManualScores() {
  if (state.user?.role !== "admin") return;
  const assessor = scoreEntryPreview.assessor.trim();
  if (!assessor) {
    $("scoreEntrySaveMessage").textContent = "กรุณากรอกชื่อผู้บันทึก";
    return;
  }
  const invalid = $("scoreEntryBody").querySelector("[aria-invalid]");
  if (invalid) {
    $("scoreEntrySaveMessage").textContent = "กรุณาแก้คะแนนที่ไม่ถูกต้องก่อน";
    return;
  }
  const period = scoreEntryPreview.month,
    token = state.authToken;
  if (scoreEntryPreview.loading || scoreEntryPreview.error) {
    $("scoreEntrySaveMessage").textContent =
      "กรุณาโหลดข้อมูลล่าสุดให้สำเร็จก่อนบันทึก";
    return;
  }
  const entries = scoreEntryPreview.people
    .filter((p) => {
      const draft = scoreEntryDraft(p.employeeCode);
      return draft.dirty && scoreEntryState(draft) === "complete";
    })
    .map((p) => {
      const draft = scoreEntryDraft(p.employeeCode);
      return {
        employeeCode: p.employeeCode,
        quantity: Number(draft.quantity),
        quality: Number(draft.quality),
        scale: draft.scale || "raw",
        revision: draft.revision || 0,
      };
    });
  if (!entries.length) {
    $("scoreEntrySaveMessage").textContent =
      "ไม่มีคะแนนใหม่หรือคะแนนที่แก้ไขให้บันทึก";
    return;
  }
  const button = $("scoreEntrySave");
  button.disabled = true;
  $("scoreEntrySaveMessage").textContent = "กำลังบันทึก…";
  try {
    const data = await api("/api/workplace/manual-scores", {
      method: "POST",
      body: JSON.stringify({ period, assessor, entries }),
    });
    if (token !== state.authToken) return;
    for (const entry of data.entries) {
      const draft = scoreEntryPreview.drafts[period][entry.employeeCode];
      Object.assign(draft, { revision: entry.revision, dirty: false });
    }
    $("scoreEntrySaveMessage").textContent =
      "บันทึกคะแนนสำเร็จ " + data.entries.length + " คน";
    renderScoreEntryRows();
  } catch (error) {
    if (token === state.authToken)
      $("scoreEntrySaveMessage").textContent =
        "บันทึกไม่สำเร็จ: " + error.message;
  } finally {
    button.disabled = false;
  }
}

function clearWorkplaceManualScoreCache() {
  manualScoresRequest++;
  scoreEntryPreview = {
    token: "",
    people: [],
    drafts: {},
    month: "",
    assessor: "",
    keyword: "",
    department: "",
    missingOnly: false,
    loading: false,
    error: "",
  };
  const root = $("workplaceScorePreviewView");
  if (root) root.innerHTML = "";
}
