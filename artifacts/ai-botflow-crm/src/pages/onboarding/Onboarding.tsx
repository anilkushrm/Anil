import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle2 } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const completeOnboarding = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f8fb] p-4">
      <Card className="w-full max-w-lg shadow-lg border-slate-200">
        <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto bg-[#d9f7e4] w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
            <Bot className="h-8 w-8 text-[#159447]" />
          </div>
          <CardTitle className="text-3xl font-bold">Set up your Workspace</CardTitle>
          <CardDescription className="text-base mt-2">
            Let's get your CRM ready for action in a few quick steps.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-lg">Account created</h4>
                <p className="text-sm text-muted-foreground">Your account has been successfully provisioned.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card opacity-50">
              <div className="w-6 h-6 rounded-full border-2 border-muted-foreground shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-muted-foreground">2</div>
              <div>
                <h4 className="font-semibold text-lg">Connect Channels</h4>
                <p className="text-sm text-muted-foreground">You can connect WhatsApp and Instagram from the Channels page later.</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pb-10 pt-4 flex justify-center">
          <Button size="lg" className="w-full md:w-auto px-12" onClick={completeOnboarding}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
