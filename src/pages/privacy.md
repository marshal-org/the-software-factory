---
layout: ../layouts/Base.astro
title: Privacy
description: What this site measures, what it does not, and what changes if you accept cookies.
draft: false
---

This site counts visits and a few game events. Google Analytics is added only if you accept it.

## Always, without cookies

- Which page was opened, and which page you came from.
- Your screen size, time zone and browser type.
- In Lights Out: that a game started, which optimizations were installed, that the lights went out (day, grade, early spend, incidents), that "My factory" was used, and that a report was copied.
- That a link to Marshal, Runlease, GitHub or LinkedIn was followed.

This is counted with PostHog in its cookieless mode, which gives each visitor an anonymous identifier that changes every day. Nothing is stored in your browser. The whole of it is one short file, [analytics.js](/analytics.js).

## Only if you accept

On your first visit a bar asks once whether Google Analytics may be used. Your answer is remembered in this browser, so you are not asked again.

- If you accept, Google Tag Manager and Google Analytics are loaded. Google sets cookies and receives the pages you view here and the same game events listed above.
- If you decline, nothing from Google is loaded.

You can change your answer at any time with "Cookie settings" at the bottom of every page. The code is in [consent.js](/consent.js).

## Never

- No account, no email, no name.
- The numbers you type into "My factory" never leave your browser.
- No advertising.

Turning on "Do Not Track" or "Global Privacy Control" in your browser switches off all measurement, and you will not be asked about cookies.
