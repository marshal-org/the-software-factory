const $ = id => document.getElementById(id);
const byId = Object.fromEntries(UP.map(u => [u.id, u]));
const stName = Object.fromEntries(ST.map(s => [s.id, s.nm]));
const track = (event, detail) => { try { window.dispatchEvent(new CustomEvent('tsf:track', {detail: Object.assign({event}, detail || {})})); } catch (e) { /* analytics is optional */ } };
let S, timer, speed = 1, paused = false, sel = 'code';
const tickMs = () => 800 / speed;
const money = v => '$' + Math.floor(v).toLocaleString('en-US') + 'k';
function logLine(txt, cls) { S.log.unshift({d: S.day, txt, cls}); S.log.length = Math.min(S.log.length, 14); }

/* ---------- sound ---------- */
let AC = null, hum = null, sound = false;
function initSound() {
  AC = new (window.AudioContext || window.webkitAudioContext)();
  hum = AC.createGain(); hum.gain.value = 0;
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
  [['sawtooth', 100], ['sine', 50], ['sawtooth', 100.7]].forEach(([t, hz]) => { const o = AC.createOscillator(); o.type = t; o.frequency.value = hz; o.connect(f); o.start(); });
  f.connect(hum); hum.connect(AC.destination);
}
function setHum() {
  if (!AC) return;
  const on = LAMPS.filter(l => !S.own[l.id]).length / LAMPS.length;
  hum.gain.setTargetAtTime(sound && !paused ? 0.012 * on : 0, AC.currentTime, 0.5);
}
function beep(hz, dur, type, vol, delay) {
  if (!AC || !sound) return;
  const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'square'; o.frequency.value = hz; g.gain.setValueAtTime((vol || 0.04) * 0.4, t); // quiet by default g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
}
const sfx = {
  buy: () => { beep(660, .07); beep(990, .1, 'square', .04, .07); },
  lamp: () => { beep(64, .7, 'sine', .3); beep(2200, .04, 'square', .02); },
  alarm: () => { for (let i = 0; i < 3; i++) { beep(880, .14, 'square', .05, i * .34); beep(620, .14, 'square', .05, i * .34 + .17); } },
  end: () => { beep(1320, 1.6, 'sine', .07, 1.8); beep(1980, 1.6, 'sine', .04, 1.8); },
};

