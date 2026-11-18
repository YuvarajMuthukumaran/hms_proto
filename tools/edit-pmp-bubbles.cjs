/* 18 Nov 2026: Premorbid personality questions become tap-option bubbles (like the Mental status examination) instead of one-line boxes. */
const fs = require('fs');
const f = 'public/legacy/js/125-premorbid-personality-16nov-js.js';
let s = fs.readFileSync(f, 'utf8');
const a = s.indexOf("        ['Social relations','i'],");
const b = s.indexOf("        ['Habits','i'],") + "        ['Habits','i'],".length;
if (a < 0 || b < a) throw new Error('block not found');
const rows = [
  ['Social relations', ['Sociable', 'Makes friends easily', 'Few close friends', 'Prefers solitude', 'Shy', 'Withdrawn', 'Quarrelsome', 'Dependent on others']],
  ['Intellectual activities, hobbies and use of leisure time', ['Reading', 'Sports', 'Music', 'Art or craft', 'Religious activities', 'TV or social media', 'Travel', 'Few interests']],
  ['Predominant mood', ['Cheerful', 'Optimistic', 'Anxious', 'Worrier', 'Irritable', 'Moody', 'Pessimistic', 'Sad']],
  ['Character: attitude to self', ['Self-confident', 'Low self-esteem', 'Self-critical', 'Overvalues self', 'Perfectionist', 'Over-sensitive']],
  ['Character: attitude to work and responsibility', ['Responsible', 'Hard-working', 'Conscientious', 'Irresponsible', 'Avoids responsibility', 'Frequent job changes', 'Over-dedicated']],
  ['Character: interpersonal relationships', ['Warm', 'Trusting', 'Suspicious', 'Dominant', 'Submissive', 'Aggressive', 'Manipulative', 'Aloof']],
  ['Character: standards in moral, religious and health matters', ['Strict', 'Lenient', 'Religious', 'Not religious', 'Rigid', 'Casual about health', 'Health-conscious']],
  ['Character: energy, initiative', ['Energetic', 'Active', 'Takes initiative', 'Lethargic', 'Easily tired', 'Passive', 'Impulsive']],
  ['Fantasy life', ['Rich', 'Daydreaming', 'Realistic', 'Escapist', 'None']],
  ['Habits', ['Alcohol', 'Tobacco', 'Cannabis', 'Other drugs', 'Regular sleep', 'Irregular sleep', 'Good diet', 'Poor diet', 'Regular exercise', 'Gambling', 'Excessive screen use']]
];
const text = rows.map(function (r) { return "        [" + JSON.stringify(r[0]) + ",'m',O(" + r[1].map(function (x) { return JSON.stringify(x); }).join(',') + ")],"; }).join('\n');
s = s.slice(0, a) + text + s.slice(b);
fs.writeFileSync(f, s);
console.log('ok');
