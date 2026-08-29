import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { getGetWorkspaceQueryKey, useGetWorkspace, useUpdateWorkspace } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { data: workspace, isLoading } = useGetWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setSlug(workspace.slug);
    }
  }, [workspace]);

  return (
    <AppLayout>
      <div className="flex flex-col space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your workspace preferences.</p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-xl"></div>
          </div>
        ) : (
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Profile</CardTitle>
                <CardDescription>Update your workspace details and branding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ws-name">Workspace Name</Label>
                    <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ws-slug">Slug URL</Label>
                    <Input id="ws-slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
                  </div>
                </div>
                
                <div className="pt-4 flex items-center justify-between border-t border-border mt-4">
                  <div>
                    <p className="text-sm font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">You are on the {workspace?.plan} plan.</p>
                  </div>
                  <Badge variant="outline" className="capitalize px-4 py-1 text-sm">{workspace?.plan}</Badge>
                </div>
                
                <div className="pt-4">
                  <Button disabled={updateWorkspace.isPending} onClick={() => updateWorkspace.mutate({ data: { name, slug } }, { onSuccess: (updated) => { queryClient.setQueryData(getGetWorkspaceQueryKey(), updated); setMessage("Workspace settings saved."); }, onError: (error: any) => setMessage(error.message || "Unable to save settings.") })}>Save Changes</Button>
                  {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
