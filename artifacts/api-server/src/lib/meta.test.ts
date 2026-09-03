import assert from "node:assert/strict";
import test from "node:test";
import {
  decryptMetaCredentials,
  encryptMetaCredentials,
} from "./meta.ts";
import { parseMetaPayload, verifyMetaWebhookSignature } from "./webhooks.ts";
import { createHmac } from "node:crypto";

test("Meta credentials are encrypted and authenticated", () => {
  process.env.SESSION_SECRET = "test-session-secret-with-enough-entropy";
  const encrypted = encryptMetaCredentials({ accessToken: "secret-token" });
  assert.equal(encrypted.includes("secret-token"), false);
  assert.deepEqual(decryptMetaCredentials(encrypted), { accessToken: "secret-token" });
  assert.throws(() => decryptMetaCredentials(`${encrypted.slice(0, -1)}x`));
});

test("Meta webhook signature verifies the raw body", () => {
  process.env.META_APP_SECRET = "meta-app-secret";
  const body = Buffer.from('{"entry":[]}');
  const signature = `sha256=${createHmac("sha256", process.env.META_APP_SECRET).update(body).digest("hex")}`;
  assert.equal(verifyMetaWebhookSignature(body, signature), true);
  assert.equal(verifyMetaWebhookSignature(Buffer.from("{}"), signature), false);
});

for (const object of ["page", "instagram"] as const) {
  test(`${object} business message echoes are not queued as inbound`, () => {
    const parsed = parseMetaPayload({
      object,
      entry: [{
        id: "business-account",
        messaging: [{
          sender: { id: "business-account" },
          recipient: { id: "customer" },
          message: { mid: `${object}-echo`, text: "Business reply", is_echo: true },
        }],
      }],
    });
    assert.deepEqual(parsed.inbound, []);
  });
}