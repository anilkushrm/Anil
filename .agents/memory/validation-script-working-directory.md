---
name: Repo-scoped validation scripts
description: Working-directory behavior for validation helpers called by pnpm workspace package scripts.
---

Repo-scoped validation helpers should resolve and change to the Git root before running path-scoped Git commands.

**Why:** pnpm package scripts execute with the package directory as the working directory, while the paths being validated are usually rooted at the repository.

**How to apply:** When a package script delegates to a repository-level checker, normalize the working directory inside the checker rather than relying on the caller's current directory.