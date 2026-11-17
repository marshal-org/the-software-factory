---
layout: ../../layouts/Play.astro
title: "Trust is earned with evidence"
summary: "You are not reviewing every pull request. You are skimming every pull request and calling it review."
description: "You are not reviewing every pull request. You are skimming every pull request and calling it review. Replace reading with evidence that adds up: more than\u2026"
order: 8
act: 3
actName: "Step out of the line"
---

## The scene

It goes in stages. First you read every line. Then you skim. Then you only check that the agent did not touch files it had no business touching. Then you let go. Most teams sit at stage two and report stage one.

## The play

Replace reading with evidence that adds up: more than one AI reviewer, because each catches different things; a regression suite that grows with every bug; the agent's own end-to-end proof; and a bar that decides which changes still reach a person. Expect to overpay at first. Bringing up the whole product and running a full pass for every small change is more than you strictly need, and it is what lets people let go.

## Smells

- Every pull request waits for a human, whatever its size or risk.
- Reviews approved in thirty seconds.
- No record of which kinds of change have ever caused an incident.

## First move

Go back over the last fifty review comments people wrote. How many would a second model have caught? How many mattered?

## In Lights Out

AI reviewers and a regression gate unlock auto-merge on a confidence score, which turns off the lamp over Review.