/* ---------- scene ---------- */
const cv = $('cv'), cx = cv.getContext('2d');
const W = 1180, H = 330, BW = 160, BELT = 250, FEET = 312;
const bayX = i => i * BW;
const PEOPLE = [
  {id:'pm',         bay:0, dx:112, shirt:'#4b6a8a', lamp:null, say:() => ['As a user, I want…', 'Is this P0?', 'Ship it by Friday?']},
  {id:'yolo',       bay:1, dx:96,  shirt:'#8a4b4b', say:o => o.agents ? ['Approve.', 'Approve.', 'Yes, you may run ls.', 'Approve…'] : ['tab tab tab', 'typing…']},
  {id:'orch',       bay:1, dx:128, shirt:'#6b5a8a', say:o => o.agents ? ['Which DB again?', 'Session 6 is asking.', 'Who is on session 3?'] : ['typing…', 'Stack Overflow is down?']},
  {id:'e2e',        bay:3, dx:112, shirt:'#4b8a6a', say:() => ['Who broke staging?', 'Works on my branch.', 'Staging is taken.']},
  {id:'confidence', bay:4, dx:112, shirt:'#8a7a4b', say:() => ['LGTM', 'Nit: rename this.', '47 files changed?', 'LGTM']},
  {id:'cd',         bay:6, dx:112, shirt:'#8a4b7a', say:() => ['CAB meets Thursday.', 'Freeze until Monday.', 'Who signed this off?']},
];
let V;
function resetView() {
  V = {parts: [], dark: ST.map(() => 0), bubble: null, nextBubble: 0, last: 0,
    ppl: Object.fromEntries(PEOPLE.map(p => [p.id, {x: bayX(p.bay) + p.dx, gone: !!(p.lamp !== null && S.own[p.id]), leaving: false}]))};
}
// draw at the size the canvas is actually shown at, so text and edges stay sharp at any width and zoom
function sizeCanvas() {
  const shown = cv.getBoundingClientRect().width || W;
  const k = Math.min(4, shown / W * (window.devicePixelRatio || 1));
  const w = Math.round(W * k), h = Math.round(H * k);
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  cx.setTransform(w / W, 0, 0, h / H, 0, 0);
}
function spawn(now) {
  const dur = tickMs() * 0.92, u = S.unit;
  ST.forEach((s, i) => {
    const n = (S.proc[s.id] || 0) / u;
    const k = n < 0.5 ? 0 : n < 4 ? 1 : n < 12 ? 2 : n < 40 ? 3 : n < 100 ? 4 : 5;
    const x0 = bayX(i) + 112, x1 = i === 6 ? 1150 : bayX(i + 1) + 30;
    for (let j = 0; j < k; j++) V.parts.push({x0, x1, y: BELT - 9, t0: now + j * dur / (k + 1) * 0.5, dur: dur * 0.6, c: '#e39a14'});
  });
  const rw = (S.proc.rework || 0) / u, k = rw < 0.4 ? 0 : rw < 5 ? 1 : 2;
  for (let j = 0; j < k; j++) V.parts.push({x0: bayX(4) + 112, x1: bayX(1) + 30, y: 104, t0: now + j * 200, dur: dur * 0.8, c: '#e0452c'});
}
function person(x, shirt, t, walking) {
  const bob = walking ? Math.round(Math.sin(t / 90)) : Math.round(Math.sin(t / 500 + x) * 0.6), y = FEET + bob;
  cx.fillStyle = '#2a2f2d'; cx.fillRect(x - 5, y - 10, 4, 10); cx.fillRect(x + 1, y - 10, 4, 10);
  cx.fillStyle = shirt; cx.fillRect(x - 6, y - 26, 12, 16);
  cx.fillStyle = '#e3b08a'; cx.fillRect(x - 4, y - 35, 8, 9);
  cx.fillStyle = '#2a2f2d'; cx.fillRect(x - 4, y - 37, 8, 3);
}
function bubble(x, txt) {
  cx.font = '600 11px "IBM Plex Mono", monospace';
  const w = Math.ceil(cx.measureText(txt).width) + 12, bx = Math.max(4, Math.min(W - w - 4, x - w / 2)), by = FEET - 62;
  cx.fillStyle = '#fffdf2'; cx.fillRect(bx, by, w, 18);
  cx.strokeStyle = '#18201d'; cx.lineWidth = 1; cx.strokeRect(bx + .5, by + .5, w - 1, 17);
  cx.fillStyle = '#fffdf2'; cx.fillRect(x - 3, by + 17, 6, 4);
  cx.fillStyle = '#18201d'; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillText(txt, bx + 6, by + 9.5);
}
function draw(now) {
  const dt = Math.min(60, now - (V.last || now)); V.last = now;
  const o = S.own, c = caps(o, S.P);
  const d = LAMPS.filter(l => o[l.id]).length / LAMPS.length;
  cx.fillStyle = '#d6d9cc'; cx.fillRect(0, 0, W, BELT + 12);
  cx.fillStyle = '#c8ccbd'; for (let i = 0; i <= 7; i++) cx.fillRect(bayX(i) - 1, 0, 2, BELT);
  cx.fillStyle = '#aab09f'; cx.fillRect(0, BELT + 12, W, H);
  for (let x = 0; x < W; x += 24) { cx.fillStyle = (x / 24) % 2 ? '#e0a21a' : '#262c2a'; cx.fillRect(x, BELT + 12, 24, 5); }
  cx.fillStyle = '#7d877f'; cx.fillRect(bayX(1) + 26, 110, bayX(4) + 116 - bayX(1) - 26, 5);
  cx.fillRect(bayX(1) + 26, 110, 5, 40); cx.fillRect(bayX(4) + 111, 110, 5, 40);
  cx.fillStyle = '#262c2a'; cx.fillRect(0, BELT, 1120, 12);
  cx.fillStyle = '#4a5450'; const offx = paused ? 0 : (now / 30) % 16; for (let x = -16 + offx; x < 1120; x += 16) cx.fillRect(x, BELT + 4, 8, 4);
  cx.fillStyle = '#1b201e'; cx.fillRect(1120, 120, 60, 142);
  cx.fillStyle = '#e0a21a'; cx.fillRect(1120, 120, 60, 6);
  ST.forEach((s, i) => {
    const mx = bayX(i) + 72;
    cx.fillStyle = '#36423d'; cx.fillRect(mx, 150, 80, 100);
    cx.fillStyle = '#e0a21a'; cx.fillRect(mx, 150, 80, 6);
    cx.fillStyle = '#2a3430'; cx.fillRect(mx + 8, 212, 64, 26);
    if (s.id === 'code' && o.agents) {
      const n = o.orch ? 24 : o.remote ? 8 : 2;
      for (let j = 0; j < n; j++) { cx.fillStyle = Math.sin(now / 200 + j * 1.7) > 0 ? '#73d394' : '#2f5a41'; cx.fillRect(mx + 11 + (j % 8) * 7.5, 215 + Math.floor(j / 8) * 8, 4, 4); }
    }
  });
  PEOPLE.forEach(p => {
    const lx = bayX(p.bay) + p.dx, on = p.lamp === null || !o[p.id];
    cx.fillStyle = '#262c2a'; cx.fillRect(lx, 0, 1, 16); cx.fillRect(lx - 9, 16, 19, 6);
    if (on) { cx.fillStyle = '#ffd24a'; cx.fillRect(lx - 4, 22, 9, 4); }
    const v = V.ppl[p.id];
    if (p.lamp !== null && o[p.id] && !v.gone) { v.leaving = true; if (!paused) v.x += dt * 0.09; if (v.x > 1150) v.gone = true; }
    if (!v.gone) person(Math.round(v.x), p.shirt, now, v.leaving);
  });
  ST.forEach((s, i) => {
    const mine = PEOPLE.filter(p => p.bay === i && p.lamp !== null);
    const target = i === 0 ? d * 0.5 : mine.length ? mine.filter(p => o[p.id]).length / mine.length * 0.6 : d * 0.6;
    V.dark[i] += (target - V.dark[i]) * Math.min(1, dt / 900);
    cx.fillStyle = `rgba(5,8,7,${V.dark[i].toFixed(3)})`; cx.fillRect(bayX(i), 0, i === 6 ? BW + 60 : BW, H);
  });
  PEOPLE.forEach(p => {
    if (p.lamp !== null && o[p.id]) return;
    const lx = bayX(p.bay) + p.dx;
    cx.fillStyle = 'rgba(255,214,90,.10)'; cx.beginPath(); cx.moveTo(lx - 5, 26); cx.lineTo(lx + 5, 26); cx.lineTo(lx + 46, H); cx.lineTo(lx - 46, H); cx.fill();
  });
  cx.textAlign = 'center'; cx.textBaseline = 'middle';
  ST.forEach((s, i) => {
    const mx = bayX(i) + 72, u = Math.min(1, S.util[s.id] || 0), fx = S.fx.find(f => f.st === s.id);
    cx.fillStyle = '#f2f4ea'; cx.font = '900 20px "Big Shoulders Display", Impact, sans-serif'; cx.fillText(s.nm.toUpperCase(), mx + 40, 174, 74);
    cx.font = '600 10px "IBM Plex Mono", monospace'; cx.fillStyle = '#b9c2b8';
    cx.fillText((c[s.id] < 20 ? c[s.id].toFixed(1) : Math.round(c[s.id])) + '/day', mx + 40, 191);
    cx.fillStyle = '#1b211f'; cx.fillRect(mx + 8, 200, 64, 5);
    cx.fillStyle = u > 0.97 ? '#ffb347' : '#73d394'; cx.fillRect(mx + 8, 200, Math.round(64 * u), 5);
    const blocked = i < 6 && S.q[ST[i + 1].id] >= S.lim - 1;
    cx.fillStyle = blocked ? '#ff7557' : u < 0.5 ? '#ffb347' : '#73d394';
    if (blocked && Math.floor(now / 300) % 2) cx.fillStyle = '#5a2a20';
    cx.fillRect(mx + 68, 158, 6, 6);
    if (fx) { // incident beacon
      const lit = Math.floor(now / 250) % 2;
      cx.fillStyle = lit ? '#ff3b1f' : '#5a1a10'; cx.fillRect(mx + 32, 134, 16, 16);
      if (lit) { cx.fillStyle = 'rgba(255,59,31,.18)'; cx.fillRect(mx - 14, 110, 108, 152); }
      cx.fillStyle = '#ff7557'; cx.font = '600 11px "IBM Plex Mono", monospace'; cx.fillText((fx.mult ? 'SLOWED ' : 'DOWN ') + (fx.until - S.day) + 'd', mx + 40, 225);
    }
    if (s.id === sel) { cx.strokeStyle = '#ffb347'; cx.lineWidth = 2; cx.strokeRect(mx - 3, 147, 86, 106); }
  });
  cx.fillStyle = '#ffb347'; cx.font = '900 16px "Big Shoulders Display", Impact, sans-serif'; cx.fillText('PROD', 1150, 142);
  cx.fillStyle = '#f2f4ea'; cx.font = '600 11px "IBM Plex Mono", monospace'; cx.fillText(Math.floor(S.shipped), 1150, 160);
  cx.fillStyle = '#8c968f'; cx.font = '400 9px "IBM Plex Mono", monospace'; cx.fillText('shipped', 1150, 173);
  ST.forEach((s, i) => {
    if (i === 0) return;
    const n = Math.round(Math.max(0, S.q[s.id] - c[s.id]) / S.unit), show = Math.min(n, 60), bx = bayX(i) + 8; // only what the station cannot handle today
    cx.fillStyle = '#e39a14';
    for (let j = 0; j < show; j++) cx.fillRect(bx + (j % 6) * 10, BELT - 10 - Math.floor(j / 6) * 10, 8, 8);
    if (n > 60) { cx.fillStyle = '#ff7557'; cx.font = '600 11px "IBM Plex Mono", monospace'; cx.textAlign = 'left'; cx.fillText('+' + Math.round((n - 60) * S.unit), bx, BELT - 118); cx.textAlign = 'center'; }
  });
  V.parts = V.parts.filter(p => now < p.t0 + p.dur);
  V.parts.forEach(p => { if (now < p.t0) return; const t = (now - p.t0) / p.dur; cx.fillStyle = p.c; cx.fillRect(Math.round(p.x0 + (p.x1 - p.x0) * t), p.y, 8, 8); });
  if (!paused && now > V.nextBubble) {
    const here = PEOPLE.filter(p => !V.ppl[p.id].gone);
    if (here.length) { const p = here[Math.floor(Math.random() * here.length)], v = V.ppl[p.id], lines = p.say(o);
      V.bubble = {id: p.id, txt: v.leaving ? ['Finally.', 'Bye.', 'I have hobbies now.'][Math.floor(Math.random() * 3)] : lines[Math.floor(Math.random() * lines.length)], until: now + 1700}; }
    V.nextBubble = now + 2300;
  }
  if (V.bubble && now < V.bubble.until && !V.ppl[V.bubble.id].gone) bubble(Math.round(V.ppl[V.bubble.id].x), V.bubble.txt);
  if (S.done) {
    cx.textAlign = 'center'; cx.font = '900 60px "Big Shoulders Display", Impact, sans-serif';
    cx.shadowColor = '#ffb347'; cx.shadowBlur = 24; cx.fillStyle = '#ffb347'; cx.fillText('NOBODY IS HERE. STILL SHIPPING.', 560, 62, 1080); cx.shadowBlur = 0;
  }
  requestAnimationFrame(draw);
}
cv.addEventListener('click', e => {
  const r = cv.getBoundingClientRect(), i = Math.max(0, Math.min(6, Math.floor((e.clientX - r.left) / r.width * W / BW)));
  select(ST[i].id);
});

