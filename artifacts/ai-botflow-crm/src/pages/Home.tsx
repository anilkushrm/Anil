import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetSession } from "@workspace/api-client-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: session, isLoading } = useGetSession();

  useEffect(() => {
    if (!isLoading) {
      if (session?.authenticated) {
        if (!session.workspace) {
          setLocation("/onboarding");
        } else {
          setLocation("/dashboard");
        }
      } else {
        setLocation("/login");
      }
    }
  }, [session, isLoading, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/20"></div>
        <div className="h-4 w-32 bg-muted rounded"></div>
      </div>
    </div>
  );
}
