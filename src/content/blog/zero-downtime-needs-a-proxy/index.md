---
title: "Why zero-downtime deployments need a reverse proxy"
description: "The one architectural constraint people miss when building GitOps for Docker Compose, and why I couldn't design it away."
date: "2026-07-24"
tags:
  - gitops
  - docker
  - distributed-systems
---

I've been building [accelero](https://accelero.sh) in the open for a while
now. Think ArgoCD/Flux, but for Docker Compose instead of Kubernetes. Git is
the source of truth, drift gets detected and corrected, deployments happen
automatically. The hard part wasn't the reconciliation loop. It was the two
words in the tagline: *zero downtime*.

Here's what nobody tells you when you set out to do rolling deploys on plain
Docker: you cannot do it with one container holding a published port. Not with
a smarter restart order, not with a better healthcheck. I fought this for a
while, because making a proxy mandatory felt like a design failure. It isn't.
It's a constraint of how the Docker daemon binds host ports.

## The naive version, and the two ways it fails

The obvious approach: pull the new image, stop the old container, start the new
one. Between `stop` and `healthy`, every request hits a closed port. That's your
downtime window, usually a few seconds, and a few seconds at scale is a lot of
failed requests.

So you flip it: start the new container *first*, then stop the old one. Now you
get a different failure. Both containers want to publish the same host port, and
Docker rejects the second bind. The deploy doesn't degrade, it fails outright.

Those two modes are the whole problem. Publish a host port directly and you pick
one: a measurable outage during the swap, or a conflict that stops the deploy.
There's no third option at the Docker level. It has to be solved by traffic
indirection.

## Two things, not one

The fix takes two pieces together, and the mistake I see is adopting only the
first.

**Something in front holds the host port.** A reverse proxy: Caddy, Traefik,
nginx, pick your flavor. It binds the public port and never rolls. Backends
declare `expose:` instead and stay inside the Docker network, where nothing
competes for a host port.

**The backend runs more than one replica.** A proxy in front of a single
container buys you nothing. Stop that container and the proxy has nowhere to
send traffic. accelero rolls replicas one at a time: create a new one, wait for
its healthcheck, remove one old one, repeat. With three replicas, at least two
are serving at every point in the rollout.

The interesting part is what doesn't happen. accelero never talks to the proxy.
The sample Caddyfile runs with `admin off`, so there's no API to call even if I
wanted to. Caddy resolves the backend through Docker's embedded DNS and
re-resolves per connection, so as replicas come and go it lands on whichever
ones answer. No registration step, no config reload, no coupling between the
deploy tool and the proxy. That wasn't the design I set out to write. It's what
was left after I deleted every part that needed coordination.

Which also means nothing is draining connections for you. A request in flight to
a container that's about to be removed is still at risk. What protects you is
that the other replicas stay up, so new connections land somewhere healthy.

## The proof

A claim like this should be something you can run, not something you take on
faith. The [samples in the repo](https://github.com/arbianshkodra/accelero/tree/HEAD/samples)
ship an nginx-behind-Caddy stack with three replicas, plus a script that sends
real traffic while you bump the image tag.

From a local run: 5580 requests over a 45 second window, every one a 200, while
rolling three nginx replicas onto a new tag. The rollout itself took about 19
seconds of that window.

## Why I stopped trying to hide it

I spent real time trying to make the proxy optional, some mode where accelero
could do "good enough" rolling updates on a single published port. Every version
of that leaked somewhere: a gap during the swap, a race on the port bind, a
healthcheck that passed before the app was actually ready.

Eventually I made the proxy and the replicas a documented, first-class
requirement instead of an apologetic footnote. Better to name the constraint than
to ship a "zero-downtime" tool that quietly isn't.

Zero-downtime isn't a property of the deployment tool. It's a property of having
a stable address in front of a set of backends where losing any one of them
doesn't matter. The tool just orchestrates the handoff.

Boring lesson, but a real one: sometimes the right move is to stop engineering
around a constraint and just name it.
