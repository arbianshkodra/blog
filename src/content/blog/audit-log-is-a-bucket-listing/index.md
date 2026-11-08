---
title: "Your audit log is a bucket listing"
description: "An event log in object storage is a perfect write path with no read path. The questions arrive later, and every one of them is a query."
date: "2026-11-07"
draft: true
tags:
  - postgres
  - data-modeling
  - reliability
---

The first bucket was easy to kill. One JSON object per message status change,
and every fact in it already sat in two tables with better types. Redundant.
The log could go, and it went.

So I pointed the same audit at the two remaining buckets, customer activity
and template activity, and sat down to write the same sentence. I never got
to. Most of what those buckets held existed nowhere else. And one of the
things they held was not a log at all. It was a feature.

That is the outcome you get by default, and it is the worse of the two.

## What was only in the bucket

Consent changes. The database kept one boolean per contact, the current value.
Who flipped it, from what, through which channel, and when: object storage
only.

Suspensions. Who suspended the customer, the reason, the free-text detail. The
database kept a boolean. Object storage only.

Template edits. A diff of which fields changed from what to what. Rejected
mutations, with the reason. Submission errors from the channel provider. Object
storage only.

One table should have caught some of this, a lifecycle journal. I checked it.
Zero rows. It was wired correctly, written in the same statement as the
transition it records. Nothing had ever transitioned.

Then the part that made me write this.

Customer notes are the free text an admin types about a customer. Not an
event, not a status change: content, authored by a person, that other people
read back. I went looking for the notes table. There wasn't one. Each note was
one JSON object in the activity bucket, sitting between a consent flip and a
suspension.

There had been a table. A migration created it. Two days later, another
migration dropped it and moved notes into the activity log. A feature was in
hand, a log was nearby, and the log was easier.

## How a note lives in a bucket

Look at what that does to the three operations a note needs.

Create returned 202 with an echo of the input, before anything was stored. It
published an event, a consumer picked it up, and the consumer wrote the
object. The admin UI refetched the list straight after the 202, which raced
the consumer, so the note you had just written was sometimes missing from the
list you got back. I have [written about that status
code before](/blog/202-is-a-promise). This was it, inside my own system.

List was a prefix listing of every activity object under the customer,
filtered by filename, then one GET per object.

Delete downloaded and deserialized every object under the customer, in order,
until one matched the id.

Then the author. The API returned the author's email, the UI read the author's
name, and nothing mapped one to the other. Every note in the console, every
author: Unknown. Not one ticket. Nobody reported it, because nobody queries a
bucket. You see a bucket one object at a time, and one object at a time
everything looks fine.

## A bucket has one index

The keys were built as type, then timestamp, then a hash of the body. The
reader listed the prefix, reversed it, cut a page out, downloaded the page,
and only then sorted what it had downloaded by time. Here is one customer's
prefix in the only order object storage knows (keys invented, shape
simplified):

```text
consent/20261106T174410-b71e0a44.json
note/20260912T110233-0c5d9e17.json
suspension/20260611T080015-e2a4f6b9.json
suspension/20260702T142948-91d3c07a.json
```

Reverse that and take a page of two. Page one of the admin's "raw log" is two
suspensions from the summer. Yesterday's consent change is on the last page.
Page one was always the alphabetically last activity type, newest first, and
nobody had reported that either.

That is the whole problem in one quirk. Object storage gives you exactly one
index, the key, and exactly one query: keys with this prefix, in key order.
Order by time within a type is free. Order by time across types is a scan.
Filter by actor, count, between these two dates: each one is a scan with a
round trip per object and a predicate you apply after the download.

In a table, the page order is a side effect of existing:

```sql
select activity_type, occurred_at, payload
from entity_activities
where entity_id = $1
order by occurred_at desc
limit 20;
```

## Why it went there, honestly

