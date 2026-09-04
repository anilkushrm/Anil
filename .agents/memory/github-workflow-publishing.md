---
name: GitHub workflow publishing
description: Constraints encountered when initializing a GitHub repository and publishing Actions workflow files through connectors.
---

An empty GitHub repository must have an initial commit and branch before branch protection or Git Data blob uploads can be applied. Standard OAuth repository access may administer the repository yet still lack permission to create or update files under `.github/workflows`.

**Why:** GitHub rejected protection before a branch existed, rejected Git Data uploads while the repository was empty, and the connected OAuth account could not commit the Actions workflow. Repository administration and workflow-file publishing are distinct permissions.

**How to apply:** For an empty target, initialize the default branch first. Prefer a repository-scoped GitHub App connection when an Actions workflow must be published; verify the workflow exists remotely before treating a required check as runnable.