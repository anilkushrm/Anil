import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import {
  getGetInvitationQueryKey,
  getGetSessionQueryKey,
  useAcceptInvitation,
  useGetInvitation,
} from "@workspace/api-client-react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AcceptInvite() {
  const [, params] = useRoute("/accept-invite/:token");
  const token = params?.token ?? "";
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const invitation = useGetInvitation(token, {
    query: {
      enabled: Boolean(token),
      queryKey: getGetInvitationQueryKey(token),
      retry: false,
    },
  });
  const acceptInvitation = useAcceptInvitation();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAccept = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    acceptInvitation.mutate({
      token,
      data: invitation.data?.needsPasswordSetup ? { name, password } : {},
    }, {
      onSuccess: (session) => {
        queryClient.setQueryData(getGetSessionQueryKey(), session);
        queryClient.removeQueries({ queryKey: getGetInvitationQueryKey(token) });
        setLocation("/dashboard");
      },
      onError: (requestError: any) => {
        setError(requestError.message || "This invitation could not be accepted.");
      },
    });
  };

  if (invitation.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="h-10 w-10 animate-pulse rounded-full bg-primary/20" aria-label="Loading invitation" />
      </div>
    );
  }

  if (!invitation.data || invitation.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation unavailable</CardTitle>
            <CardDescription>This link is invalid, expired, or has already been accepted.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full" data-testid="link-invite-login">Go to sign in</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8 flex items-center gap-2 text-primary font-bold text-2xl">
        <Bot className="h-8 w-8" />
        <span>Ai Botflow <span className="text-emerald-500">CRM</span></span>
      </div>
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader>
          <CardTitle>Join {invitation.data.workspaceName}</CardTitle>
          <CardDescription>
            Accept the invitation for {invitation.data.email} as {invitation.data.role}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAccept}>
          <CardContent className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</div>}
            {invitation.data.needsPasswordSetup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="inviteName">Full name</Label>
                  <Input
                    id="inviteName"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    data-testid="input-invite-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invitePassword">Create password</Label>
                  <Input
                    id="invitePassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    data-testid="input-invite-password"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={acceptInvitation.isPending} data-testid="button-accept-invite">
              {acceptInvitation.isPending ? "Joining workspace..." : "Accept invitation"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}