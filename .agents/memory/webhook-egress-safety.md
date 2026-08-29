---
name: Webhook egress safety
description: Security invariant for outbound webhooks and other user-configured server-side HTTP destinations.
---

Do not validate a hostname with one DNS lookup and then use a client that resolves it again. Resolve all addresses, reject any private/reserved target, and connect the HTTPS socket to the selected validated IP while preserving the original hostname for TLS SNI, certificate verification, and the Host header.

**Why:** Separate validation and connection lookups permit DNS rebinding to loopback, private, link-local, or cloud-metadata addresses after the initial public result passes.

**How to apply:** Use the pinned HTTPS transport for every user-configured outbound URL, prohibit redirects, enforce timeout/retry limits, and keep a regression test where the resolver would return a private address on a hypothetical second call.