import assert from "node:assert/strict";
import test from "node:test";
import { eq } from "drizzle-orm";
import {
  channelsTable,
  conversationsTable,
  db,
  leadsTable,
  messagesTable,
  metaWebhookEventsTable,
  usersTable,
  workspacesTable,
} from "@workspace/db";
import { processPendingOutboundMessages } from "./meta-delivery";
import {
  consumeMetaOAuthState,
  consumeMetaPageSelection,
  createMetaOAuthState,
  decryptMetaCredentials,
  finishMetaAuthorization,
  prepareMetaPageSelection,
  sendMetaText,
} from "./meta";
import { processPendingMetaWebhookEvents } from "./webhooks";

test("outbound worker resumes pending messages and does not resend ambiguous leased sends", async () => {
  const [workspace] = await db.insert(workspacesTable).values({
    name: `Meta Delivery Test ${crypto.randomUUID()}`,
    slug: `meta-delivery-test-${crypto.randomUUID()}`,
  }).returning();
  assert.ok(workspace);
  try {
    const [lead] = await db.insert(leadsTable).values({
      workspaceId: workspace.id,
      name: "Delivery Test Lead",
      assignee: "Unassigned",
      messagingConsent: "opted_in",
    }).returning();
    const [conversation] = await db.insert(conversationsTable).values({
      workspaceId: workspace.id,
      leadId: lead!.id,
      contactName: lead!.name,
      channel: "facebook",
      channelAccountId: `page-${crypto.randomUUID()}`,
      externalParticipantId: `person-${crypto.randomUUID()}`,
    }).returning();
    const [pending, interrupted] = await db.insert(messagesTable).values([
      {
        workspaceId: workspace.id,
        conversationId: conversation!.id,
        body: "Resume me",
        direction: "outbound",
        senderName: "Test Agent",
        deliveryStatus: "pending",
        deliveryNextAttemptAt: new Date(Date.now() - 1_000),
      },
      {
        workspaceId: workspace.id,
        conversationId: conversation!.id,
        body: "Do not duplicate me",
        direction: "outbound",
        senderName: "Test Agent",
        deliveryStatus: "sending",
        deliveryAttemptCount: 1,
        deliveryLeaseUntil: new Date(Date.now() - 1_000),
      },
    ]).returning();

    await processPendingOutboundMessages();

    const [resumed] = await db.select().from(messagesTable).where(eq(messagesTable.id, pending!.id)).limit(1);
    const [recovered] = await db.select().from(messagesTable).where(eq(messagesTable.id, interrupted!.id)).limit(1);
    assert.equal(resumed?.deliveryStatus, "failed");
    assert.match(resumed?.deliveryError ?? "", /not connected/i);
    assert.equal(resumed?.deliveryAttemptCount, 1);
    assert.equal(recovered?.deliveryStatus, "failed");
    assert.match(recovered?.deliveryError ?? "", /not resent to prevent duplicates/i);
    assert.equal(recovered?.deliveryAttemptCount, 1);
  } finally {
    await db.delete(workspacesTable).where(eq(workspacesTable.id, workspace.id));
  }
});

test("Meta OAuth state is single-use and bound to its initiating user and workspace", async () => {
  const [workspace] = await db.insert(workspacesTable).values({
    name: `Meta OAuth Test ${crypto.randomUUID()}`,
    slug: `meta-oauth-test-${crypto.randomUUID()}`,
  }).returning();
  const users = await db.insert(usersTable).values([
    {
      name: "OAuth Initiator",
      email: `oauth-initiator-${crypto.randomUUID()}@example.com`,
      passwordHash: "test-only",
    },
    {
      name: "Different User",
      email: `oauth-other-${crypto.randomUUID()}@example.com`,
      passwordHash: "test-only",
    },
  ]).returning();
  assert.ok(workspace && users[0] && users[1]);
  try {
    const [channel] = await db.insert(channelsTable).values({
      workspaceId: workspace.id,
      type: "facebook",
      name: "Facebook",
      mode: "oauth",
    }).returning();
    const state = await createMetaOAuthState(workspace.id, channel!.id, users[0].id);

    await assert.rejects(
      consumeMetaOAuthState(state, users[1].id, workspace.id),
      /invalid, expired, or already used/i,
    );
    const consumed = await consumeMetaOAuthState(state, users[0].id, workspace.id);
    assert.equal(consumed.workspaceId, workspace.id);
    assert.equal(consumed.channelId, channel!.id);
    await assert.rejects(
      consumeMetaOAuthState(state, users[0].id, workspace.id),
      /invalid, expired, or already used/i,
    );
  } finally {
    await db.delete(workspacesTable).where(eq(workspacesTable.id, workspace.id));
    for (const user of users) await db.delete(usersTable).where(eq(usersTable.id, user.id));
  }
});

