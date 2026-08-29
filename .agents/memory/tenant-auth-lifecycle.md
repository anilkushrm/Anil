---
name: Tenant auth lifecycle
description: Non-obvious invariants for reliable multi-workspace login, logout, and invitation acceptance.
---

After authentication mutations, update the client session cache before navigating. Resolve sessions only through active memberships; pending invitations must use expiring, single-use activation tokens before they can become authenticated workspace access.

**Why:** A valid server cookie alone does not prevent a stale anonymous client query from redirecting a newly authenticated user back to login. Likewise, persisting an invited membership without a real activation lifecycle either grants access too early or creates an account that can never sign in.

**How to apply:** For every login, registration, logout, or invite-accept mutation, update or clear the session query atomically with navigation. When adding team workflows, test pending, accepted, expired, reused, and multi-workspace cases in a real browser.