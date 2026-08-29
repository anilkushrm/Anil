import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListApiKeysQueryKey,
  getListWebhookDeliveriesQueryKey,
  getListWebhooksQueryKey,
  useCreateApiKey,
  useCreateWebhook,
  useDeleteWebhook,
  useListApiKeys,
  useListWebhookDeliveries,
  useListWebhooks,
  useRevokeApiKey,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Integrations() {
  const { data: apiKeys = [] } = useListApiKeys();
  const { data: webhooks = [] } = useListWebhooks();
  const { data: deliveries = [] } = useListWebhookDeliveries({
    query: { queryKey: getListWebhookDeliveriesQueryKey(), refetchInterval: 2000 },
  });
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const createWebhook = useCreateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const queryClient = useQueryClient();
  const [keyName, setKeyName] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const refreshKeys = () => queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
  const refreshWebhooks = () => queryClient.invalidateQueries({ queryKey: getListWebhooksQueryKey() });

  return <AppLayout><div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Integrations</h1><p className="text-muted-foreground">Manage API access, website webhooks, automation tools, and REST endpoints.</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>API Keys</CardTitle><CardDescription>Secrets are hashed at rest and displayed only once.</CardDescription></CardHeader><CardContent className="space-y-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); createApiKey.mutate({ data: { name: keyName } }, { onSuccess: (result) => { setNewSecret(result.secret); setKeyName(""); refreshKeys(); } }); }}><Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Production API" required /><Button>Create</Button></form>
        {newSecret && <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:bg-amber-950/20"><p className="font-medium">Copy this secret now</p><code className="mt-2 block break-all">{newSecret}</code><Button className="mt-2" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(newSecret)}>Copy</Button></div>}
        {apiKeys.map((key) => <div key={key.id} className="flex items-center justify-between border-b pb-3"><div><p className="font-medium">{key.name}</p><code className="text-xs text-muted-foreground">{key.keyPrefix}••••••••</code><p className="text-xs text-muted-foreground">{key.lastUsedAt ? "Used by an external client" : "Never used"}</p></div><Button variant="destructive" size="sm" onClick={() => revokeApiKey.mutate({ id: key.id }, { onSuccess: refreshKeys })}>Revoke</Button></div>)}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Website Webhooks</CardTitle><CardDescription>Register destinations for website enquiry automation.</CardDescription></CardHeader><CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); createWebhook.mutate({ data: { name: webhookName, url: webhookUrl } }, { onSuccess: () => { setWebhookName(""); setWebhookUrl(""); refreshWebhooks(); } }); }}><div className="space-y-2"><Label>Name</Label><Input value={webhookName} onChange={(e) => setWebhookName(e.target.value)} required /></div><div className="space-y-2"><Label>HTTPS URL</Label><Input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://example.com/webhooks/leads" required /></div><Button>Add webhook</Button></form>
        {webhooks.map((webhook) => <div key={webhook.id} className="flex items-center justify-between border-b pb-3"><div className="min-w-0"><div className="flex items-center gap-2 font-medium">{webhook.name} <Badge variant="outline">{webhook.status}</Badge></div><p className="truncate text-xs text-muted-foreground">{webhook.url}</p></div><Button variant="destructive" size="sm" onClick={() => deleteWebhook.mutate({ id: webhook.id }, { onSuccess: refreshWebhooks })}>Delete</Button></div>)}
      </CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Webhook Delivery Log</CardTitle><CardDescription>Lead-created events are delivered with a 5-second timeout and up to 3 attempts.</CardDescription></CardHeader><CardContent className="space-y-3">{deliveries.map((delivery) => <div key={delivery.id} className="flex items-center justify-between border-b pb-3 text-sm"><div><p className="font-medium">{delivery.event}</p><p className="text-xs text-muted-foreground">{delivery.attemptCount} attempt(s){delivery.httpStatus ? ` · HTTP ${delivery.httpStatus}` : ""}</p></div><Badge variant={delivery.status === "delivered" ? "success" : delivery.status === "failed" ? "destructive" : "secondary"}>{delivery.status}</Badge></div>)}{!deliveries.length && <p className="text-sm text-muted-foreground">No delivery attempts yet.</p>}</CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle>Automation Platforms</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Use your API key as <code>Authorization: Bearer abf_…</code> with n8n, Make, Pabbly, or Zapier HTTP actions. The key is locked to this workspace and your current role.</CardContent></Card><Card><CardHeader><CardTitle>REST API</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><code>GET /api/leads</code><br/><code>POST /api/leads</code><br/><code>GET /api/inbox/conversations</code><p className="text-muted-foreground">Generated OpenAPI contracts validate requests and responses.</p></CardContent></Card></div>
  </div></AppLayout>;
}