test("Meta Page selection supports multiple Pages and remains single-use", async () => {
  process.env.SESSION_SECRET = "test-session-secret-with-enough-entropy";
  const [workspace] = await db.insert(workspacesTable).values({
    name: `Meta Page Selection ${crypto.randomUUID()}`,
    slug: `meta-page-selection-${crypto.randomUUID()}`,
  }).returning();
  const [user] = await db.insert(usersTable).values({
    name: "Page Selector",
    email: `page-selector-${crypto.randomUUID()}@example.com`,
    passwordHash: "test-only",
  }).returning();
  try {
    const [channel] = await db.insert(channelsTable).values({
      workspaceId: workspace!.id,
      type: "facebook",
      name: "Facebook",
      mode: "oauth",
    }).returning();
    const state = await createMetaOAuthState(workspace!.id, channel!.id, user!.id);
    const transaction = await consumeMetaOAuthState(state, user!.id, workspace!.id);
    await prepareMetaPageSelection(transaction.transactionId, "user-token", [
      { id: "page-a", name: "Page A" },
      { id: "page-b", name: "Page B" },
    ]);
    await assert.rejects(
      consumeMetaPageSelection(state, user!.id, workspace!.id, "page-c"),
      /invalid or expired/i,
    );
    const selection = await consumeMetaPageSelection(state, user!.id, workspace!.id, "page-b");
    assert.equal(selection.pageId, "page-b");
    assert.equal(selection.accessToken, "user-token");
    await assert.rejects(
      consumeMetaPageSelection(state, user!.id, workspace!.id, "page-b"),
      /invalid|already been used/i,
    );
  } finally {
    await db.delete(workspacesTable).where(eq(workspacesTable.id, workspace!.id));
    await db.delete(usersTable).where(eq(usersTable.id, user!.id));
  }
});

test("Meta webhook worker does not lease retries before their scheduled time", async () => {
  const [event] = await db.insert(metaWebhookEventsTable).values({
    providerEventId: `future-retry-${crypto.randomUUID()}`,
    kind: "inbound",
    payload: {},
    status: "pending",
    attemptCount: 1,
    nextAttemptAt: new Date(Date.now() + 60_000),
  }).returning();
  try {
    await processPendingMetaWebhookEvents();
    const [unchanged] = await db.select().from(metaWebhookEventsTable)
      .where(eq(metaWebhookEventsTable.id, event!.id)).limit(1);
    assert.equal(unchanged?.status, "pending");
    assert.equal(unchanged?.attemptCount, 1);
  } finally {
    await db.delete(metaWebhookEventsTable).where(eq(metaWebhookEventsTable.id, event!.id));
  }
});

test("Facebook and Instagram persist and use the selected Page access token", async () => {
  process.env.META_APP_ID = "test-app";
  process.env.META_APP_SECRET = "test-secret";
  process.env.META_REDIRECT_URI = "https://example.test/meta/callback";
  process.env.META_VERIFY_TOKEN = "test-verify";
  process.env.SESSION_SECRET = "test-session-secret-with-enough-entropy";
  const originalFetch = globalThis.fetch;
  const requested: URL[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    requested.push(url);
    const path = url.pathname;
    const response = path.endsWith("/oauth/access_token")
      ? { access_token: "user-access-token" }
      : path.endsWith("/me")
        ? { id: "user", name: "Meta Admin" }
        : path.endsWith("/me/accounts")
          ? {
              data: [{
                id: "page-1",
                name: "Selected Page",
                access_token: "selected-page-token",
                instagram_business_account: { id: "ig-1" },
              }, {
                id: "page-2",
                name: "Other Page",
                access_token: "other-page-token",
                instagram_business_account: { id: "ig-2" },
              }],
            }
          : path.endsWith("/messages")
            ? { message_id: `message-${requested.length}` }
            : { success: true };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const workspaceIds: string[] = [];
  try {
    for (const type of ["facebook", "instagram"] as const) {
      const [workspace] = await db.insert(workspacesTable).values({
        name: `${type} Graph Test ${crypto.randomUUID()}`,
        slug: `${type}-graph-test-${crypto.randomUUID()}`,
      }).returning();
      workspaceIds.push(workspace!.id);
      const [channel] = await db.insert(channelsTable).values({
        workspaceId: workspace!.id,
        type,
        name: type,
        mode: "oauth",
      }).returning();

      const connected = await finishMetaAuthorization(
        { workspaceId: workspace!.id, channelId: channel!.id },
        "",
        undefined,
        { userAccessToken: "user-access-token", selectedPageId: "page-1" },
      );
      assert.equal(connected.externalAccountId, type === "facebook" ? "page-1" : "ig-1");
      assert.equal(decryptMetaCredentials(connected.credentialsCiphertext!).accessToken, "selected-page-token");
      await sendMetaText(connected, "recipient-1", "Hello");
      const sendRequest = [...requested].reverse().find((url: URL) => url.pathname.endsWith(
        type === "facebook" ? "/page-1/messages" : "/ig-1/messages",
      ));
      assert.equal(sendRequest?.searchParams.get("access_token"), "selected-page-token");
      const subscriptionRequest = [...requested].reverse()
        .find((url: URL) => url.pathname.endsWith("/page-1/subscribed_apps"));
      assert.equal(subscriptionRequest?.searchParams.get("access_token"), "selected-page-token");
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const workspaceId of workspaceIds) {
      await db.delete(workspacesTable).where(eq(workspacesTable.id, workspaceId));
    }
  }
});