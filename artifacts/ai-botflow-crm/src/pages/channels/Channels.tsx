import { AppLayout } from "@/components/layout/AppLayout";
import { useListChannels } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Instagram, Facebook, AlertCircle } from "lucide-react";

export default function Channels() {
  const { data: channels = [], isLoading } = useListChannels();

  const getIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageCircle className="h-8 w-8 text-green-500" />;
      case "instagram": return <Instagram className="h-8 w-8 text-pink-500" />;
      case "facebook": return <Facebook className="h-8 w-8 text-blue-500" />;
      default: return <MessageCircle className="h-8 w-8" />;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
          <p className="text-muted-foreground mt-1">Connect your messaging platforms to route into the unified inbox.</p>
        </div>
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>Channel cards below are setup records only. No Meta account is authorized and no live messages are sent until OAuth, Embedded Signup, and webhooks are connected.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-3 text-muted-foreground text-sm">Loading channels...</div>
          ) : (
            channels.map((channel) => (
              <Card key={channel.id} className="relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    {getIcon(channel.type)}
                    <Badge variant={channel.status === "connected" ? "success" : "secondary"}>
                      {channel.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardTitle className="capitalize mt-4">{channel.name}</CardTitle>
                  <CardDescription>
                    Provider authorization not configured
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Connect after Meta setup
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
