---
title: The bug
date: 2023-03-22 15:30:00
tags: post
layout: post
---

It was a timezone issue. It's almost always a timezone issue.

The bug had been in production for four months before anyone noticed. A specific sequence of events, on the last day of certain months, in certain time zones, would cause a calculation to be off by exactly one day. We found it because a user in Auckland emailed to say something seemed wrong, politely, with a screenshot.

I found the line. It was eleven characters. The fix was three characters. I sat looking at it for a long time.

The best bugs are the ones where you see exactly why you made the mistake. A reasonable assumption that happened to be wrong. A shortcut that worked in 99.9% of cases and failed in the rest. You can trace the reasoning that produced it, even understand why you made it. Those bugs teach you something.

This was one of those. I had assumed, without verifying, that a certain library handled DST transitions consistently. It didn't. Not consistently, not across all the edge cases, not in Auckland on the last day of the month.

I wrote a test. Fixed the bug. Deployed. Emailed the user in Auckland to thank her. She replied saying no worries, she used the product every day and loved it. That felt like more than I deserved, honestly.
