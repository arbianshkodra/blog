---
title: "Your read-replica fallback only catches absence"
description: "A fallback wired to exceptions handles a replica that is gone. It is structurally blind to one that is merely behind, and that is the failure that returns a 200 with the wrong number."
date: "2026-08-02"
tags:
  - postgres
  - distributed-systems
  - reliability
---

Nothing failed. The replica was up the whole time, connections opened fine,
the query returned in four milliseconds. The number it returned was just old.

That is the shape of the bug I want to talk about, because almost every
read-replica fallback I have written or read handles the other shape: the
replica is gone. Those two failures look nothing alike in code, and only one
of them throws.

## What a fallback actually catches

The standard decorator wraps a replica connection factory, catches whatever
comes out, and serves the read from the primary instead. Go and read yours.
The catch block is handling a connection error, a timeout, or an open circuit
breaker.

Three names for one condition: the replica is not there.

That is a real condition and worth handling. It is also the easy half. It
announces itself, it throws, and an exception-shaped guard catches it by
construction. A replica that is up and thirty seconds behind throws nothing.
There is no exception, so there is nothing for exception-shaped code to catch,
and every read sails through with data from thirty seconds ago and a 200 on
top.

You can have a fallback with full test coverage, a metric, a log line, and an
alert, and still be completely blind to the failure that actually corrupts an
answer.

## The tolerance decision is already being made, in the wrong place

Here is the part that convinced me this was worth writing.

I went looking through a codebase for how routed reads were chosen, expecting
to find nothing. Instead I found a repository whose constructor took its read
connection factory under a parameter name that said, in plain English, these
reads tolerate lag. Individual query methods picked between that and the
primary one at a time. One of them carried a comment explaining that a
slightly stale count was harmless there, sitting a few lines above a sibling
method deliberately kept on the primary because a stale read of that value
could double-charge someone.

So the tolerance decision existed. It was correct. It was encoded in a
variable name and a code comment, inside a data-access class, made by whoever
last touched that method.

That is the actual bug, and it is a layering bug. Whether a read can tolerate
stale data is not a property of the query. It is a property of what the caller
is about to do with the answer. The same count is fine on a dashboard and
dangerous in a billing decision. A repository cannot know which one it is
serving, so it guesses, and the guess is invisible until someone re-uses that
method from a new call site.

## Declare it where the caller is

The version I would write pushes the declaration up to the entry point and
leaves the data layer ignorant of business criticality.

The endpoint says what it needs. Stale-tolerant or stale-sensitive, one
declaration, sitting in the same file as the thing that knows the answer. That
resolves into an explicit read policy that gets passed down. Not an ambient
context read out of a thread-local somewhere three layers deep, because action
at a distance is how you get a policy that is impossible to test and
impossible to reason about at the call site.

Then the routing has three branches instead of two:

- Replica healthy and inside the freshness budget: read from the replica.
- Replica unavailable or too far behind, caller declared tolerant: read from
  the primary, emit a metric, and mark the response so the consumer knows it
  was served degraded.
- Replica unavailable or too far behind, caller declared sensitive: fail with
  a 503.

The freshness budget is configuration, not a constant. Five seconds is a
reasonable example and a terrible universal default.

Two things I would get wrong if I were not deliberate about them. First,
message consumers and scheduled jobs call the same code and have no endpoint
to carry an attribute, so they need an explicit declared default, and the safe
default is sensitive, not tolerant. Second, the degraded indicator has to be
in the response payload, not only in a log line. A consumer that cannot tell
it got a degraded answer cannot make a different decision, which was the whole
point.

## Measuring lag is where this gets subtle

The obvious implementation is to ask the standby how far behind it is by
comparing the current time to the timestamp of the last transaction it
replayed. Postgres exposes exactly that, and it is a trap.

That function returns the commit timestamp of the last transaction replayed
during recovery. If the primary has taken no writes for ten minutes, the
standby has nothing to replay, the timestamp sits still, and your freshness
check reports ten minutes of lag on a perfectly healthy pair. You will 503
your own traffic at four in the morning because the system was idle. The
symptom looks exactly like the emergency it is not.

The measurement that does not have that failure mode is byte distance in the
write-ahead log: the primary's current WAL position against the position the
standby has received. The Postgres docs name this pair directly as the health
indicator for streaming replication. On an idle system both numbers sit at the
same place and the distance is zero, which is the truth.

The other thing to get right is where the check runs. Not per request. Adding
a round trip to the database to every read in order to find out whether the
read is safe is a tax on the healthy path to protect against the rare one.
Sample it in the background on an interval, cache the verdict, let reads
consult the cached verdict. Then decide what a stale verdict means, because
now you have a freshness problem about your freshness data, and the honest
answer is that an expired verdict counts as unhealthy.

## The case against, which you should know before someone tells you

For read-after-write specifically, this design is not the best available tool.
If a customer creates something and immediately reads it back, a 503 is a poor
experience for a system that could have been correct. The stronger answer is
causal consistency: carry the position of the write forward and wait for the
replica to reach it before serving that read. Postgres supports a synchronous
mode where the primary waits until standbys have replayed the commit, and the
documentation calls out load balancing with causal consistency as the
motivation.

That costs you write latency on every commit, so it is a different trade, not
a free upgrade. Declared policy is the right shape when the requirement is
this read must not be stale, ever, regardless of who wrote last. Causal
consistency is the right shape when the requirement is this reader must see
their own write. Knowing which problem you have is most of the work.

## The line I keep coming back to

Graceful degradation does not mean always succeed. A 503 on a read that was
declared stale-sensitive is a correct answer. It is a system telling the truth
about what it can currently guarantee.

A confidently wrong number is not degradation. It is a lie with a 200 status
code, and the fallback that produced it will look completely healthy in every
dashboard you own.
