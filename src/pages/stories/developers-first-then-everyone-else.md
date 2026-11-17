---
layout: ../../layouts/Base.astro
title: "We sped up the developers. Then everyone else started screaming."
description: "How an R&D organisation adopted AI coding agents, and how the bottleneck moved from developers to code review, QA, CI and product."
summary: "One R&D organisation, six constraints in a row: developers, code review, quality, QA, DevOps, and then product."
author: "Ofir Makmal"
date: "2026-11-17"
draft: false
---

I ran R&D at a company where we set out to get much more from our engineers with AI. This is the order in which things broke. I am leaving the company unnamed, and the order is the point.

## 1. Developers

We started where everyone starts, with the developers. First better tooling, so that agents could take on whole tasks. That meant more than installing an agent:

- leaving the IDE behind and moving to the terminal
- shared skills, which got deeper and more sophisticated as we went
- the MCPs the agents needed to reach our systems
- context for each repository, and for the organisation as a whole
- a map of how the components relate to each other

Then parallelisation, so that one engineer could have several agents working at once. That is where the laptop ran out, so we put an agent dev platform in place: agents off the laptops, each with an environment of its own.

It worked. The developers were producing far more than before.

## 2. Code review

The first thing to give was review. More and more of each developer's day went into reviewing pull requests, and they found it very hard to let go of reading everything.

We started adding AI code reviewers. That helped a lot, and it was not enough.

## 3. What reached QA

Next came friction with QA. What left the developers' hands was not good enough when it got to them.

So we added testing automation of a different kind. It was exploratory, and it did not lean on the unit tests and system tests we already had. For every new feature, the AI deployed a full cluster, went through the feature with end-to-end UI testing, and ran a full sanity pass.

It was probably overkill. But we were looking for trust. We wanted to trust the platform and we wanted to trust the process, so we paid a bit more at first.

Quality went up, measured by what came out of the developers' hands.

## 4. QA itself

It was still not enough for QA. They still had to do the hard, deep testing: customer scenarios and special use cases. Too much of their work was manual, and now far more was arriving. They were screaming, they needed help, and that is where we went next.

We threw away all of the old automation code and rebuilt the end-to-end testing framework from the ground up. We did not port the old tests. We rebuilt from the specification and from a fresh discovery of the product, which had drifted a long way since the last time anyone had done this.

## 5. DevOps

Once QA could breathe, it was DevOps who needed help. CI was not holding up. A handful of self-hosted servers had carried all of our CI for years, and they could not keep pace with what the agents were pushing through them.

We built a new, elastic CI infrastructure on GitHub's Actions Runner Controller and spot instances. Runners now appear when the queue grows and disappear when it drains, so CI capacity stopped being a number we had to plan.

## 6. Product

When we cracked CI, we found ourselves back at the start of the line, with product. The factory could build faster than we could decide what it should build.

And so on. It has not stopped.

## What I took from it

- We never chose the next constraint. It announced itself, loudly, usually through the team standing right behind the one we had just helped.
- Every fix was real, and every fix moved the problem one station down the line.
- Paying extra for trust early was worth it. A full cluster and a full sanity pass for every feature was more than we needed, and it is what let people let go.
- If I did it again, I would walk the whole line before starting and tell each team in advance: you are next.

This is the experience that [Lights Out](/lights-out/) is built on, and the reason for two plays in [the Playbook](/playbook/): [find the constraint](/playbook/find-the-constraint/) and [one owner for the whole line](/playbook/one-owner-for-the-whole-line/).
