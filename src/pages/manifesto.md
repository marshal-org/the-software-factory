---
layout: ../layouts/Base.astro
title: Manifesto
description: "You do not install a software factory. You tune one. Seven beliefs about delivering software with AI coding agents, and six things we refuse."
---

You do not install a software factory. You tune one.

## Four minutes of work, six days of waiting

Picture one ticket. An agent writes the change in four minutes. Then the change waits forty minutes for CI, a day for a free slot on staging, two days for someone to review it, and until Thursday for the release.

The agent was never the slow part. The line around it was built for people who type, and it still runs at their speed.

## We have seen this before

Anyone who has tuned a slow application knows how this goes. You find the query at the top of every chart and you fix it. For about an hour you are a hero. Then the code that used to wait on that query arrives, all at once, at the next limit: a lock, a connection pool, memory. The application now allocates so fast that it runs out of memory, in a system that never had a memory problem.

Nothing was wrong with the fix. The constraint moved. A delivery line behaves exactly the same way, and most of what follows is that one lesson applied to software teams.

## What we believe

**1. Code got cheap. Delivery did not.** Writing the change is now the smallest part of shipping it. Every hour saved there turns into an hour of waiting somewhere else, until you go and find where.

**2. This is a tuning job, and it has no end date.** Run the line, find the pile, clear it, look again. Some steps change everything and some barely register. You find out which by doing them.

**3. The line you have is the line you tune.** Existing organisations do not get to start over. The stations stay. What changes is who stands at each one, and how long work waits there.

**4. Money spent away from the constraint buys a feeling.** A better tool at a station that is not holding the line changes nothing you can measure today. It does feel like progress, which is how budgets get spent.

**5. The constraint travels: from machines, to people, to the organisation.** First it is laptops and CI minutes. Then it is one person's attention, spread over eight terminals. Then it is trust: a security lead who will not allow autonomy, a team that will not merge what it has not read. Each of the three needs a different kind of fix.

**6. Trust is engineered, never requested.** People step out of the loop when there is evidence that it is safe to: isolation, an audit trail, tests that grow with every bug, reviewers that disagree with each other. Asking nicely has never worked.

**7. Lights out means nobody is standing in the line.** People are still there. They are at the edges, deciding what is worth building and judging the exceptions. That turns out to be the hard part, and it is the last constraint you will meet.

## What we refuse

- Transformations with an end date.
- Dashboards that count tokens, lines of code or AI-assisted commits.
- Agents for everyone, bought before anyone knows where work is waiting.
- Reading every pull request forever and calling it quality.
- Autonomy that is granted quietly, unevenly, and with a developer's full credentials.
- Any single product sold as a software factory. The factory is your delivery line. Tools are parts of it.
- A vendor's answer to a process question. That includes the people who started this site.

## How to use this site

Play [Lights Out](/lights-out/) until the next pile stops surprising you. Argue with [the Playbook](/playbook/). Find yourself on the [journey](/journey/). Then tell us what broke at your place, in [stories](/stories/).

Every page here is open for argument. Each one is a file in a public repository, so if something is wrong, change it.
