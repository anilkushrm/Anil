import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListTemplatesQueryKey, useCreateTemplate, useListTemplates, useUpdateTemplate } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Templates() {
  const { data: templates = [] } = useListTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"marketing" | "utility" | "authentication">("utility");
  const [body, setBody] = useState("");
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
  return <AppLayout><div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Message Templates</h1><p className="text-muted-foreground">Create reusable, categorized WhatsApp message copy.</p></div>
    <Card><CardHeader><CardTitle>New template</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createTemplate.mutate({ data: { name, category, body } }, { onSuccess: () => { setName(""); setBody(""); refresh(); } }); }}>
      <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="template-name">Name</Label><Input id="template-name" value={name} onChange={(e) => setName(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="template-category">Category</Label><select id="template-category" className="h-10 w-full rounded-md border bg-background px-3" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}><option value="marketing">Marketing</option><option value="utility">Utility</option><option value="authentication">Authentication</option></select></div></div>
      <div className="space-y-2"><Label htmlFor="template-body">Message</Label><Textarea id="template-body" value={body} onChange={(e) => setBody(e.target.value)} required /></div><Button disabled={createTemplate.isPending}>Save draft</Button>
    </form></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2">{templates.map((template) => <Card key={template.id}><CardContent className="space-y-3 p-5"><div className="flex justify-between"><p className="font-semibold">{template.name}</p><Badge variant="outline">{template.status}</Badge></div><p className="text-sm whitespace-pre-wrap">{template.body}</p><div className="flex items-center justify-between"><span className="text-xs uppercase text-muted-foreground">{template.category}</span><Button variant="outline" size="sm" onClick={() => updateTemplate.mutate({ id: template.id, data: { status: template.status === "approved" ? "draft" : "approved" } }, { onSuccess: refresh })}>{template.status === "approved" ? "Move to draft" : "Approve copy"}</Button></div></CardContent></Card>)}</div>
  </div></AppLayout>;
}
