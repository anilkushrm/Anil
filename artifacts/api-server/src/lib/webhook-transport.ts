import { lookup } from "node:dns/promises";
import { request as httpsRequest, type RequestOptions } from "node:https";
import { isIP } from "node:net";

type ResolvedAddress = { address: string; family: number };
type ResolveAll = (hostname: string) => Promise<ResolvedAddress[]>;

export type ValidatedWebhookTarget = {
  url: URL;
  address: string;
  family: number;
};

function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
  const ipv4 = normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
  if (isIP(ipv4) !== 4) return false;
  const [a, b] = ipv4.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a! >= 224 || (a === 169 && b === 254) || (a === 172 && b! >= 16 && b! <= 31) || (a === 192 && b === 168) || (a === 100 && b! >= 64 && b! <= 127);
}

const systemResolver: ResolveAll = (hostname) => lookup(hostname, { all: true, verbatim: true });

export async function validateWebhookUrl(rawUrl: string, resolveAll: ResolveAll = systemResolver): Promise<ValidatedWebhookTarget> {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
    throw new Error("Webhook URLs must use HTTPS without credentials or custom ports.");
  }
  if (url.hostname === "localhost" || url.hostname.endsWith(".local")) {
    throw new Error("Private webhook destinations are not allowed.");
  }
  const addresses = await resolveAll(url.hostname);
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Webhook destination must resolve only to public IP addresses.");
  }
  const target = addresses[0]!;
  return { url, address: target.address, family: target.family };
}

export function buildPinnedRequestOptions(target: ValidatedWebhookTarget, event: string, contentLength: number): RequestOptions {
  return {
    protocol: "https:",
    hostname: target.address,
    family: target.family,
    port: 443,
    servername: target.url.hostname,
    path: `${target.url.pathname}${target.url.search}`,
    method: "POST",
    rejectUnauthorized: true,
    headers: {
      host: target.url.host,
      "content-type": "application/json",
      "content-length": contentLength,
      "user-agent": "Ai-Botflow-CRM-Webhook/1.0",
      "x-ai-botflow-event": event,
    },
  };
}

export async function postPinnedWebhook(target: ValidatedWebhookTarget, event: string, data: unknown): Promise<number> {
  const body = JSON.stringify({ event, occurredAt: new Date().toISOString(), data });
  const options = buildPinnedRequestOptions(target, event, Buffer.byteLength(body));
  return new Promise((resolve, reject) => {
    const request = httpsRequest(options, (response) => {
      const status = response.statusCode ?? 0;
      response.resume();
      response.once("end", () => {
        if (status >= 200 && status < 300) resolve(status);
        else reject(new Error(`Destination returned HTTP ${status}`));
      });
    });
    request.setTimeout(5_000, () => request.destroy(new Error("Webhook delivery timed out")));
    request.once("error", reject);
    request.end(body);
  });
}