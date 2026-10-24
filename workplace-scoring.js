"use strict";
const GROUPS = [
  {
    key: "preparation",
    title: "การเตรียมตัวก่อนปฏิบัติงาน",
    metrics: ["preparationPercent"],
  },
  {
    key: "quantity",
    title: "ปริมาณงาน",
    metrics: ["outputPercent", "overCut", "undercut"],
  },
  { key: "quality", title: "คุณภาพงาน", metrics: ["outFlow", "nc", "car"] },
  {
    key: "response",
    title: "การตอบสนองต่อปัญหา",
    metrics: ["responsePercent"],
  },
];
const METRICS = {
  preparationPercent: ["คะแนนข้อสอบเตรียมตัว (%)", "higher"],
  outputPercent: ["ยอดงานเทียบเป้าหมาย (%)", "higher"],
  overCut: ["จำนวน Over cut", "lower"],
  undercut: ["จำนวนตัดกินเนื้อ", "lower"],
  outFlow: ["จำนวน Out Flow", "lower"],
  nc: ["จำนวน NC", "lower"],
  car: ["จำนวน CAR", "lower"],
  responsePercent: ["คะแนนข้อสอบติดตามปัญหา (%)", "higher"],
};
function check(condition, message) {
  if (!condition) throw new Error(message);
}
function finite(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function validateConfig(config) {
  check(
    config && Array.isArray(config.groups) && config.groups.length === 4,
    "ต้องกำหนดเกณฑ์ครบ 4 หัวข้อ",
  );
  const groups = GROUPS.map((group) => {
    const source = config.groups.find((g) => g.key === group.key);
    check(
      source &&
        finite(source.weight) &&
        source.weight > 0 &&
        source.weight <= 100,
      "น้ำหนักต้องมากกว่า 0 และไม่เกิน 100",
    );
    const metrics = {};
    for (const key of group.metrics) {
      const thresholds = source.metrics?.[key];
      check(
        Array.isArray(thresholds) &&
          thresholds.length === 3 &&
          thresholds.every((n) => finite(n) && n >= 0),
        "ต้องกรอกเกณฑ์ตัวเลขครบ 3 ระดับ",
      );
      const higher = METRICS[key][1] === "higher";
      check(
        higher
          ? thresholds[0] < thresholds[1] && thresholds[1] < thresholds[2]
          : thresholds[0] > thresholds[1] && thresholds[1] > thresholds[2],
        "เกณฑ์ต้องเรียงระดับ 2 → 3 → 4 โดยแต่ละระดับแตกต่างกัน",
      );
      if (key.endsWith("Percent") && key !== "outputPercent")
        check(
          thresholds.every((n) => n <= 100),
          "เกณฑ์คะแนนข้อสอบต้องไม่เกิน 100%",
        );
      if (!key.endsWith("Percent"))
        check(
          thresholds.every(Number.isInteger),
          "เกณฑ์จำนวนเหตุการณ์ต้องเป็นจำนวนเต็ม",
        );
      metrics[key] = thresholds;
    }
    return { ...group, weight: source.weight, metrics };
  });
  const quizzes = {};
  for (const kind of ["preparation", "response"]) {
    const questions = config.quizzes?.[kind];
    check(
      Array.isArray(questions) &&
        questions.length > 0 &&
        questions.length <= 100,
      "ต้องสร้างข้อสอบแยกทั้งสองชุด ชุดละ 1–100 ข้อ",
    );
    quizzes[kind] = questions.map((q) => {
      check(
        typeof q.text === "string" && q.text.trim() && q.text.length <= 5000,
        "กรุณากรอกคำถาม",
      );
      check(
        Array.isArray(q.choices) &&
          q.choices.length === 4 &&
          q.choices.every(
            (c) => typeof c === "string" && c.trim() && c.length <= 2000,
          ),
        "ข้อสอบต้องมี 4 ตัวเลือก",
      );
      check(
        Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4,
        "เลือกคำตอบที่ถูกต้อง",
      );
      return {
        text: q.text.trim(),
        choices: q.choices.map((c) => c.trim()),
        answer: q.answer,
      };
    });
  }
  return { groups, quizzes };
}
function scoreMetrics(config, inputs) {
  return config.groups.map((group) => {
    const levels = group.metrics;
    const evidence = {};
    const scores = Object.entries(levels).map(([key, thresholds]) => {
      const value = inputs[key];
      check(
        finite(value) && value >= 0,
        "ข้อมูลไม่ครบหรือไม่ถูกต้อง: " + METRICS[key][0],
      );
      if (!key.endsWith("Percent"))
        check(Number.isInteger(value), "จำนวนเหตุการณ์ต้องเป็นจำนวนเต็ม");
      evidence[key] = value;
      let level = 1;
      thresholds.forEach((threshold, index) => {
        if (
          METRICS[key][1] === "higher" ? value >= threshold : value <= threshold
        )
          level = index + 2;
      });
      return level;
    });
    return {
      title: group.title,
      key: group.key,
      method: "อัตโนมัติตามเกณฑ์ Admin",
      maxScore: 4,
      weight: group.weight,
      score: Math.min(...scores),
      evidence,
      thresholds: levels,
    };
  });
}
module.exports = { GROUPS, METRICS, validateConfig, scoreMetrics, check };
