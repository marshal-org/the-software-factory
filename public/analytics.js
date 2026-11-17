// Page views and a few game events for thesoftwarefactory.site.
//
// This is the whole of it. No third-party code runs on this site: this file
// sends small requests to PostHog and that is all.
//
//   - No cookies, and nothing stored in the browser.
//   - No visitor ID is made here. PostHog derives an anonymous one from a
//     salt it changes every day, so a visitor cannot be followed across days.
//   - What is sent: the page address without its query string, the page you
//     came from, your screen size, time zone and browser type.
//   - From Lights Out: that a game started, which optimization was installed,
//     that the lights went out (day, grade, early spend, incidents), that
//     "My factory" was used, and that a report was copied. The numbers you
//     type into "My factory" never leave your browser.
//   - "Do Not Track" or "Global Privacy Control" turns it off entirely.
//
// The key below is a public, write-only project key, meant for client code.
(function () {
  'use strict';
  var KEY = 'phc_vKpbZaCiayvhanxHTAj2bKYoRjSEMpSzG39N4VAxfaxp';
  var ENDPOINT = 'https://us.i.posthog.com/i/v0/e/';

  if (!KEY) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  if (location.protocol !== 'https:') return; // local previews are not visits

  var ua = navigator.userAgent || '';
  function pick(rules, fallback) {
    for (var i = 0; i < rules.length; i++) if (rules[i][0].test(ua)) return rules[i][1];
    return fallback;
  }
  // Order matters: Edge and Opera also say "Chrome", Chrome also says "Safari".
  var browser = pick([[/Edg\//, 'Microsoft Edge'], [/OPR\//, 'Opera'], [/Firefox\//, 'Firefox'],
    [/Chrome\//, 'Chrome'], [/Safari\//, 'Safari']], 'Other');
  var os = pick([[/Android/, 'Android'], [/iPhone|iPad|iPod/, 'iOS'], [/Windows/, 'Windows'],
    [/Mac OS X/, 'Mac OS X'], [/Linux/, 'Linux']], 'Other');
  var device = /Mobi|iPhone|Android.*Mobile/.test(ua) ? 'Mobile' : (/iPad|Tablet|Android/.test(ua) ? 'Tablet' : 'Desktop');

  var referrer = document.referrer || '$direct';
  var referringDomain = '$direct';
  try { if (document.referrer) referringDomain = new URL(document.referrer).hostname; } catch (e) { /* keep $direct */ }

  var props = {
    // These two make PostHog treat the event as cookieless: it replaces the
    // placeholder ID with its own daily hash and assigns the session.
    $cookieless_mode: true,
    $raw_user_agent: ua,
    $current_url: location.origin + location.pathname,
    $host: location.host,
    $pathname: location.pathname,
    $referrer: referrer,
    $referring_domain: referringDomain,
    $browser: browser,
    $os: os,
    $device_type: device,
    $screen_width: screen.width,
    $screen_height: screen.height,
    $viewport_width: window.innerWidth,
    $viewport_height: window.innerHeight,
    $lib: 'thesoftwarefactory-site'
  };
  try { props.$timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { /* optional */ }

  // Campaign tags, if the link that brought the visitor here carried any.
  try {
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
      if (q.get(k)) props[k] = q.get(k).slice(0, 100);
    });
  } catch (e) { /* optional */ }

  function send(event, extra) {
    var p = {}, k;
    for (k in props) p[k] = props[k];
    for (k in extra || {}) p[k] = extra[k];
    var body = JSON.stringify({ api_key: KEY, event: event, distinct_id: '$posthog_cookieless', properties: p });
    try {
      fetch(ENDPOINT, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: body })
        .catch(function () { /* analytics must never break the page */ });
    } catch (e) { /* same */ }
  }

  send('$pageview');

  // Lights Out reports a handful of named events. Only names and values from
  // these fixed lists are sent, so nothing a visitor types can leave the page.
  var has = Object.prototype.hasOwnProperty;
  var NAMES = { game_started: 1, game_installed: 1, game_lights_out: 1, game_my_factory: 1, game_report_copied: 1 };
  var STATIONS = { spec: 1, code: 1, ci: 1, verify: 1, review: 1, merge: 1, release: 1 };
  var GRADES = { S: 1, A: 1, B: 1, C: 1 };
  var KINDS = { text: 1, image: 1 };
  var num = function (v, max) { v = Math.round(Number(v)); return isFinite(v) ? Math.max(0, Math.min(max, v)) : 0; };
  var sent = 0;
  window.addEventListener('tsf:track', function (e) {
    var d = e && e.detail; if (!d || !has.call(NAMES, d.event) || sent >= 60) return;
    sent += 1;
    var x = {};
    if (d.event === 'game_installed' && /^[a-z0-9]{2,12}$/.test(String(d.id))) { x.optimization = String(d.id); x.day = num(d.day, 100000); x.early = d.early ? true : false; }
    if (d.event === 'game_lights_out') { x.day = num(d.day, 100000); x.grade = has.call(GRADES, d.grade) ? d.grade : 'C'; x.early_spend = num(d.early, 1000000); x.incidents = num(d.incidents, 10000); }
    if (d.event === 'game_my_factory') x.constraint = has.call(STATIONS, d.constraint) ? d.constraint : 'other';
    if (d.event === 'game_report_copied') x.kind = has.call(KINDS, d.kind) ? d.kind : 'text';
    send(d.event, x);
  });

  // That a link out was followed: to Marshal, Runlease, GitHub or LinkedIn.
  var OUT = [[/(^|\.)marshal\.codes$/, 'site_outbound_marshal'], [/(^|\.)runlease\.online$/, 'site_outbound_runlease'],
    [/(^|\.)github\.com$/, 'site_outbound_github'], [/(^|\.)linkedin\.com$/, 'site_outbound_linkedin']];
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="http"]') : null;
    if (!a || sent >= 60) return;
    var host; try { host = new URL(a.href).hostname; } catch (err) { return; }
    for (var i = 0; i < OUT.length; i++) if (OUT[i][0].test(host)) { sent += 1; send(OUT[i][1]); return; }
  });

  var left = false;
  window.addEventListener('pagehide', function () {
    if (left) return;
    left = true;
    send('$pageleave');
  });
})();
