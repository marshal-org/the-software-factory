// The model behind Lights Out. Every number here is an estimate and open to argument:
// change it in a pull request and say what you have seen in a real team.
const ST = [
  {id:'spec',    nm:'Spec'},
  {id:'code',    nm:'Code'},
  {id:'ci',      nm:'CI'},
  {id:'verify',  nm:'Verify'},
  {id:'review',  nm:'Review'},
  {id:'merge',   nm:'Merge'},
  {id:'release', nm:'Release'},
];
const LAMPS = [
  {id:'yolo',       t:'Approving every agent action'},
  {id:'orch',       t:'Answering agents\' questions'},
  {id:'e2e',        t:'Testing by hand on shared staging'},
  {id:'confidence', t:'Reviewing every pull request'},
  {id:'cd',         t:'Signing off every release'},
];
// kind: cap = raises a station's capacity, quality = cuts rework, enabler = unlocks or protects
const UP = [
  {id:'ready',   st:'spec', kind:'cap', cost:60,  nm:'Definition of ready', d:'A ticket is not ready until it says how to verify it. Fewer half-written specs.'},
  {id:'briefs',  st:'spec', kind:'cap', cost:140, nm:'Decision briefs up front', d:'Grill the spec before an agent starts. Humans decide once, in a batch. Less rework.'},
  {id:'triage',  st:'spec', kind:'cap', cost:200, nm:'Feedback triage agents', d:'Agents turn support tickets, chat threads and error reports into drafted issues.'},
  {id:'engspec', st:'spec', kind:'cap', cost:260, need:['remote'], nm:'Engineers own outcomes', d:'With agents writing the code, engineers spend the day specifying and deciding.'},
  {id:'autospec',st:'spec', kind:'cap', cost:600, need:['briefs','triage'], nm:'Agent-drafted specs', d:'Agents propose complete specs from telemetry and feedback. Humans set direction.'},

  {id:'voice',   st:'code', kind:'cap', cost:40,  nm:'Voice dictation', d:'Talk instead of type. Prompting gets 25% faster.'},
  {id:'agents',  st:'code', kind:'cap', cost:120, nm:'Agentic coders', d:'Agents take whole tasks, two per laptop. They also write three times the tests, and someone has to click Approve.'},
  {id:'sandbox', st:'code', kind:'enabler', cost:180, need:['agents'], nm:'Sandboxed, governed agents', d:'Isolated runtime, scoped credentials, audit trail. Moves no work by itself. Cuts agent incidents tenfold, caps token spend and earns the CISO\'s sign-off.'},
  {id:'yolo',    st:'code', kind:'cap', cost:60,  need:['sandbox'], nm:'Auto-approve mode', d:'Stop babysitting approvals. The CISO allows it only behind a sandbox.'},
  {id:'spend',   st:'code', kind:'enabler', cost:80, need:['agents'], nm:'Spend caps per agent', d:'Every session gets a token budget and stops when it is spent. No more surprise bills.'},
  {id:'remote',  st:'code', kind:'cap', cost:240, need:['agents'], nm:'Agent dev platform', d:'Agents leave the laptop for a platform that runs in the cloud. Every session gets its own isolated space, whichever coding agent you use, and dozens of sessions run in parallel: eight per engineer.'},
  {id:'orch',    st:'code', kind:'cap', cost:520, need:['remote','envs','yolo'], nm:'Orchestrator agent', d:'An agent runs the agents and answers their questions. Only design and security calls reach a human.'},

  {id:'cache',   st:'ci', kind:'cap', cost:180, nm:'Cached, affected-only CI', d:'Build and test only what changed. Five times the capacity.'},
  {id:'flake',   st:'ci', kind:'cap', cost:160, nm:'Flake quarantine', d:'At volume, flaky tests block dozens of agents. Quarantine them automatically.'},
  {id:'runners', st:'ci', kind:'cap', cost:300, nm:'Elastic runners', d:'Runners scale with the queue. Five times the capacity.'},

  {id:'envs',    st:'verify', kind:'cap', cost:280, nm:'Environment per agent', d:'Every agent brings up the full product on its own. Nobody waits for staging.'},
  {id:'data',    st:'verify', kind:'quality', cost:120, need:['envs'], nm:'Seeded test data', d:'Realistic data and sandboxed third-party APIs in every environment. Less rework.'},
  {id:'e2e',     st:'verify', kind:'cap', cost:320, need:['envs'], nm:'Agents run their own E2E', d:'The agent proves its work end to end before asking for review.'},

  {id:'aireview',st:'review', kind:'cap', cost:200, nm:'AI reviewers', d:'Two models review every PR. Humans read only what gets flagged.'},
  {id:'regress', st:'review', kind:'quality', cost:220, nm:'Regression suite gate', d:'Every fixed bug becomes a test that guards the merge. Less rework.'},
  {id:'confidence', st:'review', kind:'cap', cost:440, need:['aireview','regress'], nm:'Confidence-score auto-merge', d:'Evidence adds up to a score. Above the bar, it merges without a human.'},

  {id:'queue',   st:'merge', kind:'cap', cost:140, nm:'Merge queue', d:'Many small PRs land in order instead of colliding.'},

  {id:'cd',      st:'release', kind:'cap', cost:260, nm:'Continuous deploy with flags', d:'Every merge ships dark behind a flag. No release train, no sign-off meeting.'},
  {id:'runbooks',st:'release', kind:'enabler', cost:160, nm:'Incident runbooks for agents', d:'Agents detect, contain and repair incidents from tested runbooks. Outages last a third as long.'},
  {id:'rollout', st:'release', kind:'cap', cost:300, need:['cd'], nm:'Progressive rollout, auto-rollback', d:'Ship to 1%, watch, widen. Bad releases undo themselves, so a bad deploy stops being an incident.'},
];
// the organisation being simulated; defaults are a ten-engineer team
const DEF = {devs:10, prw:30, ciMin:28, revH:6, envs:2, dpw:1, pms:2, ai:'auto'};
function base(P) {
  const flow = P.prw / 5; // merged PRs per working day
  return {
    flow, rate: flow / P.devs,
    ci: Math.max(2, P.devs / 3) * 480 / (P.ciMin * 4),   // runners x minutes per day / (minutes per run x 4 runs per PR)
    review: flow * (1 + 6 / P.revH),                      // long waits mean little slack
    verify: P.envs * 5.5,                                 // each shared environment hosts about 5.5 checks a day
    release: Math.max(flow * 1.2, 16 * P.dpw),
    spec: P.pms * 6.5,
    merge: Math.max(25, flow * 4),
    k: Math.min(20, Math.max(0.5, flow / 6)),             // scale for money and pile sizes
  };
}
const sessions = o => o.orch ? 25 : o.remote ? 8 : o.agents ? 2 : 1;
function caps(o, P) {
  const b = base(P);
  const code = P.devs * sessions(o) * b.rate * (o.agents ? 1.5 : 1) * (o.agents && !o.yolo ? 0.6 : 1) * (o.voice ? 1.25 : 1);
  let ci = b.ci * (o.agents ? 0.6 : 1) * (o.cache ? 5 : 1) * (o.runners ? 5 : 1);
  const flaky = ci > b.ci * 1.8 && !o.flake;
  if (flaky) ci *= 0.6;
  const conflicts = code > b.merge * 1.6 && !o.queue;
  return {
    spec: b.spec * (o.ready ? 1.25 : 1) * (o.briefs ? 1.4 : 1) * (o.triage ? 1.5 : 1) * (o.engspec ? 1.8 : 1) * (o.autospec ? 2.5 : 1),
    code, ci,
    verify: b.verify * (o.envs ? 5 : 1) * (o.e2e ? 4 : 1),
    review: b.review * (o.aireview ? 3 : 1) * (o.confidence ? 6 : 1),
    merge: b.merge * (o.queue ? 10 : 1) * (conflicts ? 0.6 : 1),
    release: b.release * (o.cd ? 6 : 1) * (o.rollout ? 3 : 1),
    rework: Math.max(0.05, 0.28 - (o.briefs ? 0.10 : 0) - (o.data ? 0.07 : 0) - (o.regress ? 0.06 : 0)),
    flaky, conflicts,
  };
}
const price = (up, P) => Math.max(10, Math.round(up.cost * base(P).k / 10) * 10);
// the station that limits flow right now (rework inflates load between code and review)
function constraint(o, P) {
  const c = caps(o, P), k = 1 / (1 - c.rework);
  const load = {spec:1, code:k, ci:k, verify:k, review:k, merge:1, release:1};
  let best = 'spec', v = Infinity;
  for (const s of ST) { const r = c[s.id] / load[s.id]; if (r < v) { v = r; best = s.id; } }
  return best;
}
// things that go wrong; p is the chance per working day
function hazards(o) {
  const a = o.agents ? (o.sandbox ? 0.001 : 0.02 * Math.sqrt(sessions(o) / 2)) : 0; // a sandbox contains the damage however many sessions run
  return [
    {id:'leak',    p:a,       st:'code',    mult:0,   days:2, fine:0.08, txt:'An agent pushed a secret to a public repo. Everyone stops to rotate keys.'},
    {id:'audit',   p:a * 0.7, st:'code',    mult:0.3, days:5, txt:'The CISO found agents holding production credentials and paused most of them for an audit.'},
    {id:'staging', p:o.agents && !o.envs ? (o.sandbox ? 0.002 : 0.02) : 0, st:'verify', mult:0, days:3, txt:'An agent ran a migration against shared staging. Nobody can test.'},
    {id:'deploy',  p:o.rollout ? 0.001 : o.cd ? 0.02 : 0.004, st:'release', mult:0, days:3, txt:'A bad deploy took production down. Releases are frozen.'},
    {id:'tokens',  p:o.spend || !o.agents ? 0 : o.sandbox ? 0.002 : 0.008 * Math.sqrt(sessions(o) / 2), fine:0.1, txt:'The token bill came in at three times the forecast.'},
  ];
}
const riskWeek = o => 1 - hazards(o).reduce((q, h) => q * Math.pow(1 - h.p, 5), 1);
function fresh(P0) {
  const P = Object.assign({}, DEF, P0 || {}), b = base(P), f = b.flow;
  return {P, day:0, budget:120 * b.k, early:0, shipped:0, own: P.ai === 'agents' ? {agents:true} : {}, done:false, chaos:true,
    lim:160 * b.k, unit:Math.max(1, b.k),
    q:{code:1.3 * f, ci:f, verify:1.5 * f, review:1.7 * f, merge:0.5 * f, release:2 * f},
    util:{}, proc:{}, hist:[], pend:[], log:[], journey:[], peak:0, fx:[], buys:[], sh:{}, incidents:0};
}
function eff(s) {
  const c = caps(s.own, s.P);
  s.fx = s.fx.filter(f => s.day < f.until);
  for (const f of s.fx) c[f.st] *= f.mult;
  return c;
}
function avg7(s) { const h = s.hist.slice(-7); return h.length ? h.reduce((a, b) => a + b, 0) / h.length : 0; }
function step(s) {
  const c = eff(s), q = s.q, u = s.util, L = s.lim;
  const mv = (from, cap, room) => Math.max(0, Math.min(q[from], cap, room));
  const ut = (n, cap) => cap > 0 ? n / cap : 0;
  const out = mv('release', c.release, Infinity); q.release -= out; u.release = ut(out, c.release);
  const m = mv('merge', c.merge, L - q.release); q.merge -= m; q.release += m; u.merge = ut(m, c.merge);
  const r = mv('review', c.review, L - q.merge); q.review -= r; q.merge += r * (1 - c.rework); q.code += r * c.rework; u.review = ut(r, c.review);
  const v = mv('verify', c.verify, L - q.review); q.verify -= v; q.review += v; u.verify = ut(v, c.verify);
  const i = mv('ci', c.ci, L - q.verify); q.ci -= i; q.verify += i; u.ci = ut(i, c.ci);
  const k = mv('code', c.code, L - q.ci); q.code -= k; q.ci += k; u.code = ut(k, c.code);
  const sp = Math.max(0, Math.min(c.spec, L - q.code)); q.code += sp; u.spec = ut(sp, c.spec);
  s.proc = {spec:sp, code:k, ci:i, verify:v, review:r, merge:m, release:out, rework:r * c.rework};
  s.day++; s.shipped += out; s.budget += out;
  s.hist.push(out); if (s.hist.length > 60) s.hist.shift();
  const b = constraint(s.own, s.P); if (s.journey[s.journey.length - 1] !== b) s.journey.push(b);
  s.peak = Math.max(s.peak, avg7(s));
  // signals history for the sparklines
  // work in a queue that the station can handle today is in flight, not waiting
  const bl = id => Math.max(0, q[id] - c[id]);
  const thr = avg7(s), back = bl('code') + bl('ci') + bl('verify') + bl('review') + bl('merge') + bl('release');
  const sig = {thr, lead: thr > 0 ? 1 + back / thr : 0, prs: bl('ci') + bl('verify') + bl('review') + bl('merge'), ciw: c.ci > 0 ? bl('ci') / c.ci * 8 : 99,
    rw: c.rework * 100, idle: (1 - Math.min(1, u.code)) * 100, risk: riskWeek(s.own) * 100};
  for (const key in sig) { (s.sh[key] = s.sh[key] || []).push(sig[key]); if (s.sh[key].length > 120) s.sh[key].shift(); }
  s.sig = sig;
  // chaos
  s.hit = null;
  if (s.chaos && s.day > 15) for (const h of hazards(s.own)) {
    if (Math.random() >= h.p || (h.st && s.fx.some(f => f.st === h.st))) continue;
    const days = s.own.runbooks ? Math.ceil(h.days / 3) : h.days;
    if (h.st) s.fx.push({st:h.st, mult:h.mult, until:s.day + days});
    let lost = 0; if (h.fine) { lost = Math.round(Math.max(0, s.budget) * h.fine); s.budget -= lost; }
    s.incidents++; s.hit = {txt:h.txt, st:h.st, days, lost}; break;
  }
  return c;
}
function canBuy(s, up) {
  if (s.own[up.id]) return 'own';
  if ((up.need || []).some(n => !s.own[n])) return 'locked';
  return s.budget >= price(up, s.P) ? 'ok' : 'poor';
}
function buy(s, up) {
  if (canBuy(s, up) !== 'ok') return false;
  const cost = price(up, s.P), early = up.kind === 'cap' && (constraint(s.own, s.P) !== up.st || (up.id === 'flake' && !caps(s.own, s.P).flaky));
  s.budget -= cost; s.own[up.id] = true;
  if (early) s.early += cost;
  s.buys.push({day:s.day, nm:up.nm});
  s.pend.push({at:s.day + 10, nm:up.nm, before:avg7(s), kind:up.kind, early});
  return true;
}
// paying people to drop everything ends an incident now
const clearCost = (s, f) => Math.round(25 * base(s.P).k * Math.max(1, f.until - s.day));
function clearIncident(s, st) {
  const f = s.fx.find(x => x.st === st); if (!f) return false;
  const cost = clearCost(s, f); if (s.budget < cost) return false;
  s.budget -= cost; s.fx = s.fx.filter(x => x !== f); return cost;
}
// what a player who always works on the constraint would buy next
function smartPick(s) {
  const b = constraint(s.own, s.P);
  const fl = caps(s.own, s.P).flaky;
  let c = UP.filter(u => !s.own[u.id] && u.st === b && u.kind === 'cap' && (u.id !== 'flake' || fl));
  if (!c.length) c = UP.filter(u => !s.own[u.id]);
  const first = u => { for (const n of (u.need || [])) if (!s.own[n]) return first(UP.find(x => x.id === n)); return u; };
  return c.map(first).sort((x, y) => x.cost - y.cost)[0];
}
function diagnose(P0) {
  const s = fresh(P0); s.chaos = false;
  const now = constraint(s.own, s.P), c0 = caps(s.own, s.P), moves = [];
  while (s.day < 1500 && moves.length < 3) { step(s); const u = smartPick(s); if (u && buy(s, u)) moves.push(u.nm); }
  return {now, moves, c0, flow: base(s.P).flow};
}
