---
layout: ../../layouts/Play.astro
title: "Give every agent its own environment"
summary: "Ten agents, one staging. Nine are waiting and one is breaking it."
description: "Ten agents, one staging. Nine are waiting and one is breaking it. Every agent session gets a complete environment of its own: runtime, data, ports, the\u2026"
order: 4
act: 2
actName: "Let the agents work"
---

## The scene

Three agents on one laptop. Ports already taken. One database that everyone writes to. Migrations stepping on each other. A test that fails because another agent changed something. Git worktrees separate the code and nothing else.

## The play

Every agent session gets a complete environment of its own: runtime, data, ports, the whole product. Up in seconds, thrown away afterwards.

## Smells

- Agents queue for staging, or wreck each other's data.
- Work is verified only after it merges to a shared branch.
- A laptop holds two or three agents and the fan is loud.

## First move

Time how long it takes to bring up your whole product from nothing on a clean machine. That number is the size of the job.

## In Lights Out

Environment per agent multiplies Verify capacity by five and ends the incident where an agent takes shared staging down.
