---
title: "202 Accepted is a promise, not a receipt"
description: "Accepting a request you never validated moves the failure off your caller and onto your customer, hours later, on a channel nobody is watching."
date: "2026-08-21"
tags:
  - apis
  - distributed-systems
  - messaging
---

We accepted the message. The API returned `202`, the caller got an id back,
and every dashboard downstream stayed green. The message was invalid the whole
time and was never going to be delivered.

Nothing threw. The request looked fine to the layer that answered it, because
the rule that would have rejected it lived further down, and by the time that
rule ran we had already told the caller yes.

## 202 is not "ok", it is "mine now"

In a synchronous API, `200` means the work is done. `202` means something
different in kind: I have taken this from you and I will try. One status code
apart, and the responsibility flips completely. Once you return `202` you own
the outcome, and you own telling somebody what it turned out to be.

That is the trade you make for the throughput a queue buys you, and it is
usually worth making. But it prices in one assumption that is easy to skip:
everything you can check, you check before you answer. Anything you do not
check at the edge, you have just promised to attempt anyway.

## The gap is layering, not laziness

Nobody skips validation deliberately. You get here by spreading it out.

Some rules ride on the request type as attributes, because they are cheap and
the schema generator picks them up. Some live in the handler, because they need
a lookup. Some live all the way down in the consumer, because that is where the
provider call happens and that is the only code that knows the provider's
rules. Every layer is written by someone reasonably assuming the layer above
did its job.

The result is that the one place which could still reject cleanly, before the
`202`, is the place with the least context.

The fix I keep coming back to is unglamorous: stop re-checking the value and
make the bad value impossible to hold. Alexis King's
[parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
is the canonical statement of it, and there is a good
[.NET-flavoured writeup](https://www.kalandra.tech/blog/zero-code-validations-in-your-dotnet-api)
of what it looks like in practice. A string that just passed an email check is
still a string, so the next method down has to check again. Parse it once at
the boundary into a type that cannot represent the invalid state and the proof
travels with the value instead of being thrown away at every hop.

That does not make an async API correct on its own. It removes the specific
excuse that the edge could not have known.

## Two kinds of rule

The useful split is by what is knowable at accept time.

Knowable: shape, encoding, a destination that is not a valid number, a template
that does not exist, a channel the account never enabled, a tenant with no
credit. None of that needs a queue to discover. Every one of these you let
through becomes a support ticket that a `400` would have answered in
milliseconds, for free, in the integrator's own terminal.

Not knowable: whether the carrier accepts it, whether the recipient opted out a
second after you accepted, whether the provider is rate limiting you right now.
These honestly belong on the async side and no amount of edge validation will
pull them forward.

The line between the two moves over time, and it should only move in one
direction. Every rule that migrates from async failure to edge rejection is a
category of customer confusion that stops existing.

## The signal is failures, not volume

Throughput told us nothing. Throughput was excellent. We were accepting
everything, enthusiastically, including the things that could not work.

The only honest signal on the async side is the failure rate carrying its
reason, split by tenant. Absolute volume is useless here, because a tenant with
a newly broken integration and a tenant having a great month look identical
from the outside. Grouped by reason, the shape is obvious: a reason code that
used to be background noise becomes most of your failures overnight, and it is
always concentrated in one or two accounts.

So alert on the mix, not the count. A change in the distribution of failure
reasons is the earliest thing you can see, and it fires before anybody writes
in.

## Fail fast, and pay for it

I would rather return a `400` that irritates an integrator on their first
afternoon than a `202` that lies to them for a week.

Failing fast is easy to say and it does cost something. You have to do the
lookups before you answer, so accept gets slower. You have to keep the edge's
model of the rules in step with the sender's, or you invent a second, subtly
different rulebook and reject things that would have worked.

Both are worth paying, because both are bounded and measurable. A `202` you
cannot honour is neither. It converts into somebody's afternoon, days later,
and they almost always find out after the customer does.

The queue tells you where the work is waiting. It never tells you whether the
work can be done. That part is yours, and the last honest moment to answer it
is before you say yes.
