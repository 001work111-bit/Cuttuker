// Typography wrap verification: conservative Arial metrics, real column widths from the layouts.
const adv = (ch, b) => {
  if (ch === ' ') return 0.3;
  if ("iljI.,:;'|!".includes(ch)) return 0.3;
  if (ch === '—' || ch === '–') return 1.0;
  if (ch === '→') return 0.95;
  if (/[0-9]/.test(ch)) return 0.56;
  if (/[A-ZА-ЯЁ]/.test(ch)) return b ? 0.76 : 0.72;
  if (/[a-zа-яё]/.test(ch)) return b ? 0.6 : 0.57;
  return 0.42;
};
const tw = (s, size, b, ls = 0) => [...s].reduce((a, c) => a + adv(c, b) * size, 0) + ls * Math.max(0, [...s].length - 1);
const wrap = (t, size, b, maxW, ls = 0) => {
  const words = t.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? cur + ' ' + w : w;
    if (tw(cand, size, b, ls) <= maxW || !cur) cur = cand;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
};

// [code, slotLabel, text, px, bold, availWidth, letterSpacing, maxLinesAllowed]
const CASES = [
  ['V1-01', 'overline', 'PAST → AUTHORITY → PRESENT', 11, false, 464, 2.86, 2],
  ['V1-01', 'title', 'ПРОШЛОЕ|КАК|ОСНОВА', 58, true, 464, -1.16, 4],
  ['V1-01', 'phrase1', 'Мы помещаем современный объект перед визуальным наследием прошлого.', 17, false, 414, 0, 3],
  ['V1-01', 'phrase2', 'То, что обладает культурным авторитетом, становится фоном.', 17, false, 414, 0, 3],
  ['V1-01', 'phrase3', 'А современный объект — продолжением этой линии.', 17, false, 414, 0, 3],
  ['V1-01', 'phrase4', 'Прошлое передаёт ему свой авторитет.', 17, false, 414, 0, 3],
  ['V1-01', 'phrase5', 'Современность получает акцент.', 26, true, 284, -0.26, 3],
  ['V1-02', 'label-main', 'VISUAL SYNTHESIS', 12, false, 600, 3.6, 1],
  ['V1-02', 'label-present', 'PRESENT → FOREGROUND', 11, false, 300, 2.2, 1],
  ['V2-01', 'title', 'ПРОШЛОЕ|КАК|ОСНОВА', 62, true, 467, -1.24, 4],
  ['V2-01', 'question', 'А может ли авторитет прошлого работать на современность?', 22, false, 340, 0, 3],
  ['V2-02', 'meta', 'CREATIVE DIRECTION / ART DIRECTION / MOTION COLLAGE', 11, false, 700, 1.54, 2],
  ['V2-02', 'statement', 'Мы помещаем современный объект перед визуальным наследием прошлого.', 58, true, 1000, -1.16, 4],
  ['V2-02', 'phrase2', 'То, что обладает культурным авторитетом, становится фоном.', 20, false, 346, 0, 3],
  ['V2-02', 'phrase3', 'А современный объект — продолжением этой линии.', 20, false, 346, 0, 3],
  ['V2-02', 'phrase4', 'Прошлое передаёт ему свой авторитет.', 20, false, 346, 0, 3],
  ['V2-02', 'phrase5', 'Современность получает акцент.', 34, true, 1128, -0.34, 2],
  ['V3-01', 'title', 'ПРОШЛОЕ|КАК|ОСНОВА', 66, true, 505, -1.98, 4],
  ['V3-01', 'formula', 'PAST → AUTHORITY → PRESENT', 11, false, 505, 2.64, 2],
  ['V3-01', 'question', 'А может ли авторитет прошлого работать на современность?', 21, false, 651, 0, 2],
  ['V3-02', 'statement', 'То, что обладает культурным авторитетом, становится фоном.', 50, true, 694, -1, 4],
  ['V3-02', 'phrase3', 'А современный объект — продолжением этой линии.', 23, false, 460, 0, 3],
  ['V3-03', 'phrase4', 'Прошлое передаёт ему свой авторитет.', 22, false, 748, 0, 2],
  ['V3-03', 'formula', 'PAST → AUTHORITY → PRESENT', 11, false, 384, 2.42, 2],
  ['V3-03', 'phrase5', 'Современность получает акцент.', 32, true, 384, -0.32, 3],
  ['V4-01', 'title', 'ПРОШЛОЕ|КАК ОСНОВА', 68, true, 700, -1.7, 3],
  ['V4-01', 'question', 'А может ли авторитет прошлого работать на современность?', 21, false, 360, 0, 3],
  ['V4-02', 'overline', 'PAST → AUTHORITY', 11, false, 500, 3.08, 1],
  ['V4-02', 'statement', 'Мы помещаем современный объект перед визуальным наследием прошлого.', 66, true, 930, -1.65, 4],
  ['V4-02', 'phrase2', 'То, что обладает культурным авторитетом, становится фоном.', 21, false, 522, 0, 2],
  ['V4-02', 'phrase3', 'А современный объект — продолжением этой линии.', 21, false, 522, 0, 2],
  ['V4-03', 'overline', 'PRESENT → FOREGROUND', 11, false, 340, 2.64, 2],
  ['V4-03', 'phrase4', 'Прошлое передаёт ему свой авторитет.', 21, false, 340, 0, 3],
  ['V4-03', 'phrase5', 'Современность получает акцент.', 32, true, 340, -0.32, 3],
  ['V5-01', 'overline', 'PAST → AUTHORITY → PRESENT', 11, false, 1096, 3.3, 2],
  ['V5-01', 'title', 'ПРОШЛОЕ|КАК|ОСНОВА', 96, true, 1096, -3.36, 3],
  ['V5-01', 'question', 'А может ли авторитет прошлого работать на современность?', 22, false, 520, 0, 3],
  ['V5-01', 'label', 'PRESENT → FOREGROUND', 11, false, 400, 2.64, 1],
  ['V5-02', 'overline', 'PAST → AUTHORITY → PRESENT', 10, false, 366, 2.4, 2],
  ['V5-02', 'phrase1', 'Мы помещаем современный объект перед визуальным наследием прошлого.', 24, true, 366, -0.24, 4],
  ['V5-02', 'phrase2', 'То, что обладает культурным авторитетом, становится фоном.', 18, false, 366, 0, 3],
  ['V5-02', 'phrase3', 'А современный объект — продолжением этой линии.', 18, false, 366, 0, 3],
  ['V5-02', 'phrase4', 'Прошлое передаёт ему свой авторитет.', 18, false, 366, 0, 2],
  ['V5-02', 'phrase5', 'Современность получает акцент.', 28, true, 366, -0.28, 3],
  ['V5-02', 'meta', 'CREATIVE DIRECTION / ART DIRECTION / MOTION COLLAGE', 10, false, 366, 1.2, 3],
  ['V5-03', 'label', 'VISUAL SYNTHESIS', 12, false, 600, 3.6, 1],
];

let bad = 0;
let prev = '';
let sumLines = {};
for (const [code, slot, text, size, bold, availW, ls, maxLines] of CASES) {
  if (code !== prev) { console.log(`\n— ${code} —`); prev = code; sumLines[code] = 0; }
  const segs = text.split('|');
  let totalLines = 0, widest = 0;
  segs.forEach((s) => {
    const l = wrap(s, size, bold, availW, ls);
    totalLines += l.length;
    l.forEach((x) => { widest = Math.max(widest, tw(x, size, bold, ls)); });
  });
  const h = +(totalLines * size * 1.06).toFixed(0);
  const ok = totalLines <= maxLines && widest <= availW + 0.5;
  if (!ok) bad++;
  sumLines[code] += h;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${slot.padEnd(11)} ${String(size).padStart(3)}px ${String(totalLines).padStart(2)} lines  h≈${String(h).padStart(3)}  widest ${widest.toFixed(0)}/${availW}`);
}
console.log('\nfailures:', bad);
