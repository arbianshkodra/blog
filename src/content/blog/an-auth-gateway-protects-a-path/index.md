---
title: "An auth gateway protects a path, not a service"
description: "The identity proxy was configured correctly and reported healthy. It also was not standing in front of the door that mattered."
date: "2026-09-19"
draft: false
tags:
  - security
  - infrastructure
  - networking
---

Nothing happened. No alert, no failed login, no strange line in any log. The
identity-aware proxy in front of our internal admin console was configured
correctly and reported healthy, and every request that reached it was
authenticated.

That sentence is fine right up to its last four words. Every request that
reached it. A request did not have to reach it.

This was a good while ago. The hole has been shut for a long time and the
estate it happened on has been rebuilt more than once since, so there is
nothing left to point at. I am writing it down now because the shape of the
mistake keeps turning up in other people's diagrams, and because the way we
found it is a thing anyone can do in a minute.

## The gate belongs to the road, not the building

An identity-aware proxy attaches to a load balancer. It inspects what arrives
through that load balancer and decides who gets forwarded. Traffic that
arrives some other way is not rejected by it. It is not seen by it, which is a
different thing and looks identical from the proxy's side: healthy, quiet, all
green.

So "is this service behind auth" is not a question with an answer. The
question with an answer is: for every path that terminates at this service,
what rejects an anonymous request on that path? Those two questions collapse
into one only when a service has exactly one way in, and an internal service
almost never does.

Ours had two.

## The second door was older than the thing behind it

A cloud firewall rule admitted the Kubernetes cluster's pod and node ranges to
the VM host, on the same TCP port the reverse-proxy router was listening on.
Roughly:

```hcl
resource "firewall_rule" "cluster_to_host" {
  direction     = "INGRESS"
  source_ranges = [var.pod_cidr, var.node_cidr]  # the whole cluster
  target_tags   = ["shared-host"]
  allow { protocol = "tcp"; ports = ["8443"] }   # also the router's port
}
```

That rule was not a mistake. Workloads in the cluster genuinely needed to
reach other services on that host, and the rule predated the admin console
being put behind that router by a long way.

Nobody changed the firewall. Nobody weakened the gate. Somebody added a second
service to a router that was already listening on a port an existing rule
already opened, and the set of things reachable through an existing opening
grew by one. That is the entire causal chain, and every link in it is a normal
Tuesday.

## The command

I did not believe it. The proxy was right there in the console, healthy, with
an access log full of authenticated users. So I did the cheap thing: opened a
shell in an ordinary pod, one with no credentials of its own and no business
anywhere near that host, and sent one request by hostname.

```bash
# from a throwaway pod, no credentials, no service account binding
curl -sk https://shared-host:8443/api/db/query \
  -H 'Host: admin-console.internal' \
  -d '{"sql":"select current_user"}'
```

I expected a connection refused. Failing that, a redirect to a login page.

```
{"rows":[{"current_user":"admin"}]}
```

That is the moment the abstraction stopped being an abstraction. Not a
finding in a report, not a theoretical path on a diagram: a container that had
no reason to exist near this system, asking the database who it was, and being
told it was the superuser.

## Severity is set by what the reachable thing holds

An open path to a static dashboard is embarrassing. An open path to an admin
console is a different category, because of what an admin console is: a client
that already holds privileged credentials to something else.

This one embeds a database query interface, and the component behind that
interface connects with administrative rights. So the exposure was not a UI.
It was arbitrary SQL against that database, available to anything running in
the cluster. A compromise of any unrelated workload, some forgotten cron job,
some dependency in a sidecar, was now a compromise of that database.

Internal tooling is the worst case for this, because tools hold credentials by
definition. That is what makes them tools.

## The constraint was already written down

Here is the part I still think about, years later. The exact rule was in our
own repo, in the same config file, correct, in a comment.

A different service on that host had been deliberately kept off the router and
put on a port the firewall did not admit. The comment explained why: the
firewall admits the cluster to that port, so any pod can set the Host header
and reach a router directly, never touching the load balancer.

That comment describes the environment. It was filed as a note about one
service. The admin console sat three lines above it in the same file, subject
to the identical fact, and nobody joined the two. I have read that file many
times.

The general rule, once: if the reason for a configuration choice is a fact
about the environment rather than a fact about the component, a comment next
to the component is the wrong home for it. It belongs where the environment is
described, as an invariant, with something that fails when a component
violates it. Documentation written as a local exception does not generalize
itself. People read it as an exception, because that is where it is filed.

## Close the door, do not post a guard

The reflex fix is to put authentication on the router too, so both doors are
checked. We did not, and I would argue against it again.

The second path was not missing authentication. The second path had no
business existing, for a service whose only legitimate traffic comes from one
place. So the fix was a source restriction on the router: accept requests for
this service from the load balancer's proxy-only subnet, which is to say from
requests that already passed the identity check, and drop everything else
before it reaches the application.

```yaml
# router middleware for this service only
ipAllowList:
  sourceRange:
    - 10.132.0.0/23    # load balancer proxy-only subnet (post-identity-check)
    - 35.191.0.0/16    # provider health check range
    - 130.211.0.0/22   # provider health check range
```

Leave those health check ranges out and you will find out quickly: the
backend goes unhealthy, the load balancer stops sending real traffic, and your
users get a 502 instead of a login page. A network restriction and a liveness
check are the same change here, and it is worth staging it that way.

The deeper reason to prefer this over a second auth layer: two mechanisms that
must both stay correct are worse than one mechanism and one closed path. A
second identity system is a second thing to configure, rotate, and get subtly
wrong, bought in order to protect a route that should be shut.

## Go check one thing

This takes under a minute and you can do it now.

Pick your most privileged internal service, the one whose backend holds the
best credentials. Get a shell in the most boring workload you have inside the
same network, something with no permissions and no relationship to that
service. Curl the service by hostname, from there.

A redirect to a login page or a refused connection is an answer. A healthy
proxy dashboard is not, because the proxy is only ever reporting on the
traffic it saw.
