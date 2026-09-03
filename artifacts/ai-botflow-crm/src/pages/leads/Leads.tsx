import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListLeads, useCreateLead, useUpdateLead, getListLeadsQueryKey, LeadStage } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Leads() {
  const [search, setSearch] = useState("");
  const { data: leads = [], isLoading } = useListLeads({ search });
  
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", source: "manual" as const, value: 0,
  });

  const handleCreateLead = (event: React.FormEvent) => {
    event.preventDefault();
    createLead.mutate({
      data: {
        ...form,
        stage: "new",
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
        setForm({ name: "", company: "", email: "", phone: "", source: "manual", value: 0 });
        setOpen(false);
      }
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "new": return "default";
      case "won": return "success";
      case "lost": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground mt-1">Manage your pipeline and track deals.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Lead</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add lead</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={handleCreateLead}>
            <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="lead-name">Name</Label><Input id="lead-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div><div className="space-y-2"><Label htmlFor="lead-company">Company</Label><Input id="lead-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="lead-email">Email</Label><Input id="lead-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div><div className="space-y-2"><Label htmlFor="lead-phone">Phone</Label><Input id="lead-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div><div className="space-y-2"><Label htmlFor="lead-source">Source</Label><select id="lead-source" className="h-10 w-full rounded-md border bg-background px-3" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as typeof form.source })}><option value="manual">Manual</option><option value="website">Website</option><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option></select></div><div className="space-y-2"><Label htmlFor="lead-value">Deal value</Label><Input id="lead-value" type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div></div><Button className="w-full" disabled={createLead.isPending}>Create lead</Button>
          </form></DialogContent></Dialog>
        </div>

        <div className="flex items-center max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search leads..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Messaging</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No leads found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.name}
                      {lead.company && <div className="text-xs text-muted-foreground font-normal">{lead.company}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.email}</div>
                      <div className="text-xs text-muted-foreground">{lead.phone}</div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={lead.stage}
                        aria-label={`Stage for ${lead.name}`}
                        disabled={updateLead.isPending}
                        className="h-8 rounded-md border bg-background px-2 text-sm capitalize"
                        onChange={(event) => updateLead.mutate({ id: lead.id, data: { stage: event.target.value as LeadStage } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }) })}
                      >
                        {["new", "contacted", "qualified", "proposal", "won", "lost"].map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                      </select>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground text-sm">
                      {lead.source}
                    </TableCell>
                    <TableCell>
                      <select
                        value={lead.messagingConsent}
                        aria-label={`Messaging consent for ${lead.name}`}
                        disabled={updateLead.isPending}
                        className="h-8 rounded-md border bg-background px-2 text-sm capitalize"
                        onChange={(event) => updateLead.mutate({
                          id: lead.id,
                          data: { messagingConsent: event.target.value as "unknown" | "opted_in" | "opted_out" },
                        }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }),
                        })}
                      >
                        <option value="unknown">Unknown</option>
                        <option value="opted_in">Opted in</option>
                        <option value="opted_out">Opted out</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${lead.value.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(lead.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
