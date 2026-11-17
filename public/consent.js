// Google Analytics, through Google Tag Manager, only for visitors who say yes.
//
// On a first visit a small bar asks once. The answer is kept in this browser
// (localStorage, key "tsf-consent"), so the bar does not come back on later
// pages or visits. "Cookie settings" in the footer opens it again.
//
//   - Accept:  Google Tag Manager loads, and Google Analytics may set cookies.
//   - Decline: nothing from Google is loaded at all.
//   - "Do Not Track" or "Global Privacy Control" counts as Decline, with no bar.
(function () {
  'use strict';
  var GTM = 'GTM-5VNBL5LV', KEY = 'tsf-consent';
  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* asked again next time */ } }

  var loaded = false;
  function load() {
    if (loaded || location.protocol !== 'https:') return; // local previews are not visits
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    // Analytics only. Nothing here is used for advertising.
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM;
    document.head.appendChild(s);
    // Lights Out events, for tags in the container that want them.
    window.addEventListener('tsf:track', function (e) {
      var d = e && e.detail; if (!d || !/^game_[a-z_]{3,30}$/.test(String(d.event))) return;
      var x = { event: d.event };
      if (/^[a-z0-9]{2,12}$/.test(String(d.id))) x.optimization = String(d.id);
      if (isFinite(d.day)) x.day = Math.round(d.day);
      if (/^[SABC]$/.test(String(d.grade))) x.grade = d.grade;
      if (/^(text|image)$/.test(String(d.kind))) x.kind = d.kind;
      if (/^[a-z]{2,10}$/.test(String(d.constraint))) x.constraint = d.constraint;
      window.dataLayer.push(x);
    });
  }

  var bar = null;
  function close() { if (bar) { bar.remove(); bar = null; } }
  function ask() {
    if (bar) return;
    bar = document.createElement('div');
    bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Cookie consent');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:50;background:#18201d;color:#f1f2ec;padding:12px 16px;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:center;font:400 14px/1.4 "IBM Plex Sans",system-ui,sans-serif;box-shadow:0 -2px 12px rgba(0,0,0,.25)';
    var btn = 'font:600 14px "IBM Plex Sans",system-ui,sans-serif;padding:7px 16px;cursor:pointer;border:1px solid #f1f2ec;';
    bar.innerHTML = '<span style="max-width:64ch">This site would like to use Google Analytics to see how it is used. It sets cookies only if you accept. <a href="/privacy/" style="color:#ffb347">Privacy</a></span>' +
      '<span style="display:flex;gap:8px"><button type="button" data-a="yes" style="' + btn + 'background:#ffb347;border-color:#ffb347;color:#111">Accept</button>' +
      '<button type="button" data-a="no" style="' + btn + 'background:transparent;color:#f1f2ec">Decline</button></span>';
    bar.addEventListener('click', function (e) {
      var a = e.target && e.target.getAttribute ? e.target.getAttribute('data-a') : null; if (!a) return;
      var was = read(); write(a); close();
      if (a === 'yes') load();
      else if (was === 'yes') location.reload(); // stop what was already running
    });
    document.body.appendChild(bar);
  }

  function start() {
    var v = read();
    if (v === 'yes' && !dnt) load();
    else if (!v && !dnt) ask();
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('[data-consent-open]') : null;
      if (a) { e.preventDefault(); ask(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
