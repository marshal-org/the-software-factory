---
layout: ../layouts/Base.astro
title: What is a software factory?
description: "A software factory is your delivery line, run by AI coding agents, with people deciding what to build. It is not a tool you install. Here is what that means in practice."
draft: false
---

A software factory is a software delivery line in which AI coding agents do most of the building, testing and shipping, and people decide what gets built and handle the exceptions.

## The short version

In a traditional team, people stand at every station of the line: they write the spec, write the code, wait for CI, test on staging, review the pull request, merge it and sign off the release. In a software factory, agents do that work and move it from station to station. People step back to the two ends: choosing what is worth building, and judging the cases the factory flags.

## What is a dark factory?

A dark factory, or lights-out factory, is the far end of the same road. The term comes from manufacturing, where a plant run entirely by robots needs no lighting. In software it means that no person writes the code and no person reads it before it ships: specifications go in and working software comes out.

Most teams are nowhere near that, and most do not need to be. The useful question is where your line is today and what is holding it back. See the [journey](/journey/) for the stages in between.

## How do you build one?

A software factory is your software delivery line, your SDLC. It is not a product, and nobody can sell you one.

You will install tools along the way, and each plays a role in the factory: coding agents, an AI code reviewer, an agent dev platform, security and governance tooling, elastic CI. All of them are parts. No single tool is a software factory, whatever its name says.

So you do not install a software factory. You tune the line you have, one constraint at a time, and you bring in a tool when it relieves the constraint in front of you. Agents make writing code cheap, and the rest of the line, built for people who type, becomes the bottleneck: first CI and shared test environments, then one person's attention, then trust. Each fix moves the constraint somewhere else.

- [The manifesto](/manifesto/) makes the argument.
- [The Playbook](/playbook/) has the plays that hold up in practice.
- [Lights Out](/lights-out/) is a simulator where you can try it on a ten-engineer team, or on your own numbers.
- [Stories](/stories/) are accounts from teams that have done it.

## What changes for engineers?

Less typing and less reading of diffs. More specifying, more deciding, and more work on the line itself: environments that agents can use, tests that prove a change works, and guardrails that make autonomy safe to allow.
