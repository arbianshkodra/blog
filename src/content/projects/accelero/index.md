---
title: "accelero"
description: "GitOps-powered zero-downtime Docker Compose deployments. ArgoCD/Flux, but for Compose."
date: "2024-07-16"
demoURL: "https://accelero.sh"
repoURL: "https://github.com/arbianshkodra/accelero"
---

A lightweight, single-binary tool that brings GitOps to Docker Compose. Git is
the source of truth: drift is detected and corrected, and deployments happen
automatically with zero downtime via rolling replica updates behind a reverse
proxy.

Written in Go. Apache-2.0. Multi-stack management over a REST API, `.env`
interpolation, dependency resolution, automatic rollback, and SQLite
persistence — no external dependencies beyond Docker.