/* ---------- panels ---------- */
const SIG = [['thr','Shipped per day', true, v => v.toFixed(1)], ['lead','Lead time', false, v => v.toFixed(1) + 'd'], ['prs','Open PRs', false, v => Math.round(v)],
  ['ciw','CI wait', false, v => v < 1 ? Math.round(v * 60) + 'm' : v.toFixed(1) + 'h'], ['rw','Rework', false, v => Math.round(v) + '%'],
  ['idle','Coding idle', false, v => Math.round(v) + '%'], ['risk','Incidents / wk', false, v => Math.round(v) + '%']];
// traffic lights: g = healthy up to, a = worth watching up to, above that is a problem
const LIGHT = {
  lead: {g: 5,   a: 15, unit: ' days', what: 'Days a task spends between spec and production.', fix: 'It falls when the pile in front of the constraint drains.'},
  prs:  {g: 3,   a: 8,  unit: ' days of work', val: s => s.prs / Math.max(0.1, s.thr), what: 'Pull requests open somewhere between CI and merge, counted in days of shipping.', fix: 'A growing number means CI, Verify, Review or Merge is the constraint. Look for the biggest pile.'},
  ciw:  {g: 0.5, a: 4,  unit: ' hours', what: 'How long a push waits before CI gets to it.', fix: 'Affected-only CI, flake quarantine, elastic runners.'},
  rw:   {g: 10,  a: 20, unit: '%', what: 'Share of pull requests that bounce back to Code. Every one of them is built, tested and reviewed twice.', fix: 'Decision briefs, seeded test data and a regression gate.'},
  idle: {g: 15,  a: 40, unit: '%', what: 'Coding capacity with nothing to do, or nowhere to push its work.', fix: 'Either Spec is starving the line or a station downstream is full. Buying more coding capacity will not help. Once the lights are out this is expected: the line is waiting for specs.'},
  risk: {g: 3,   a: 10, unit: '%', what: 'Chance that at least one incident hits this week.', fix: 'Sandboxed, governed agents first. Then spend caps, an environment per agent and progressive rollout.'},
};
const WORD = {g: 'good', a: 'watch', r: 'bad'};
function light(id) {
  const L = LIGHT[id]; if (!L || !S.sig) return null;
  const v = L.val ? L.val(S.sig) : S.sig[id];
  let lv = v <= L.g ? 'g' : v <= L.a ? 'a' : 'r';
  if (id === 'idle' && lv === 'r' && constraint(S.own, S.P) === 'spec') lv = 'a'; // the line is waiting for specs, which is where a tuned factory ends up
  return {lv, v, L};
}
let curSig = null;
function showTip(html, anchor, below) {
  const t = $('tip'); t.innerHTML = html; t.hidden = false; t.classList.toggle('touch', touch);
  if (!anchor) return;
  const r = anchor.getBoundingClientRect(), w = 300, h = t.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
  const x = below ? Math.min(vw - w - 8, Math.max(8, r.left)) : (r.right + 8 + w < vw ? r.right + 8 : Math.max(8, r.left - w - 8));
  const y = below ? r.bottom + 6 : Math.min(vh - h - 8, Math.max(8, r.top));
  t.style.left = x + 'px'; t.style.top = y + 'px';
}
function hideTip() { $('tip').hidden = true; cur = null; curSig = null; UP.forEach(x => $('up-' + x.id).classList.remove('cur')); }
function inspectSignal(id, anchor) {
  curSig = id; cur = null;
  const row = SIG.find(x => x[0] === id), t = light(id);
  if (!t) { showTip(`<h3>${row[1]}</h3><p>Tasks reaching production per day, averaged over a week. This is the number every optimization is judged by.</p>`, anchor, true); return; }
  const n = v => (v < 10 ? Math.round(v * 10) / 10 : Math.round(v)) + t.L.unit;
  const verdict = {g: 'Healthy.', a: 'Worth watching.', r: 'This is a problem.'}[t.lv];
  showTip(`<h3>${row[1]}: ${n(t.v)}</h3><p><b class="${t.lv === 'g' ? 'up' : t.lv === 'r' ? 'down' : ''}">${verdict}</b> ${t.L.what}</p><p class="num">green up to ${n(t.L.g)} · amber up to ${n(t.L.a)} · red above</p><p>${t.L.fix}</p>`, anchor, true);
}
const touch = window.matchMedia('(hover: none)').matches;
// short labels for the board; the inspector and the log use the full name
const SH = {ready:'Definition of ready', briefs:'Decision briefs', triage:'Triage agents', engspec:'Engineers specify', autospec:'Agent-drafted specs',
  voice:'Voice dictation', agents:'Agentic coders', sandbox:'Sandbox + governance', yolo:'Auto-approve', spend:'Spend caps', remote:'Agent dev platform', orch:'Orchestrator',
  cache:'Affected-only CI', flake:'Flake quarantine', runners:'Elastic runners', envs:'Env per agent', data:'Seeded test data', e2e:'Agent-run E2E',
  aireview:'AI reviewers', regress:'Regression gate', confidence:'Auto-merge on score', queue:'Merge queue', cd:'Continuous deploy', runbooks:'Incident runbooks', rollout:'Progressive rollout'};
