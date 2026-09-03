import { createCipheriv, createDecipheriv, createHmac, randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNotNull, isNull } from "drizzle-orm";
import { channelsTable, db, metaOAuthTransactionsTable } from "@workspace/db";

const GRAPH_VERSION = process.env["META_GRAPH_VERSION"] ?? "v22.0";
const GRAPH_ORIGIN = `https://graph.facebook.com/${GRAPH_VERSION}`;
const STATE_TTL_MS = 10 * 60_000;

type MetaCredentials = {
  accessToken: string;
  tokenType?: string;
  subscriptionAccountId?: string;
};

export type MetaPageCandidate = {
  id: string;
  name: string;
  instagramBusinessId?: string;
};

type MetaResponse = {
  id?: string;
  name?: string;
  error?: { message?: string; type?: string; code?: number; error_subcode?: number };
  messages?: Array<{ id?: string }>;
  message_id?: string;
  data?: Array<{
    id?: string;
    name?: string;
    verified_name?: string;
    display_phone_number?: string;
    access_token?: string;
    instagram_business_account?: { id?: string };
    granular_scopes?: Array<{ scope?: string; target_ids?: string[] }>;
  }> | {
    granular_scopes?: Array<{ scope?: string; target_ids?: string[] }>;
  };
  [key: string]: unknown;
};

function secretKey(): Buffer {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("SESSION_SECRET is required for Meta connection encryption.");
  return createHash("sha256").update(secret).digest();
}

export function encryptMetaCredentials(credentials: MetaCredentials): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(credentials), "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptMetaCredentials(ciphertext: string): MetaCredentials {
  const [ivText, tagText, encryptedText] = ciphertext.split(".");
  if (!ivText || !tagText || !encryptedText) throw new Error("Stored Meta credentials are invalid.");
  const decipher = createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  const credentials = JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8")) as MetaCredentials;
  if (!credentials.accessToken) throw new Error("Stored Meta credentials are missing an access token.");
  return credentials;
}

function appConfig() {
  const appId = process.env["META_APP_ID"];
  const appSecret = process.env["META_APP_SECRET"];
  const redirectUri = process.env["META_REDIRECT_URI"];
  const verifyToken = process.env["META_VERIFY_TOKEN"];
  if (!appId || !appSecret || !redirectUri || !verifyToken) {
    throw new Error("Meta app configuration is incomplete. Set META_APP_ID, META_APP_SECRET, META_REDIRECT_URI, and META_VERIFY_TOKEN.");
  }
  return { appId, appSecret, redirectUri, verifyToken };
}

function hashOAuthState(state: string): string {
  return createHash("sha256").update(state).digest("hex");
}

export async function createMetaOAuthState(workspaceId: string, channelId: string, userId: string): Promise<string> {
  const state = randomBytes(32).toString("base64url");
  await db.insert(metaOAuthTransactionsTable).values({
    stateHash: hashOAuthState(state),
    workspaceId,
    channelId,
    userId,
    expiresAt: new Date(Date.now() + STATE_TTL_MS),
  });
  return state;
}

export async function consumeMetaOAuthState(
  state: string,
  userId: string,
  workspaceId: string,
): Promise<{ transactionId: string; workspaceId: string; channelId: string }> {
  const [transaction] = await db.update(metaOAuthTransactionsTable).set({
    consumedAt: new Date(),
  }).where(and(
    eq(metaOAuthTransactionsTable.stateHash, hashOAuthState(state)),
    eq(metaOAuthTransactionsTable.userId, userId),
    eq(metaOAuthTransactionsTable.workspaceId, workspaceId),
    isNull(metaOAuthTransactionsTable.consumedAt),
    gt(metaOAuthTransactionsTable.expiresAt, new Date()),
  )).returning();
  if (!transaction) throw new Error("Invalid, expired, or already used Meta OAuth state.");
  return { transactionId: transaction.id, workspaceId: transaction.workspaceId, channelId: transaction.channelId };
}

export async function metaAuthorizationUrl(
  workspaceId: string,
  channelId: string,
  userId: string,
  mode: "embedded_signup" | "oauth",
): Promise<string> {
  const config = appConfig();
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    state: await createMetaOAuthState(workspaceId, channelId, userId),
    response_type: "code",
    scope: [
      "business_management",
      "whatsapp_business_management",
      "whatsapp_business_messaging",
      "pages_manage_metadata",
      "pages_messaging",
      "pages_show_list",
      "instagram_basic",
      "instagram_manage_messages",
    ].join(","),
  });
  if (mode === "embedded_signup") {
    const configId = process.env["META_WHATSAPP_CONFIG_ID"];
    if (!configId) throw new Error("META_WHATSAPP_CONFIG_ID is required for WhatsApp Embedded Signup.");
    params.set("config_id", configId);
    params.set("extras", JSON.stringify({ feature: "whatsapp_embedded_signup" }));
  }
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

