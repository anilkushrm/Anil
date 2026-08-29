import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListKnowledgeSourcesQueryKey, useCreateKnowledgeSource, useDeleteKnowledgeSource, useListKnowledgeSources } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Knowledge() {
  const { data: sources = [] } = useListKnowledgeSources();
  const createSource = useCreateKnowledgeSource();
  const deleteSource = useDeleteKnowledgeSource();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListKnowledgeSourcesQueryKey() });
  return <AppLayout><div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Knowledge Base</h1><p className="text-muted-foreground">Store verified FAQs and business context for your automation rules.</p></div>
    <Card><CardHeader><CardTitle>Add text source</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createSource.mutate({ data: { title, content } }, { onSuccess: () => { setTitle(""); setContent(""); refresh(); } }); }}><div className="space-y-2"><Label htmlFor="knowledge-title">Title</Label><Input id="knowledge-title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="knowledge-content">Content</Label><Textarea id="knowledge-content" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required /></div><Button>Save source</Button></form></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2">{sources.map((source) => <Card key={source.id}><CardContent className="space-y-3 p-5"><div className="flex justify-between"><p className="font-semibold">{source.title}</p><Badge variant="outline">{source.status}</Badge></div><p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{source.content}</p><Button variant="destructive" size="sm" onClick={() => deleteSource.mutate({ id: source.id }, { onSuccess: refresh })}>Delete</Button></CardContent></Card>)}</div>
  </div></AppLayout>;
}
