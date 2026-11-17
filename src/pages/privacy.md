---
layout: ../layouts/Base.astro
title: Privacy
description: What this site measures and what it does not.
draft: false
---

This site counts visits and a few game events, and nothing else.

## What is measured

- Which page was opened, and which page you came from.
- Your screen size, time zone and browser type.
- In Lights Out: that a game started, which optimizations were installed, that the lights went out (day, grade, early spend, incidents), that "My factory" was used, and that a report was copied.
- That a link to Marshal, Runlease, GitHub or LinkedIn was followed.

## What is not

- No cookies, and nothing stored in your browser.
- No account, no email, no name.
- The numbers you type into "My factory" never leave your browser.
- No advertising or third-party scripts.

Visits are counted with PostHog in its cookieless mode, which gives each visitor an anonymous identifier that changes every day. Turning on "Do Not Track" or "Global Privacy Control" in your browser switches the measurement off entirely.

The whole of it is one short file, [analytics.js](/analytics.js), which you can read.