export function metaClientConfiguration() {
  const config = appConfig();
  return {
    appId: config.appId,
    configId: process.env["META_WHATSAPP_CONFIG_ID"] ?? "",
    graphVersion: GRAPH_VERSION,
  };
}

async function graphRequest(path: string, token: string | undefined, init: RequestInit = {}): Promise<MetaResponse> {
  const url = new URL(path.startsWith("http") ? path : `${GRAPH_ORIGIN}${path}`);
  if (token) url.searchParams.set("access_token", token);
  const response = await fetch(url, {
    ...init,
    headers: { accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
    signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json() as MetaResponse;
  if (!response.ok || data.error) {
    throw new Error(`Meta API ${response.status}: ${data.error?.message ?? "request failed"}`);
  }
  return data;
}

export async function exchangeMetaAuthorizationCode(code: string): Promise<string> {
  const config = appConfig();
  const tokenParams = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code,
  });
  const tokenResponse = await graphRequest(`/oauth/access_token?${tokenParams.toString()}`, undefined);
  const accessToken = String(tokenResponse.access_token ?? "");
  if (!accessToken) throw new Error("Meta did not return an access token.");
  return accessToken;
}

export async function listMetaPageCandidates(
  accessToken: string,
  channelType: string,
): Promise<MetaPageCandidate[]> {
  const accounts = await graphRequest("/me/accounts?fields=id,name,access_token,instagram_business_account", accessToken);
  if (!Array.isArray(accounts.data)) return [];
  return accounts.data.flatMap((account) => {
    if (!account.id || !account.name) return [];
    if (channelType === "instagram" && !account.instagram_business_account?.id) return [];
    return [{
      id: account.id,
      name: account.name,
      instagramBusinessId: account.instagram_business_account?.id,
    }];
  });
}

export async function prepareMetaPageSelection(
  transactionId: string,
  accessToken: string,
  candidates: MetaPageCandidate[],
): Promise<void> {
  if (candidates.length < 2) throw new Error("Page selection requires multiple candidates.");
  const [updated] = await db.update(metaOAuthTransactionsTable).set({
    authorizationCiphertext: encryptMetaCredentials({ accessToken }),
    candidatePages: candidates,
  }).where(and(
    eq(metaOAuthTransactionsTable.id, transactionId),
    isNotNull(metaOAuthTransactionsTable.consumedAt),
    isNull(metaOAuthTransactionsTable.selectionConsumedAt),
    gt(metaOAuthTransactionsTable.expiresAt, new Date()),
  )).returning({ id: metaOAuthTransactionsTable.id });
  if (!updated) throw new Error("Meta Page selection transaction is no longer valid.");
}

export async function consumeMetaPageSelection(
  state: string,
  userId: string,
  workspaceId: string,
  pageId: string,
): Promise<{ workspaceId: string; channelId: string; accessToken: string; pageId: string }> {
  const [pending] = await db.select().from(metaOAuthTransactionsTable).where(and(
    eq(metaOAuthTransactionsTable.stateHash, hashOAuthState(state)),
    eq(metaOAuthTransactionsTable.userId, userId),
    eq(metaOAuthTransactionsTable.workspaceId, workspaceId),
    isNotNull(metaOAuthTransactionsTable.consumedAt),
    isNull(metaOAuthTransactionsTable.selectionConsumedAt),
    gt(metaOAuthTransactionsTable.expiresAt, new Date()),
  )).limit(1);
  const candidates = (pending?.candidatePages ?? []) as MetaPageCandidate[];
  if (!pending?.authorizationCiphertext || !candidates.some((candidate) => candidate.id === pageId)) {
    throw new Error("Invalid or expired Meta Page selection.");
  }
  const [claimed] = await db.update(metaOAuthTransactionsTable).set({
    selectionConsumedAt: new Date(),
  }).where(and(
    eq(metaOAuthTransactionsTable.id, pending.id),
    isNull(metaOAuthTransactionsTable.selectionConsumedAt),
  )).returning();
  if (!claimed) throw new Error("Meta Page selection has already been used.");
  return {
    workspaceId: claimed.workspaceId,
    channelId: claimed.channelId,
    accessToken: decryptMetaCredentials(claimed.authorizationCiphertext!).accessToken,
    pageId,
  };
}

export async function finishMetaAuthorization(
  state: { workspaceId: string; channelId: string },
  code: string,
  selectedAssets?: { wabaId: string; phoneNumberId: string },
  socialAuthorization?: { userAccessToken: string; selectedPageId: string },
): Promise<typeof channelsTable.$inferSelect> {
  const config = appConfig();
  const [existingChannel] = await db.select().from(channelsTable).where(and(
    eq(channelsTable.id, state.channelId),
    eq(channelsTable.workspaceId, state.workspaceId),
  )).limit(1);
  if (!existingChannel) throw new Error("Channel not found.");
  const accessToken = socialAuthorization?.userAccessToken ?? await exchangeMetaAuthorizationCode(code);
  const profile = await graphRequest("/me?fields=id,name", accessToken);
  let externalAccountId = "";
  let accountName = String(profile.name ?? "");
  let subscriptionAccountId: string | undefined;
  let channelAccessToken = accessToken;
  if (existingChannel.type === "whatsapp") {
    if (!selectedAssets) throw new Error("WhatsApp Embedded Signup did not provide the selected business assets.");
    const appAccessToken = `${config.appId}|${config.appSecret}`;
    const debug = await graphRequest(`/debug_token?input_token=${encodeURIComponent(accessToken)}`, appAccessToken);
    const debugData = !Array.isArray(debug.data) ? debug.data : undefined;
    const authorizedWabas = debugData?.granular_scopes
      ?.find((scope) => scope.scope === "whatsapp_business_management")
      ?.target_ids ?? [];
    if (!authorizedWabas.includes(selectedAssets.wabaId)) {
      throw new Error("The selected WhatsApp business account is not authorized by this signup.");
    }
    const phones = await graphRequest(`/${selectedAssets.wabaId}/phone_numbers?fields=id,display_phone_number,verified_name`, accessToken);
    const phone = Array.isArray(phones.data)
      ? phones.data.find((item) => item.id === selectedAssets.phoneNumberId)
      : undefined;
    if (phone) {
      externalAccountId = phone.id ?? "";
      accountName = phone?.verified_name ?? phone?.display_phone_number ?? accountName;
      subscriptionAccountId = selectedAssets.wabaId;
    }
  } else {
    const accounts = await graphRequest("/me/accounts?fields=id,name,access_token,instagram_business_account", accessToken);
    const eligibleAccounts = Array.isArray(accounts.data)
      ? accounts.data.filter((item) => existingChannel.type === "instagram" ? item.instagram_business_account?.id : item.id)
      : [];
    const account = socialAuthorization
      ? eligibleAccounts.find((item) => item.id === socialAuthorization.selectedPageId)
      : eligibleAccounts.length === 1 ? eligibleAccounts[0] : undefined;
    if (!account) throw new Error("Select an eligible Meta Page to complete this channel connection.");
    if (!account?.access_token) throw new Error("Meta did not return the selected Page access token.");
    externalAccountId = existingChannel.type === "instagram"
      ? account?.instagram_business_account?.id ?? ""
      : account?.id ?? "";
    accountName = account?.name ?? accountName;
    subscriptionAccountId = account?.id;
    channelAccessToken = account.access_token;
  }
  if (!externalAccountId) throw new Error("Meta did not return an account id. Complete Embedded Signup and try again.");
  if (subscriptionAccountId) {
    await graphRequest(`/${subscriptionAccountId}/subscribed_apps`, channelAccessToken, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }
  const [channel] = await db.update(channelsTable).set({
    status: "connected",
    accountName: accountName || externalAccountId,
    externalAccountId,
    credentialsCiphertext: encryptMetaCredentials({ accessToken: channelAccessToken, subscriptionAccountId }),
    lastSyncedAt: new Date(),
  }).where(and(
    eq(channelsTable.id, state.channelId),
    eq(channelsTable.workspaceId, state.workspaceId),
  )).returning();
  if (!channel) throw new Error("Channel not found.");
  return channel;
}

export async function findMetaChannelCredentials(channel: typeof channelsTable.$inferSelect) {
  if (channel.status !== "connected" || !channel.externalAccountId || !channel.credentialsCiphertext) {
    throw new Error("This Meta channel is not connected.");
  }
  return { credentials: decryptMetaCredentials(channel.credentialsCiphertext), externalAccountId: channel.externalAccountId };
}

export async function sendMetaText(
  channel: typeof channelsTable.$inferSelect,
  recipientId: string,
  body: string,
): Promise<{ providerMessageId: string }> {
  const { credentials, externalAccountId } = await findMetaChannelCredentials(channel);
  let response: MetaResponse;
  if (channel.type === "whatsapp") {
    response = await graphRequest(`/${externalAccountId}/messages`, credentials.accessToken, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientId.replace(/[^\d+]/g, ""),
        type: "text",
        text: { preview_url: false, body },
      }),
    });
  } else {
    response = await graphRequest(`/${externalAccountId}/messages`, credentials.accessToken, {
      method: "POST",
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text: body } }),
    });
  }
  const providerMessageId = String(response.messages?.[0]?.id ?? response.message_id ?? "");
  if (!providerMessageId) throw new Error("Meta accepted the message without returning a message id.");
  return { providerMessageId };
}

export function metaVerifyToken(): string {
  return appConfig().verifyToken;
}

export function isMetaTransientError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const status = Number(message.match(/Meta API (\d+)/)?.[1] ?? 0);
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}