(function () {
  "use strict";
  const TOPIC_TITLES = {
    preparation:
      "การเตรียมตัวก่อนปฏิบัติงานการเตรียมงานและเอกสารการแขวนคูมือปฏิบัติงาน",
    quantity: "ปริมาณงานปริมาณผลงานที่ทำได้ตามเป้าหมายของหน่วยงาน",
    quality: "คุณภาพงานความถูกต้องของผลงานที่ทำได้",
    response: "การตอบสนองต่อปัญหาและการติดตามปัญหาที่เกิดขึ้น",
  };
  const STANDARD_WEIGHTS = {
    preparation: 4,
    quantity: 3,
    quality: 4,
    response: 4,
  };
  const GROUPS = [
    {
      key: "preparation",
      title: TOPIC_TITLES.preparation,
      metrics: ["preparationPercent"],
    },
    {
      key: "quantity",
      title: TOPIC_TITLES.quantity,
      metrics: ["outputPercent", "overCut", "undercut"],
    },
    {
      key: "quality",
      title: TOPIC_TITLES.quality,
      metrics: ["outFlow", "nc", "car"],
    },
    {
      key: "response",
      title: TOPIC_TITLES.response,
      metrics: ["responsePercent"],
    },
  ];
  const METRICS = {
    quantityRaw: ["คะแนนดิบปริมาณงาน", "higher"],
    qualityRaw: ["คะแนนดิบคุณภาพงาน", "higher"],
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
      config &&
        Array.isArray(config.groups) &&
        [2, 3, 4].includes(config.groups.length) &&
        new Set(config.groups.map((g) => g.key)).size ===
          config.groups.length &&
        config.groups.every((g) =>
          GROUPS.some((known) => known.key === g.key),
        ) &&
        ["preparation", "response"].every((key) =>
          config.groups.some((g) => g.key === key),
        ),
      "ต้องกำหนดเกณฑ์การเตรียมตัวและการตอบสนองต่อปัญหา",
    );
    const groups = GROUPS.filter((group) =>
      config.groups.some((source) => source.key === group.key),
    ).map((group) => {
      const source = config.groups.find((g) => g.key === group.key);
      check(
        source &&
          finite(source.weight) &&
          source.weight > 0 &&
          source.weight <= 100,
        `${group.title}: น้ำหนักต้องมากกว่า 0 และไม่เกิน 100`,
      );
      const metrics = {};
      for (const key of group.metrics) {
        const thresholds = source.metrics?.[key];
        check(
          Array.isArray(thresholds) &&
            thresholds.length === 3 &&
            thresholds.every((n) => finite(n) && n >= 0),
          `${group.title} / ${METRICS[key][0]}: ต้องกรอกเกณฑ์ตัวเลขครบระดับ 2, 3, 4`,
        );
        const higher = METRICS[key][1] === "higher";
        check(
          higher
            ? thresholds[0] < thresholds[1] && thresholds[1] < thresholds[2]
            : thresholds[0] > thresholds[1] && thresholds[1] > thresholds[2],
          `${group.title} / ${METRICS[key][0]}: ${higher ? "เกณฑ์ระดับ 2 < ระดับ 3 < ระดับ 4" : "เกณฑ์ระดับ 2 > ระดับ 3 > ระดับ 4"}`,
        );
        if (key.endsWith("Percent") && key !== "outputPercent")
          check(
            thresholds.every((n) => n <= 100),
            `${group.title}: เกณฑ์คะแนนข้อสอบต้องไม่เกิน 100%`,
          );
        if (!key.endsWith("Percent"))
          check(
            thresholds.every(Number.isInteger),
            `${group.title} / ${METRICS[key][0]}: เกณฑ์จำนวนเหตุการณ์ต้องเป็นจำนวนเต็ม`,
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
        `${kind === "preparation" ? "ข้อสอบเตรียมตัวก่อนปฏิบัติงาน" : "ข้อสอบการติดตามปัญหา"}: ต้องมีคำถาม 1–100 ข้อ`,
      );
      quizzes[kind] = questions.map((q, index) => {
        const location = `${kind === "preparation" ? "ข้อสอบเตรียมตัว" : "ข้อสอบติดตามปัญหา"} ข้อที่ ${index + 1}`;
        check(
          typeof q.text === "string" && q.text.trim() && q.text.length <= 5000,
          `${location}: กรุณากรอกคำถาม (ไม่เกิน 5000 ตัวอักษร)`,
        );
        check(
          Array.isArray(q.choices) &&
            q.choices.length === 4 &&
            q.choices.every(
              (c) => typeof c === "string" && c.trim() && c.length <= 2000,
            ),
          `${location}: ต้องกรอกตัวเลือก A–D ครบทั้ง 4 ตัวเลือก`,
        );
        check(
          Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4,
          `${location}: เลือกคำตอบที่ถูกต้อง`,
        );
        const score = q.score === undefined ? 1 : q.score;
        check(
          finite(score) && score >= 1 && score <= 1000,
          `${location}: คะแนนรายข้อต้องอยู่ระหว่าง 1–1000`,
        );
        const imageUrl = String(q.imageUrl || "").trim();
        check(
          imageUrl.length <= 7500000,
          `${location}: รูปประกอบมีขนาดใหญ่เกินไป`,
        );
        if (imageUrl) {
          let valid =
            /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(
              imageUrl,
            );
          try {
            const url = new URL(imageUrl);
            valid = valid || ["http:", "https:"].includes(url.protocol);
          } catch {}
          check(
            valid,
            `${location}: รูปประกอบต้องเป็น URL http/https หรือไฟล์ PNG, JPEG, GIF, WebP`,
          );
        }
        return {
          score,
          imageUrl,
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
        if (["overCut", "undercut", "outFlow", "nc", "car"].includes(key))
          check(Number.isInteger(value), "จำนวนเหตุการณ์ต้องเป็นจำนวนเต็ม");
        evidence[key] = value;
        let level = 1;
        thresholds.forEach((threshold, index) => {
          if (
            (group.direction || METRICS[key][1]) === "higher"
              ? value >= threshold
              : value <= threshold
          )
            level = index + 2;
        });
        return level;
      });
      return {
        title: TOPIC_TITLES[group.key] || group.title,
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
  function validateManualRules(value) {
    check(
      value && Array.isArray(value.groups) && value.groups.length === 2,
      "กำหนดเกณฑ์คะแนนดิบทั้งปริมาณงานและคุณภาพงาน",
    );
    return {
      groups: ["quantity", "quality"].map((key) => {
        const source = value.groups.find((group) => group.key === key),
          metric = key + "Raw",
          title = TOPIC_TITLES[key];
        check(
          source &&
            finite(source.weight) &&
            source.weight > 0 &&
            source.weight <= 100,
          title + ": น้ำหนักต้องมากกว่า 0 และไม่เกิน 100",
        );
        check(
          ["higher", "lower"].includes(source.direction),
          title + ": เลือกทิศทางเกณฑ์",
        );
        const thresholds = source.metrics?.[metric];
        check(
          Array.isArray(thresholds) &&
            thresholds.length === 3 &&
            thresholds.every((n) => finite(n) && n >= 0),
          title + ": กรอกเกณฑ์ระดับ 2–4 ให้ครบ",
        );
        check(
          source.direction === "higher"
            ? thresholds[0] < thresholds[1] && thresholds[1] < thresholds[2]
            : thresholds[0] > thresholds[1] && thresholds[1] > thresholds[2],
          title + ": เกณฑ์ระดับ 2–4 ต้องเรียงตามทิศทางที่เลือก",
        );
        return {
          key,
          title,
          weight: source.weight,
          direction: source.direction,
          metrics: { [metric]: thresholds },
        };
      }),
    };
  }
  const scoring = {
    TOPIC_TITLES,
    STANDARD_WEIGHTS,
    GROUPS,
    METRICS,
    validateConfig,
    scoreMetrics,
    check,
    validateManualRules,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = scoring;
  else globalThis.WorkplaceScoring = scoring;
})();
