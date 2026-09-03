---
name: Meta channel delivery
description: Reliability and tenant-binding invariants for Meta messaging integrations.
---

Persist authenticated provider events before acknowledging the webhook, and make workers resume safely after partial side effects. Correlate generated replies to the source event so retries cannot duplicate outbound messages.

**Why:** Acknowledging before durable persistence loses events on process failure, while treating an existing inbound message as fully processed can skip a later STOP update or duplicate an AI reply.

**How to apply:** Lease queued events with retry/backoff and reclaim expired leases. On retries, load existing message state and continue downstream steps. Keep recipient suppression durable and independently idempotent.

Persist outbound messages before provider calls and let a worker claim pending rows. If a process dies during an in-flight provider request, mark the expired lease as outcome-unknown instead of resending blindly, because Meta does not provide a safe idempotency key for message creation.

**Why:** Retrying the crash window after provider acceptance can send the customer a duplicate message.

**How to apply:** Resume only rows that are still pending; use an explicit sending lease around the provider call and require manual review for expired in-flight leases.

For WhatsApp Embedded Signup, capture the WABA and phone-number IDs selected by the SDK session and validate both against the exchanged token before storing the connection.

**Why:** Choosing the first asset visible to a token can connect the wrong business account in multi-asset Meta organizations.

**How to apply:** Never trust callback-supplied asset IDs alone; verify the selected WABA in token permissions and the selected phone under that WABA.

OAuth connection state must be an opaque, high-entropy, single-use transaction bound to the initiating authenticated user and workspace.

**Why:** A reusable signed workspace/channel payload allows account-confusion attacks where another Meta administrator's authorization is attached to the attacker's workspace.

**How to apply:** Store only a hash of the nonce with user, workspace, channel, and expiry; require the same authenticated context on callback and consume the transaction atomically before exchanging the code.

Facebook and Instagram messaging credentials must use the selected Page access token, not the OAuth user's access token; Instagram still sends from the linked IG business ID.

**Why:** Meta Page and Instagram messaging endpoints reject user access tokens even when the account-discovery call succeeds.

**How to apply:** Request each Page's access token during account discovery, use it for Page subscription and sends, and persist the Page ID separately from the Instagram sender ID.