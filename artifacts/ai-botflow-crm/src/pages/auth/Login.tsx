import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSessionQueryKey, useLogin, useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      loginMutation.mutate({
        data: {
          email,
          password,
          ...(workspaceSlug.trim() ? { workspaceSlug: workspaceSlug.trim().toLowerCase() } : {}),
        }
      }, {
        onSuccess: (session) => {
          queryClient.setQueryData(getGetSessionQueryKey(), session);
          if (session.workspace) {
            setLocation("/dashboard");
          } else {
            setLocation("/onboarding");
          }
        },
        onError: (err: any) => {
          setError(err.message || "Invalid credentials. Please try again.");
        }
      });
    } else {
      registerMutation.mutate({
        data: { email, password, name, workspaceName }
      }, {
        onSuccess: (session) => {
          queryClient.setQueryData(getGetSessionQueryKey(), session);
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          setError(err.message || "Could not create account. Please check your inputs.");
        }
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f8fb] p-4">
      <div className="mb-8 flex items-center gap-2 text-slate-900 font-display font-extrabold text-2xl">
        <span className="h-9 w-9 rounded-xl bg-[#22c55e] text-white flex items-center justify-center shadow-lg shadow-green-500/20"><Bot className="h-5 w-5" /></span>
        <span>Ai Botflow <span className="text-emerald-500">CRM</span></span>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Enter your credentials to access your workspace" 
              : "Set up your CRM and start closing deals faster"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md font-medium">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe" 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                autoComplete="email"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                autoComplete={isLogin ? "current-password" : "new-password"}
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
              />
            </div>

            {isLogin && (
              <div className="space-y-2">
                <Label htmlFor="workspaceSlug">Workspace slug <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  id="workspaceSlug"
                  autoComplete="organization"
                  value={workspaceSlug}
                  onChange={(e) => setWorkspaceSlug(e.target.value)}
                  placeholder="acme-team"
                />
                <p className="text-xs text-muted-foreground">
                  Needed only when your email belongs to multiple workspaces.
                </p>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input 
                  id="workspaceName" 
                  required 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Acme Corp" 
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold" 
              disabled={isPending}
              data-testid="button-submit-auth"
            >
              {isPending ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                className="font-medium text-primary hover:underline underline-offset-4"
                onClick={() => setIsLogin(!isLogin)}
                data-testid="link-toggle-auth"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
