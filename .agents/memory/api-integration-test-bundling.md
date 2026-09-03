---
name: API integration test bundling
description: Runtime logger behavior required when bundling API integration tests outside the workspace.
---

Bundled API integration tests that import the Express app should run with production logger mode when the bundle is emitted outside the workspace and `pino-pretty` is externalized.

**Why:** Pino resolves an external transport relative to the temporary bundle, so development logger initialization fails before any test runs.

**How to apply:** Keep the app import static for CommonJS test bundles and set `NODE_ENV=production` on the bundled test process rather than changing application logging just for tests.