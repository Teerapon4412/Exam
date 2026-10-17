const { test } = require('node:test');
const assert = require('node:assert/strict');
const { summarizeProgress } = require('../exam-progress');
test('includes unattempted parts and isolates employees and exam identities', () => {
 const exams = [{id:'a'},{id:'b'}];
 const results = [{user_id:'other',exam_id:'a',passed:1},{user_id:'u',exam_id:'b',passed:0}];
 assert.deepEqual(summarizeProgress(exams,results,'u').map(p=>p.status), ['not_taken','failed']);
});
test('keeps ever-passed status and sorts latest attempt independently', () => {
 const results = [{id:1,user_id:'u',exam_id:'a',passed:1,submitted_at:'2026-01-01'},{id:2,user_id:'u',exam_id:'a',passed:0,submitted_at:'2026-02-01'}];
 const part = summarizeProgress([{id:'a'}],results,'u')[0];
 assert.equal(part.status,'passed');assert.equal(part.attempts,2);assert.equal(part.latest.passed,false);
});
