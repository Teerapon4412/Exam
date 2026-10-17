"use strict";
let progressParts = [];
let progressRequest = 0;
let progressToken = "";
const progressLabels = { passed: 'เคยสอบผ่าน', failed: 'สอบแล้ว ยังไม่ผ่าน', not_taken: 'ยังไม่เคยสอบ' };
async function loadExamProgress() {
  if (progressToken !== state.authToken) {
    progressToken = state.authToken;
    progressParts = [];
    $('progressEmployee').innerHTML = '';
    $('progressModel').innerHTML = '<option value="">ทุก Model</option>';
    $('progressStatus').value = '';
  }
  progressParts = [];
  const request = ++progressRequest;
  const selected = $('progressEmployee').value;
  const token = state.authToken;
  $('progressBody').innerHTML = '';
  $('progressSummary').textContent = '';
  $('progressModelCards').innerHTML = '';
  $('progressMessage').textContent = 'กำลังโหลดข้อมูล…';
  try {
    const data = await api('/api/exam-progress' + (selected ? '?employeeCode=' + encodeURIComponent(selected) : ''));
    if (request !== progressRequest || token !== state.authToken) return;
    const canViewAll = ['admin', 'leader'].includes(state.user?.role);
    $('progressEmployeeField').classList.toggle('hidden', !canViewAll);
    $('progressEmployee').innerHTML = data.employees.map((person) => `<option value="${escapeHtml(person.employeeCode)}">${escapeHtml(person.fullName)} (${escapeHtml(person.employeeCode)})</option>`).join('');
    $('progressEmployee').value = data.employeeCode;
    progressParts = data.parts;
    const model = $('progressModel').value;
    const models = [...new Map(progressParts.map((part) => [part.modelCode, part.modelName])).entries()];
    $('progressModel').innerHTML = '<option value="">ทุก Model</option>' + models.map(([code, name]) => `<option value="${escapeHtml(code)}">${escapeHtml(code)} - ${escapeHtml(name)}</option>`).join('');
    $('progressModel').value = models.some(([code]) => code === model) ? model : '';
    $('progressMessage').textContent = '';
    renderExamProgress();
  } catch (error) {
    if (request !== progressRequest || token !== state.authToken) return;
    $('progressMessage').textContent = 'โหลดสถานะไม่สำเร็จ: ' + error.message + ' — กดอัปเดตข้อมูลเพื่อลองใหม่';
  }
}
function renderModelProgressCards() {
  const models = new Map();
  progressParts.forEach((part) => {
    if (!models.has(part.modelCode)) models.set(part.modelCode, { name: part.modelName, total: 0, taken: 0, passed: 0 });
    const model = models.get(part.modelCode);
    model.total++;
    if (part.attempts > 0) model.taken++;
    if (part.status === 'passed') model.passed++;
  });
  const selectedModel = $('progressModel').value;
  $('progressModelCards').innerHTML = [...models].filter(([code]) => !selectedModel || code === selectedModel).map(([code, model]) => {
    const percent = Math.round(model.taken / model.total * 100);
    const label = model.taken === model.total ? 'สอบครบแล้ว' : model.taken ? 'กำลังดำเนินการ' : 'ยังไม่เริ่มสอบ';
    return `<article class="progress-model-card ${model.taken === model.total ? 'is-complete' : ''}">
      <div class="progress-model-heading"><h4>${escapeHtml(code)}</h4><span>${label}</span></div>
      <p>${escapeHtml(model.name)}</p>
      <strong class="progress-model-percent">${percent}%</strong>
      <p>สอบแล้ว ${model.taken} จาก ${model.total} Part</p>
      <progress max="${model.total}" value="${model.taken}" aria-label="${escapeHtml(code)} สอบแล้ว ${model.taken} จาก ${model.total} Part"></progress>
      <p class="progress-model-detail">เคยผ่าน ${model.passed} · ยังไม่ผ่าน ${model.taken - model.passed} · ยังไม่สอบ ${model.total - model.taken}</p>
    </article>`;
  }).join('') || '<p>ยังไม่มี Model ในคลังข้อสอบ</p>';
}
function renderExamProgress() {
  renderModelProgressCards();
  const rows = progressParts.filter((part) => !$('progressModel').value || part.modelCode === $('progressModel').value);
  const visible = rows.filter((part) => !$('progressStatus').value || part.status === $('progressStatus').value);
  const count = (status) => rows.filter((part) => part.status === status).length;
  $('progressSummary').textContent = `ทั้งหมด ${rows.length} Part · สอบแล้ว ${rows.length - count('not_taken')} · เคยผ่าน ${count('passed')} · ยังไม่ผ่าน ${count('failed')} · ยังไม่เคยสอบ ${count('not_taken')}`;
  $('progressBody').innerHTML = visible.length ? visible.map((part) => {
    const last = part.latest;
    const date = last && Number.isFinite(Date.parse(last.submittedAt)) ? new Date(last.submittedAt).toLocaleString('th-TH') : '—';
    return `<tr><td>${escapeHtml(part.modelCode)} - ${escapeHtml(part.modelName)}</td><td>${escapeHtml(part.partCode)} - ${escapeHtml(part.title)}</td><td>${progressLabels[part.status]}</td><td>${part.attempts}</td><td>${last ? escapeHtml(last.score + '/' + last.totalScore) : '—'}</td><td>${last ? last.passed ? 'ผ่าน' : 'ไม่ผ่าน' : '—'}</td><td>${escapeHtml(date)}</td></tr>`;
  }).join('') : '<tr><td colspan="7">ไม่พบ Part ตามตัวกรองที่เลือก</td></tr>';
}
$('progressEmployee').addEventListener('change', loadExamProgress);
$('progressModel').addEventListener('change', renderExamProgress);
$('progressStatus').addEventListener('change', renderExamProgress);
$('progressRefresh').addEventListener('click', loadExamProgress);
