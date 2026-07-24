---
title: "Why zero-downtime deployments need a reverse proxy"
description: "The one architectural constraint people miss when building GitOps for Docker Compose — and why I couldn't design it away."
date: "2026-07-24"
tags:
  - gitops
  - docker
  - distributed-systems
---

I've been building [accelero](https://accelero.sh) in the open for a while
now — think ArgoCD/Flux, but for Docker Compose instead of Kubernetes. Git is
the source of truth, drift gets detected and corrected, deployments happen
automatically. The hard part wasn't the reconciliation loop. It was the two
words in the tagline: *zero downtime*.

Here's the thing nobody tells you when you set out to do rolling deploys on
plain Docker: you cannot do it without something sitting in front of your
containers. I fought this for a while, because adding a required dependency
felt like a design failure. It isn't. It's physics.

## The naive version, and why it fails

The obvious approach: pull the new image, stop the old container, start the
new one. Between `stop` and `healthy`, every request hits a closed port.
That's your downtime window — usually a few seconds, but a few seconds at
scale is a lot of failed requests.

So you flip it: start the new container *first*, then stop the old one. Better,
except now both are running and something has to decide which one traffic
goes to. A container by itself has no notion of "drain the old one, shift
to the new one." Docker's port binding is not a load balancer. The moment
two containers want the same published port, one of them loses.

## The proxy is the drain valve

The only place that decision can live is a layer that both containers register
with and that can shift traffic atomically: a reverse proxy. Caddy, Traefik,
nginx — pick your flavor. accelero brings up the new replica, waits for its
healthcheck to pass, tells the proxy to route to it, *then* tears down the old
one. The proxy holds the connection state so no in-flight request gets dropped.

That's the whole trick. Zero-downtime isn't a property of the deployment tool.
It's a property of having a stable address in front of an unstable set of
backends. The tool just orchestrates the handoff.

## Why I stopped trying to hide it

I spent real time trying to make the proxy optional — some mode where accelero
could do "good enough" rolling updates on bare Docker. Every version of that
leaked downtime somewhere: a dropped connection during the swap, a race on the
port bind, a healthcheck that passed before the app was actually ready.

Eventually I made the proxy a documented, first-class requirement instead of an
apologetic footnote. Better to be honest about the constraint than to ship a
"zero-downtime" tool that quietly isn't. The [samples](https://github.com/arbianshkodra/accelero)
ship with a working end-to-end example and a scripted proof, because a claim
like this should be something you can run, not something you take on faith.

Boring lesson, but a real one: sometimes the right move is to stop
engineering around a constraint and just name it.
