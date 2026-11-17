---
layout: ../../layouts/Play.astro
title: "Agents prove their own work"
summary: "Done means it ran. Anything else is a rumour."
description: "Done means it ran. Anything else is a rumour. A change arrives with evidence: the product was started, the feature was used, here is what happened."
order: 5
act: 2
actName: "Let the agents work"
---

## The scene

An agent reports: implemented and tested. The unit tests pass. A person opens the app, clicks the button, and nothing happens. Give the same agent the whole product and tell it to use the feature end to end, and it finds the bug itself, fixes it and tries again.

## The play

A change arrives with evidence: the product was started, the feature was used, here is what happened. An agent that has to prove its work finds more than a person reading the diff.

## Smells

- Someone clicks through every change by hand.
- Pull requests arrive with a description and no proof.
- Verification effort grows in step with agent output.

## First move

Add one line to your agent instructions: do not report done until you have run the feature end to end and attached what you saw.

## In Lights Out

Agents run their own E2E turns off the lamp over Verify and sends the tester home.
