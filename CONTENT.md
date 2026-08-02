# Content backlog

Post ideas for arbianshkodra.com, ranked by defensibility (how hard they'd
be for someone else to write). The strongest sit at the intersection of
messaging-at-scale, hands-on agent/LLM experimentation, and shipping my own
infra tooling.

Discipline reminder (see CLAUDE.md): one spine per post, verify every claim,
bias to cut, no em/en-dashes, first person from real experience. Frame
work lessons in the abstract as reusable principles; keep internals out.

## Tier 1 — highest leverage, write first

- **What high-throughput messaging teaches you about backpressure.**
  Where queues save you, where they lie to you, why "just add Kafka" isn't an
  answer. Principles, not internals. Most defensible post.
- **Propagating trace context across Kafka is the hard part nobody warns you
  about.** OpenTelemetry across a producer/consumer boundary; why HTTP
  propagation intuition breaks at the async hop; header injection patterns.
- **I gave an LLM my deploy tool and watched what it got wrong.** Agent
  experimentation meets accelero: what an agent does well vs. dangerously
  with a GitOps tool, where you'd never let it near prod.
- **Why I built accelero instead of using ArgoCD.** GitOps-for-Compose thesis:
  when k8s is overkill, who's stuck on Compose, what the real gap is. Natural
  companion to the reverse-proxy post.

## Tier 2 — strong, in the wheelhouse

- **Causal consistency vs. declared read policy.** The fallback post names
  causal consistency as the better tool for read-after-write and then moves
  on. This one is the other half: carrying a write position forward, what
  `synchronous_commit = remote_apply` actually costs, and why "read your own
  write" is a different requirement from "this read must never be stale."
  Only write it with a real implementation behind it.

- **Stable addresses everywhere: the pattern I keep rediscovering.** The
  reverse-proxy post already names the principle in its closing paragraph, so
  this one is NOT a rerun of it. Spine: the same indirection shows up in three
  places that look unrelated until you line them up (deploy handoff, service
  discovery, agent tool routing), and the interesting part is where the
  analogy breaks. Only write this with at least two non-deploy examples I
  have actually built; otherwise it's a restatement and should be cut.
- **RED dashboards from traces, not logs.** "Traces over logs" as a concrete
  how-to: deriving rate/errors/duration from spans.
- **Provider abstraction layers: the interface you regret.** Messaging
  integration in the abstract; why SMS / WhatsApp / SMPP have irreconcilable
  models and the leaky-abstraction tax.
- **Running a local classifier on a single GPU.** Small-model-for-
  classification vs. a big API: latency, cost, and control tradeoffs.

## Tier 3 — lighter, good for cadence

- **Single-binary Go tools and why I keep reaching for them.** Craft post,
  ties to accelero.
- **The agent experiments that didn't work.** Honest failures from LLM
  tinkering. High trust, low effort, very shareable.
