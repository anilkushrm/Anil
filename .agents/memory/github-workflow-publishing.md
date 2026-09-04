---
name: GitHub workflow publishing
description: Constraints encountered when initializing a GitHub repository and publishing Actions workflow files through connectors.
---

An empty GitHub repository must have an initial commit and branch before branch protection or Git Data blob uploads can be applied. Standard OAuth repository access may administer the repository yet still lack permission to create or update files under `.github/workflows`. Requiring a check before its workflow exists on the default branch creates a bootstrap deadlock because GitHub does not report that check on the workflow-introduction pull request.

**Why:** GitHub rejected protection before a branch existed, rejected Git Data uploads while the repository was empty, and the connected OAuth account could not commit the Actions workflow. A pull request that introduced the missing workflow reported no checks, so the protected branch could not accept it. Repository administration, workflow-file publishing, and workflow recognition are distinct gates.

**How to apply:** For an empty target, initialize and publish the default branch before requiring a new context. Prefer a repository-scoped GitHub App connection when an Actions workflow must be published. If protection already requires a context whose workflow is absent, preserve the full protection payload, temporarily remove only that context for the bootstrap push, and restore it with a failure-safe trap. Verify the workflow is active and the required context is restored.