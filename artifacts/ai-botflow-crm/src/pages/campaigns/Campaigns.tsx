import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCampaignsQueryKey, useCreateCampaign, useListCampaigns, useUpdateCampaign } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Campaigns() {
  const { data: campaigns = [] } = useListCampaigns();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "instagram" | "facebook">("whatsapp");
  const [audienceCount, setAudienceCount] = useState(0);
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
  return <AppLayout><div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Campaigns</h1><p className="text-muted-foreground">Prepare campaign drafts and audiences. Delivery remains disabled until live channels are connected.</p></div>
    <Card><CardHeader><CardTitle>Create campaign draft</CardTitle></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); createCampaign.mutate({ data: { name, channel, audienceCount } }, { onSuccess: () => { setName(""); setAudienceCount(0); refresh(); } }); }}>
      <div className="space-y-2"><Label htmlFor="campaign-name">Name</Label><Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="campaign-channel">Channel</Label><select id="campaign-channel" className="h-10 w-full rounded-md border bg-background px-3" value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option></select></div><div className="space-y-2"><Label htmlFor="campaign-audience">Audience count</Label><Input id="campaign-audience" type="number" min={0} value={audienceCount} onChange={(e) => setAudienceCount(Number(e.target.value))} /></div><Button className="self-end">Save draft</Button>
    </form></CardContent></Card>
    <div className="space-y-3">{campaigns.map((campaign) => <Card key={campaign.id}><CardContent className="flex items-center justify-between p-5"><div><div className="flex gap-2"><p className="font-semibold">{campaign.name}</p><Badge variant="outline">{campaign.status}</Badge></div><p className="text-sm text-muted-foreground">{campaign.channel} · {campaign.audienceCount} recipients</p></div><Button variant="outline" onClick={() => updateCampaign.mutate({ id: campaign.id, data: { status: campaign.status === "ready" ? "draft" : "ready" } }, { onSuccess: refresh })}>{campaign.status === "ready" ? "Return to draft" : "Mark ready"}</Button></CardContent></Card>)}</div>
  </div></AppLayout>;
}
