---
layout: ../../layouts/Play.astro
title: "Guardrails before autonomy"
summary: "The person who says no is doing their job. Give them a reason to say yes."
description: "The person who says no is doing their job. Give them a reason to say yes. Isolation, credentials the agent never holds, a network that denies by default,\u2026"
order: 9
act: 3
actName: "Step out of the line"
---

## The scene

The team wants auto-approve. The security lead asks one question: what can the agent reach? Nobody knows. The honest answer is everything the developer can, so the answer is no. At one company, auto-approve was allowed only for engineers whose agents ran inside an isolated, governed runtime. The agents were the same. What changed was that someone accountable could see what they could touch.

## The play

Isolation, credentials the agent never holds, a network that denies by default, and a record of every action. Then autonomy.

## Smells

- Agents run with a developer's full credentials.
- Auto-approve is banned, or allowed quietly and unevenly.
- Nobody can say what an agent touched last Tuesday.

## First move

Ask your security lead what they would need to see before allowing auto-approve. Write the list down. That list is the project.

## In Lights Out

Sandboxed, governed agents moves no work by itself. It unlocks auto-approve and cuts weekly incident risk several times over.
