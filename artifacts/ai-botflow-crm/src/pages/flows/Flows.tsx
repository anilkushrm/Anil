import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListFlowsQueryKey, useCreateFlow, useListFlows, useUpdateFlow } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Flows() {
  const { data: flows = [] } = useListFlows();
  const createFlow = useCreateFlow();
  const updateFlow = useUpdateFlow();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<"keyword" | "new_lead" | "webhook">("keyword");
  const [actionText, setActionText] = useState("");
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListFlowsQueryKey() });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Automation Flows</h1><p className="text-muted-foreground">Save routing rules now; live channel execution starts after provider authorization.</p></div>
        <Card><CardHeader><CardTitle>Create flow</CardTitle></CardHeader><CardContent>
          <form className="grid gap-4 md:grid-cols-4" onSubmit={(event) => {
            event.preventDefault();
            createFlow.mutate({ data: { name, triggerType, actionText } }, { onSuccess: () => { setName(""); setActionText(""); refresh(); } });
          }}>
            <div className="space-y-2"><Label htmlFor="flow-name">Name</Label><Input id="flow-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="flow-trigger">Trigger</Label><select id="flow-trigger" className="h-10 w-full rounded-md border bg-background px-3" value={triggerType} onChange={(e) => setTriggerType(e.target.value as typeof triggerType)}><option value="keyword">Keyword</option><option value="new_lead">New lead</option><option value="webhook">Webhook</option></select></div>
            <div className="space-y-2"><Label htmlFor="flow-action">Reply / action</Label><Input id="flow-action" value={actionText} onChange={(e) => setActionText(e.target.value)} required /></div>
            <Button className="self-end" disabled={createFlow.isPending}>Save flow</Button>
          </form>
        </CardContent></Card>
        <div className="grid gap-4 md:grid-cols-2">
          {flows.map((flow) => <Card key={flow.id}><CardContent className="flex items-center justify-between p-5"><div><div className="flex items-center gap-2"><p className="font-semibold">{flow.name}</p><Badge variant="outline">{flow.status}</Badge></div><p className="text-sm text-muted-foreground">{flow.triggerType.replace("_", " ")} → {flow.actionText}</p></div><Button variant="outline" onClick={() => updateFlow.mutate({ id: flow.id, data: { status: flow.status === "active" ? "paused" : "active" } }, { onSuccess: refresh })}>{flow.status === "active" ? "Pause" : "Activate"}</Button></CardContent></Card>)}
          {!flows.length && <p className="text-sm text-muted-foreground">No flows yet.</p>}
        </div>
      </div>
    </AppLayout>
  );
}
