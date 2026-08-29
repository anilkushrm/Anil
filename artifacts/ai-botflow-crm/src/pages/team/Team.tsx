import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListTeamMembers, useInviteTeamMember, getListTeamMembersQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

export default function Team() {
  const { data: members = [], isLoading } = useListTeamMembers();
  const inviteMember = useInviteTeamMember();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    inviteMember.mutate({
      data: { email, role: "agent" }
    }, {
      onSuccess: (result) => {
        setEmail("");
        const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
        setInviteLink(`${window.location.origin}${basePath}/accept-invite/${result.inviteToken}`);
        queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your team members and their roles.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium">Invite Member</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create a secure one-time link to bring a new agent into your workspace.
            </p>
            <form onSubmit={handleInvite} className="space-y-4 bg-card p-6 rounded-xl border border-border">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="agent@company.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={inviteMember.isPending} data-testid="button-create-invite">
                Create Invite Link
              </Button>
              {inviteLink && (
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                  <Label htmlFor="inviteLink">Share this link</Label>
                  <Input id="inviteLink" value={inviteLink} readOnly data-testid="input-invite-link" />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                    data-testid="button-copy-invite"
                  >
                    Copy Invite Link
                  </Button>
                  <p className="text-xs text-muted-foreground">The link expires in 7 days and can be used once.</p>
                </div>
              )}
            </form>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Loading team members...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="font-medium">{member.name || "Pending..."}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={member.status === "active" ? "success" : "warning"}
                            className="capitalize"
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