The write path was genuinely good, and that is why it was chosen. Append-only,
immutable objects, no schema to migrate when a new activity type appeared. The
object name carried a hash of the body, the write asserted the object did not
exist yet, and a precondition failure counted as success, so a replay from the
dead-letter queue wrote nothing twice and could not loop. Cheap per byte, and
a lifecycle rule deleted everything after a year, so nobody had to think about
retention.

Every one of those is a write-time property. The design was made by whoever
had the event in hand and needed somewhere to put it, and at write time there
is no read path. There is only the day someone asks.

That day comes, and the questions it brings are all queries. Every consent
change for this contact in this window: that is a regulator, and they have a
deadline. Who suspended this account and what did they write: that is a
support escalation, and the customer is on the line. What changed on this
template before it was rejected: that is a debugging session at the wrong
hour. Against a bucket, each one is a scan somebody writes by hand in a
terminal, once, under time pressure, and hopes they got right.

## The costs that were not queries

Three things fell out of the audit that have nothing to do with reads, and I
think they are the stronger argument.

The log took down the thing it was logging. One review path wrote its activity
object inline on the request, skipping the broker, and the code carried a
comment recording what that had cost: a storage failure propagated up and took
the rest of the review's work down with it. A log that can fail the thing it
logs is not a log. It is a dependency with a modest name.

The purge has to remember it. A delete that walks the tables never reaches a
bucket, so unless someone remembers the bucket, it keeps everything the purge
was meant to remove, in the one store holding the facts that exist nowhere
else. A foreign key with a cascade handles that without anyone having to
remember anything.

The lifecycle rule pointed at the wrong data. Deleting after a year is a
reasonable default for a log. It is a bad default for consent history, which
is the record you want to keep longest, because it is the one you get asked to
produce. And the bucket was shared with uploaded sender assets, so the same
rule was going to start deleting those too. It had a date. Nobody had picked
it. The rule had.

## What it looks like as a table

One table, not one per entity. Customer and template activity have the same
shape (a type, a time, an opaque body), the same single read, and the same
write, append if absent.

```sql
create table entity_activities (
    id            uuid        primary key default gen_random_uuid(),
    entity_type   text        not null,  -- 'customer' | 'template'
    entity_id     uuid        not null,
    customer_id   uuid        not null references customers(id) on delete cascade,
    activity_type text        not null,
    occurred_at   timestamptz not null,
    payload       jsonb       not null,  -- the object body, byte for byte
    content_hash  bytea       not null,  -- sha256 over the serialized body
    unique (entity_id, content_hash)
);

create index on entity_activities (entity_id, occurred_at desc);
```

The payload is the object body unchanged, so the endpoints deserialize it
through the same types they used on the downloaded object, and the response
contract did not move. The unique key on the hash plus `on conflict do
nothing` is the replay idempotency the precondition write gave us, in one
statement. The cascade is the purge fix. Notes got their own small table with
a soft delete, create returns 201 with the stored row, and the author's name
is resolved on read. Every Unknown in the console became a name, and the
console did not change.

The write happens at the chokepoint, synchronously:

```text
before:  request -> publish -> 202 ... consumer -> PUT object
after:   request -> insert  -> 201
```

A one-millisecond insert replaced a publish plus a PUT that took a couple of
hundred. The topic existed to hide that PUT from the request path. The insert
does not need hiding. It is the write, not a side effect of the write, and it
lands in the same database the state change hit one statement earlier, so its
failure mode is "the change did not happen either".

Scale is not the conversation. Years of this history is a rounding error next
to the tables it sits beside. The backfill read every object in both buckets
in minutes, and running it again inserts nothing, because the hash of the
bytes is the hash the writer used.

## The line I keep coming back to

An event log in a bucket is write-only until the day you need to read it, and
that day is a compliance request, a support escalation, or a deletion you
cannot prove.

The write path was excellent. Nobody designed a read path, because at write
time there is no read path. Put the records where the questions can reach
them, and let the bucket hold the things that are actually files.
