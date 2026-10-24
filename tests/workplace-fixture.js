const { GROUPS } = require("../workplace-scoring");
module.exports = function fixture() {
  return {
    groups: GROUPS.map((group, index) => ({
      key: group.key,
      weight: index + 1,
      metrics: Object.fromEntries(
        group.metrics.map((key) => [
          key,
          key.endsWith("Percent") ? [50, 75, 90] : [5, 2, 0],
        ]),
      ),
    })),
    quizzes: {
      preparation: [
        { text: "Ready?", choices: ["A", "B", "C", "D"], answer: 0 },
      ],
      response: [
        { text: "Follow up?", choices: ["A", "B", "C", "D"], answer: 1 },
      ],
    },
  };
};