let cur = null; // the optimization shown in the inspector
function select(id) { sel = id; ST.forEach(s => $('col-' + s.id).classList.toggle('sel', s.id === id)); }
function install(u) {
  const before = S.early;
  if (!buy(S, u)) return;
  logLine(`Installed ${u.nm} for ${money(price(u, S.P))}.` + (u.kind === 'enabler' ? ' It moves no work by itself.' : '') + (S.early > before ? ` Counted as early spend: ${stName[u.st]} is not where the line is stuck right now.` : ''), S.early > before ? 'warn' : '');
  track('game_installed', {id: u.id, day: S.day, early: S.early > before});
  if (LAMPS.some(l => l.id === u.id)) sfx.lamp(); else sfx.buy();
  setHum(); render();
}
function inspect(u, anchor) {
  if (!u) { hideTip(); return; }
  cur = u; curSig = null; UP.forEach(x => $('up-' + x.id).classList.toggle('cur', x === u));
  const st = canBuy(S, u), need = (u.need || []).filter(n => !S.own[n]).map(n => byId[n].nm);
  const kind = {cap: 'Raises capacity', quality: 'Cuts rework', enabler: 'Unlocks or protects'}[u.kind];
  showTip(`<h3>${u.nm}</h3><p>${u.d}</p><p class="num">${stName[u.st]} · ${kind} · ${st === 'own' ? 'installed' : money(price(u, S.P))}</p>` +
    (need.length ? `<p class="need">Needs first: ${need.join(', ')}</p>` : '') +
    (st === 'poor' ? `<p class="need">You are ${money(price(u, S.P) - S.budget + 1)} short.</p>` : '') +
    (st === 'ok' && touch ? '<div class="row"><button class="btn go" id="tip-go">Install</button></div>' : ''), anchor);
  if (st === 'ok' && touch) $('tip-go').addEventListener('click', () => { install(u); hideTip(); });
}
function build() {
  $('sig').innerHTML = SIG.map(([id, t]) => `<div class="sg" id="sgt-${id}" tabindex="0"><small>${t} <u id="lv-${id}"></u></small><span><b id="sg-${id}">0</b><em id="tr-${id}"></em></span><svg id="sp-${id}" viewBox="0 0 118 22" preserveAspectRatio="none" aria-hidden="true"></svg></div>`).join('');
  SIG.forEach(([id]) => { const el = $('sgt-' + id); ['mouseenter', 'focus', 'click'].forEach(ev => el.addEventListener(ev, () => inspectSignal(id, el))); if (!touch) ['mouseleave', 'blur'].forEach(ev => el.addEventListener(ev, hideTip)); });
  { const el = $('stat-early'), html = '<h3>Early spend</h3><p>Money spent on capacity at a station that was not the constraint when you bought it. It starts at $0.</p><p>Each such purchase adds its full price here. Optimizations that cut rework or protect the line never count.</p><p>It is not lost: you may need that capacity later. But at the moment you paid, it could not raise shipped tasks per day. A lower number means a better grade.</p>';
    ['mouseenter', 'focus', 'click'].forEach(ev => el.addEventListener(ev, () => showTip(html, el, true))); ['mouseleave', 'blur'].forEach(ev => el.addEventListener(ev, hideTip)); }
  $('board').innerHTML = ST.map(s => `<div class="bcol" id="col-${s.id}"><div class="bh"><b>${s.nm}</b><i id="tq-${s.id}"></i></div><button class="fix" id="fix-${s.id}" hidden></button>` +
    UP.filter(u => u.st === s.id).map(u => `<button class="chip" id="up-${u.id}"><span class="n">${SH[u.id] || u.nm}</span><span class="c" id="cost-${u.id}"></span><span class="why" id="why-${u.id}"></span></button>`).join('') + '</div>').join('') + '<div></div>';
  UP.forEach(u => {
    const b = $('up-' + u.id);
    b.addEventListener('mouseenter', () => inspect(u, b)); b.addEventListener('focus', () => inspect(u, b));
    if (!touch) ['mouseleave', 'blur'].forEach(ev => b.addEventListener(ev, hideTip));
    b.addEventListener('click', () => { if (touch) { inspect(u, b); return; } install(u); inspect(u, b); });
  });
  ST.forEach(s => $('fix-' + s.id).addEventListener('click', () => {
    const cost = clearIncident(S, s.id);
    if (cost) { logLine(`Paid ${money(cost)} to clear the incident at ${s.nm}.`); sfx.buy(); render(); }
  }));
  select(sel); hideTip();
}
function spark(id, goodUp) {
  const h = (S.sh[id] || []).slice(-90), n = h.length;
  if (n < 2) { $('sp-' + id).innerHTML = ''; return; }
  const lo = Math.min(...h), hi = Math.max(...h), span = hi - lo || 1, d0 = S.day - n;
  const X = i => (i / 89 * 116 + 1).toFixed(1), Y = v => (20 - (v - lo) / span * 18).toFixed(1);
  const path = h.map((v, i) => (i ? 'L' : 'M') + X(i) + ' ' + Y(v)).join('');
  const marks = S.buys.filter(b => b.day > d0 && b.day <= S.day).map(b => `<line x1="${X(b.day - d0 - 1)}" x2="${X(b.day - d0 - 1)}" y1="0" y2="22" stroke="var(--accent)" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join('');
  $('sp-' + id).innerHTML = marks + `<path d="${path}" fill="none" stroke="currentColor" stroke-width="1.4" vector-effect="non-scaling-stroke"/>`;
  const el = $('tr-' + id), a = h[n - 1], b = h[Math.max(0, n - 11)];
  if (Math.abs(a - b) < 0.05 * Math.max(1, Math.abs(b))) { el.textContent = ''; return; }
  el.textContent = a > b ? '▲' : '▼'; el.className = (a > b) === goodUp ? 'up' : 'down';
}
function render() {
  const o = S.own, cNow = caps(o, S.P);
  $('day').textContent = S.day; $('budget').textContent = money(S.budget); $('early').textContent = money(S.early);
  const off = LAMPS.filter(l => o[l.id]).length, d = off / LAMPS.length;
  $('loop').textContent = LAMPS.length - off; $('team').textContent = S.P.devs + ' eng';
  document.documentElement.style.setProperty('--d', d === 1 ? 1 : d * 0.12);
  document.documentElement.style.setProperty('--f', d === 1 ? 1 : 0);
  document.documentElement.style.colorScheme = d === 1 ? 'dark' : 'light';
  if (S.sig) SIG.forEach(([id, , goodUp, fmt]) => {
    $('sg-' + id).textContent = fmt(S.sig[id]); spark(id, goodUp);
    const t = light(id); $('sgt-' + id).className = 'sg ' + (t ? t.lv : ''); $('lv-' + id).textContent = t ? '· ' + WORD[t.lv] : '';
    if (t && t.lv === 'r' && !S.red[id]) { S.red[id] = 1; logLine(`${SIG.find(x => x[0] === id)[1]} has turned red. ${t.L.fix}`, 'warn'); }
    if (t && t.lv === 'g') S.red[id] = 0;
  });
  if (curSig) inspectSignal(curSig);
  ST.forEach(s => {
    $('tq-' + s.id).textContent = s.id === 'spec' ? '' : Math.round(Math.max(0, S.q[s.id] - cNow[s.id])) + ' wait';
    const f = S.fx.find(x => x.st === s.id), fb = $('fix-' + s.id);
    fb.hidden = !f; if (f) { const cost = clearCost(S, f); fb.textContent = `Incident, ${f.until - S.day}d left. Clear now: ${money(cost)}`; fb.disabled = S.budget < cost; }
  });
  UP.forEach(u => {
    const st = canBuy(S, u);
    $('up-' + u.id).className = 'chip ' + st + (cur === u ? ' cur' : '');
    $('cost-' + u.id).textContent = st === 'own' ? '✓' : money(price(u, S.P));
    $('why-' + u.id).textContent = st === 'locked' ? 'needs ' + u.need.filter(n => !o[n]).map(n => SH[n]).join(', ') : st === 'poor' ? money(price(u, S.P) - S.budget + 1) + ' short' : '';
  });
  if (cur) inspect(cur);
  $('log').innerHTML = S.log.map(l => `<div><span class="num">day ${l.d}</span><span class="${l.cls || ''}">${l.txt}</span></div>`).join('');
}

/* ---------- report and share image ---------- */
// what the line ships per day once it is flowing: the slowest station, with rework counted.
// A backlog draining through can push a week above this for a while, so the report uses this and not the peak.
function sustained() {
  const cc = caps(S.own, S.P), k = 1 / (1 - cc.rework);
  return Math.min(cc.spec, cc.code / k, cc.ci / k, cc.verify / k, cc.review / k, cc.merge, cc.release);
}
function verdict() {
  const k = base(S.P).k, e = S.early / k, dy = S.endDay;
  const grade = dy <= 265 && e <= 500 ? 'S' : dy <= 310 ? 'A' : dy <= 400 ? 'B' : 'C';
  const arch = e <= 400 ? 'The constraint whisperer' : e >= 2400 ? 'The tool collector' : S.incidents >= 12 ? 'The firefighter' : dy > 400 ? 'The steering committee' : 'The onion peeler';
  // everything installed, for games saved before total spend was tracked
  const spent = S.spent || UP.filter(x => S.own[x.id]).reduce((t, x) => t + price(x, S.P), 0);
  const big = v => v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'M' : '$' + Math.round(v) + 'k';
  const n = v => v < 10 ? (Math.round(v * 10) / 10).toString() : Math.round(v).toLocaleString('en-US');
  const sus = sustained(), now = avg7(S);
  // once the line has settled, show the measured number (the one in the signals row), capped at what it can sustain
  const from = base(S.P).flow, to = Math.max(now >= sus * 0.9 ? Math.min(now, sus) : sus, from);
  return {grade, arch, journey: S.journey.map(x => stName[x]), devs: S.P.devs, from: n(from), to: n(to), times: Math.round(to / from), cost: big(spent), moves: Math.max(0, S.journey.length - 1)};
}
function shareImage(v) {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 630; const g = c.getContext('2d');
  const D = '"Big Shoulders Display", Impact, sans-serif', M = '"IBM Plex Mono", monospace';
  g.fillStyle = '#070a09'; g.fillRect(0, 0, 1200, 630);
  g.fillStyle = '#ffb347'; g.fillRect(0, 0, 1200, 10);
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  // name of the game, small: the sentence under it is the point
  g.font = '900 64px ' + D; g.fillStyle = '#e9ece4'; g.fillText('LIGHTS', 60, 92);
  const w = g.measureText('LIGHTS ').width; g.fillStyle = '#ffb347'; g.shadowColor = '#ffb347'; g.shadowBlur = 22; g.fillText('OUT', 60 + w, 92); g.shadowBlur = 0;
  g.font = '400 19px ' + M; g.fillStyle = '#8c968f'; g.fillText('I ran a software factory until no human was left in the loop.', 62, 128);
  // the result, as a sentence anyone can read
  g.font = '900 62px ' + D; g.fillStyle = '#e9ece4';
  g.fillText(`MY TEAM OF ${v.devs} ENGINEERS WENT FROM`, 60, 218, 900);
  g.fillStyle = '#ffb347'; g.fillText(`${v.from} TO ${v.to} FEATURES A DAY.`, 60, 284, 900);
  g.font = '400 21px ' + M; g.fillStyle = '#c3c9c0'; g.fillText(`${v.times}x the output. Same people.`, 62, 320);
  const cells = [['IT TOOK', S.endDay + ' days'], ['FACTORY COST', v.cost], ['INCIDENTS ON THE WAY', String(S.incidents)]];
  cells.forEach(([k, val], i) => { const x = 62 + i * 250; g.font = '400 15px ' + M; g.fillStyle = '#8c968f'; g.fillText(k, x, 376); g.font = '600 34px ' + M; g.fillStyle = '#e9ece4'; g.fillText(val, x, 414); });
  // grade
  g.textAlign = 'right'; g.font = '400 15px ' + M; g.fillStyle = '#8c968f'; g.fillText('GRADE', 1138, 118);
  g.font = '900 190px ' + D; g.fillStyle = '#ffb347'; g.fillText(v.grade, 1142, 318);
  g.font = '600 17px ' + M; g.fillStyle = '#e9ece4'; g.fillText(v.arch.toUpperCase(), 1138, 356); g.textAlign = 'left';
  // the constraint path
  g.font = '400 15px ' + M; g.fillStyle = '#8c968f';
  g.fillText(v.moves ? `EVERY FIX MOVED THE BOTTLENECK SOMEWHERE ELSE. MINE MOVED ${v.moves} TIME${v.moves === 1 ? '' : 'S'}:` : 'THE BOTTLENECK NEVER MOVED:', 62, 462);
  g.font = '400 18px ' + M; g.fillStyle = '#e9ece4';
  let line = '', y = 490, lines = 0;
  v.journey.forEach((st, i) => { const piece = (i ? '→ ' : '') + st + ' '; if (g.measureText(line + piece).width > 1070 && lines < 1) { g.fillText(line, 62, y); y += 25; line = ''; lines++; } line += piece; });
  g.fillText(line.length > 96 ? line.slice(0, 93) + '…' : line, 62, y);
  // the dark line
  g.fillStyle = '#141a18'; g.fillRect(0, 590, 1200, 8);
  for (let i = 0; i < 4; i++) { const x = 62 + i * 100; g.fillStyle = '#141a18'; g.fillRect(x, 556, 52, 34); g.fillStyle = '#73d394'; g.fillRect(x + 40, 561, 5, 5); g.fillStyle = '#e39a14'; g.fillRect(x + 66, 582, 8, 8); }
  g.textAlign = 'right'; g.font = '600 19px ' + M; g.fillStyle = '#ffb347'; g.fillText('Can you beat it?  thesoftwarefactory.site/lights-out', 1138, 584);
  return c;
}
let shareCv = null;
function report(show) {
  const v = verdict();
  S.result = `LIGHTS OUT. My team of ${v.devs} engineers went from ${v.from} to ${v.to} features a day, with no human left in the loop.\nIt took ${S.endDay} days and ${v.cost} of factory upgrades, with ${S.incidents} incident${S.incidents === 1 ? '' : 's'} on the way. Grade ${v.grade}.\nCan you beat it? https://thesoftwarefactory.site/lights-out/`;
  $('r-text').textContent = S.result; $('copied').textContent = '';
  shareCv = shareImage(v); $('shareimg').src = shareCv.toDataURL('image/png');
  if (show) $('dlg-end').showModal();
}

/* ---------- loop ---------- */
const GOSSIP = [
  [o => o.agents && !o.yolo, 'Someone clicked Approve 412 times today. They would like a word.'],
  [o => o.remote && !o.orch, 'One engineer is juggling eight agent sessions and has stopped blinking.'],
  [o => !o.envs && o.agents, 'Four agents want staging. Staging is one machine.'],
  [o => !o.aireview && o.agents, 'The review queue now has its own review queue.'],
  [o => !o.cd, 'The release train left without this week\'s work. Next one is in seven days.'],
  [o => o.agents && !o.sandbox, 'The CISO asked what exactly the agents can reach. Nobody was sure.'],
];
function tick() {
  const c = step(S); spawn(performance.now());
  S.pend = S.pend.filter(p => {
    if (S.day < p.at) return true;
    const now = avg7(S);
    if (p.kind === 'cap') {
      const moved = now > p.before * 1.08;
      logLine(`${p.nm}: shipped per day ${p.before.toFixed(1)} → ${now.toFixed(1)}. ` + (moved ? 'The needle moved.' : p.early ? 'The needle did not move. That was not the constraint.' : 'Small change. Something else is holding the line now.'), moved ? 'good' : 'warn');
    }
    return false;
  });
  if (S.hit) { logLine('Incident. ' + S.hit.txt + (S.hit.st ? ` ${stName[S.hit.st]} is hit for ${S.hit.days} days.` : '') + (S.hit.lost ? ` Lost ${money(S.hit.lost)}.` : ''), 'warn'); sfx.alarm(); }
  if (c.flaky && !S.flagF) { S.flagF = 1; logLine('CI volume is up and flaky tests are now failing a large share of runs.', 'warn'); }
  if (c.conflicts && !S.flagM) { S.flagM = 1; logLine('Dozens of parallel PRs are colliding at merge.', 'warn'); }
  if (S.day % 37 === 0 && !S.done) { const g = GOSSIP.filter(x => x[0](S.own)); if (g.length) logLine(g[Math.floor(Math.random() * g.length)][1]); }
  if (!S.done && LAMPS.every(l => S.own[l.id])) {
    S.done = true; S.endDay = S.day;
    logLine('Lights out. The factory runs without a human in the loop. Your shift report comes once the line has settled.', 'good');
    sfx.end();
  }
  // the last optimization needs time to show in the numbers, so the report waits for the line to settle
  if (S.done && !S.reported && S.day >= S.endDay + 5) {
    if (avg7(S) >= sustained() * 0.95 || S.day >= S.endDay + 60) {
      S.reported = true; $('rep').hidden = false;
      logLine('The line has settled. The last constraint is deciding what to build.', 'good');
      report(true);
      track('game_lights_out', {day: S.endDay, grade: verdict().grade, early: S.early / base(S.P).k, incidents: S.incidents});
    }
  }
  render();
}
function run() { clearInterval(timer); if (!paused) timer = setInterval(tick, tickMs()); setHum(); }
let booted = false;
function start(data) {
  S = data && data.q && data.P && data.sh ? data : fresh(data && data.P0);
  S.red = S.red || {};
  if (!booted) build();
  resetView(); $('chaos').setAttribute('aria-pressed', S.chaos); $('chaos').textContent = S.chaos ? 'Chaos on' : 'Chaos off';
  if (!S.hist.length) { const ch = S.chaos; S.chaos = false; for (let i = 0; i < 3; i++) step(S); S.chaos = ch; logLine('The shift starts. Watch where the boxes pile up, then click that machine.'); track('game_started'); }
  if (S.done && S.reportAt === undefined && S.reported === undefined && S.day > S.endDay + 45) S.reported = true; // games saved before the report waited
  $('rep').hidden = !S.reported;
  if (S.reported) report(false);
  render(); run();
  if (!booted) { booted = true; sizeCanvas(); new ResizeObserver(sizeCanvas).observe(cv); window.addEventListener('resize', sizeCanvas); requestAnimationFrame(draw); }
}
$('pause').addEventListener('click', e => { paused = !paused; e.target.setAttribute('aria-pressed', paused); e.target.textContent = paused ? 'Resume' : 'Pause'; run(); });
$('fast').addEventListener('click', e => { speed = speed === 1 ? 3 : 1; e.target.setAttribute('aria-pressed', speed === 3); run(); });
$('snd').addEventListener('click', e => {
  sound = !sound; if (sound && !AC) { try { initSound(); } catch (err) { sound = false; } }
  if (AC && AC.state === 'suspended') AC.resume();
  e.target.setAttribute('aria-pressed', sound); e.target.textContent = sound ? 'Sound on' : 'Sound off'; setHum(); if (sound) sfx.buy();
});
$('chaos').addEventListener('click', e => { S.chaos = !S.chaos; e.target.setAttribute('aria-pressed', S.chaos); e.target.textContent = S.chaos ? 'Chaos on' : 'Chaos off'; if (!S.chaos) S.fx = []; });
$('restart').addEventListener('click', () => start({P0: S.P}));
$('help').addEventListener('click', () => $('dlg-help').showModal());
$('rep').addEventListener('click', () => report(true)); // rebuilt each time, with the numbers as they are now
$('org').addEventListener('click', () => { $('dx').hidden = true; $('dlg-org').showModal(); });
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
function readOrg() {
  const n = (id, lo, hi) => Math.min(hi, Math.max(lo, parseFloat($(id).value) || lo));
  return {devs: n('o-devs', 1, 2000), prw: n('o-prw', 1, 20000), ciMin: n('o-ci', 1, 600), revH: n('o-rev', 0.5, 200), envs: n('o-envs', 1, 200), dpw: n('o-dpw', 0.25, 500), pms: n('o-pms', 1, 500), ai: $('o-ai').value};
}
$('o-dx').addEventListener('click', () => {
  const P = readOrg(), r = diagnose(P), c = r.c0, f = v => v < 20 ? v.toFixed(1) : Math.round(v);
  $('dx').hidden = false;
  $('dx').innerHTML = `<small>Your constraint today</small><br><b>${stName[r.now]}</b><p>You merge about ${f(r.flow)} PRs a day. Estimated daily capacity: ${ST.map(s => `${s.nm} ${f(c[s.id])}`).join(', ')}. About ${Math.round(c.rework * 100)}% of PRs bounce back as rework.</p><p>First three moves a constraint-first player would make: ${r.moves.map((m, i) => `${i + 1}. ${m}`).join(' ')}</p>`;
});
$('o-play').addEventListener('click', () => { const P = readOrg(), r = diagnose(P); $('dlg-org').close(); start({P0: P}); select(r.now); track('game_my_factory', {constraint: r.now}); logLine(`Your line is loaded. Constraint today: ${stName[r.now]}.`, 'good'); render(); });
$('o-reset').addEventListener('click', () => {
  const m = {devs:'o-devs', prw:'o-prw', ciMin:'o-ci', revH:'o-rev', envs:'o-envs', dpw:'o-dpw', pms:'o-pms', ai:'o-ai'};
  for (const k in m) $(m[k]).value = DEF[k];
  $('dlg-org').close(); start({P0: DEF}); logLine('Back to the default ten-engineer team.'); render();
});
$('copy').addEventListener('click', () => {
  navigator.clipboard.writeText(S.result || '').then(() => { $('copied').textContent = 'Text copied'; track('game_report_copied', {kind: 'text'}); }, () => { $('copied').textContent = 'Copy failed. Select the text above.'; });
});
$('copyimg').addEventListener('click', () => {
  if (!shareCv || !window.ClipboardItem) { $('copied').textContent = 'Right-click or long-press the image to save it.'; return; }
  shareCv.toBlob(b => navigator.clipboard.write([new ClipboardItem({'image/png': b})]).then(() => { $('copied').textContent = 'Image copied'; track('game_report_copied', {kind: 'image'}); }, () => { $('copied').textContent = 'Right-click or long-press the image to save it.'; }));
});
document.addEventListener('click', e => { if (touch && !e.target.closest('.chip, .sg, .stat, #tip')) hideTip(); });
window.addEventListener('scroll', () => { if (!touch) hideTip(); }, {passive: true});
window.addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return; const i = '1234567'.indexOf(e.key); if (i >= 0) select(ST[i].id); if (e.key === ' ' && e.target === document.body) { e.preventDefault(); $('pause').click(); } });
window.claude?.hot?.snapshot?.(() => S);
if (window.claude?.hot?.ready) window.claude.hot.ready(start); else start(window.claude?.hot?.data ?? {});
