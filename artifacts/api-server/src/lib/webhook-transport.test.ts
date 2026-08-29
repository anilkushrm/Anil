import assert from "node:assert/strict";
import test from "node:test";
import { buildPinnedRequestOptions, validateWebhookUrl } from "./webhook-transport.ts";

test("pins delivery to the address from the validated DNS result", async () => {
  let resolutionCount = 0;
  const rebindingResolver = async () => {
    resolutionCount += 1;
    return resolutionCount === 1
      ? [{ address: "93.184.216.34", family: 4 }]
      : [{ address: "127.0.0.1", family: 4 }];
  };

  const target = await validateWebhookUrl("https://example.com/hooks/leads", rebindingResolver);
  const options = buildPinnedRequestOptions(target, "lead.created", 42);

  assert.equal(resolutionCount, 1);
  assert.equal(options.hostname, "93.184.216.34");
  assert.equal(options.servername, "example.com");
  assert.equal((options.headers as Record<string, unknown>).host, "example.com");
  assert.equal(options.path, "/hooks/leads");
  assert.equal(options.lookup, undefined);
});

test("rejects a destination when any validated address is private", async () => {
  await assert.rejects(
    validateWebhookUrl("https://example.com/hooks", async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "169.254.169.254", family: 4 },
    ]),
    /public IP addresses/,
  );
});