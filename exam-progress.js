"use strict";
function summarizeProgress(exams, results, employeeId) {
  const own = results.filter((result) => String(result.user_id) === String(employeeId));
  return exams.map((exam) => {
    const attempts = own.filter((result) => String(result.exam_id) === String(exam.id))
      .sort((a, b) => (Date.parse(b.submitted_at) || 0) - (Date.parse(a.submitted_at) || 0) || b.id - a.id);
    const latest = attempts[0];
    return {
      examId: exam.id, modelCode: exam.modelCode, modelName: exam.modelName,
      partCode: exam.partCode, title: exam.title, attempts: attempts.length,
      status: attempts.some((result) => Boolean(result.passed)) ? "passed" : latest ? "failed" : "not_taken",
      latest: latest ? { score: latest.score, totalScore: latest.total_score, passed: Boolean(latest.passed), submittedAt: latest.submitted_at } : null
    };
  });
}
module.exports = { summarizeProgress };
