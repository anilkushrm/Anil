import { AppLayout } from "@/components/layout/AppLayout";
import { useQueryClient } from "@tanstack/react-query";
import {
  completeEmbeddedChannelConnection,
  connectChannel,
  getListChannelsQueryKey,
  useListChannels,
  useUpdateChannel,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Instagram, Facebook, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FacebookSdk = {
  init(options: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
  login(
    callback: (response: { authResponse?: { code?: string } }) => void,
    options: Record<string, unknown>,
  ): void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

function loadFacebookSdk(appId: string, version: string): Promise<FacebookSdk> {
  return new Promise((resolve, reject) => {
    const initialize = () => {
      if (!window.FB) {
        reject(new Error("Meta Embedded Signup did not load."));
        return;
      }
      window.FB.init({ appId, cookie: true, xfbml: false, version });
      resolve(window.FB);
    };
    if (window.FB) {
      initialize();
      return;
    }
    window.fbAsyncInit = initialize;
    const existing = document.getElementById("facebook-jssdk");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.onerror = () => reject(new Error("Meta Embedded Signup could not be loaded."));
    document.body.appendChild(script);
  });
}

function waitForEmbeddedSignupAssets(): Promise<{ wabaId: string; phoneNumberId: string }> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("WhatsApp Embedded Signup did not return the selected business assets."));
    }, 120_000);
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith(".facebook.com") && event.origin !== "https://facebook.com") return;
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (payload?.type !== "WA_EMBEDDED_SIGNUP" || payload?.event !== "FINISH") return;
        const wabaId = String(payload.data?.waba_id ?? "");
        const phoneNumberId = String(payload.data?.phone_number_id ?? "");
        if (!wabaId || !phoneNumberId) return;
        window.clearTimeout(timeout);
        window.removeEventListener("message", onMessage);
        resolve({ wabaId, phoneNumberId });
      } catch {
        // Ignore unrelated window messages.
      }
    };
    window.addEventListener("message", onMessage);
  });
}

export default function Channels() {
  const { data: channels = [], isLoading } = useListChannels();
  const updateChannel = useUpdateChannel();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const startConnection = async (channelId: string) => {
    try {
      const connection = await connectChannel(channelId);
      if (connection.mode === "oauth") {
        window.location.assign(connection.authorizationUrl);
        return;
      }
      if (!connection.appId || !connection.configId || !connection.graphVersion || !connection.state) {
        throw new Error("WhatsApp Embedded Signup configuration is incomplete.");
      }
      const sdk = await loadFacebookSdk(connection.appId, connection.graphVersion);
      const assetsPromise = waitForEmbeddedSignupAssets();
      const code = await new Promise<string>((resolve, reject) => {
        sdk.login(async (response) => {
          const code = response.authResponse?.code;
          if (!code) {
            reject(new Error("WhatsApp Embedded Signup was cancelled or did not return an authorization code."));
            return;
          }
          resolve(code);
        }, {
          config_id: connection.configId,
          response_type: "code",
          override_default_response_type: true,
          extras: { feature: "whatsapp_embedded_signup" },
        });
      });
      const assets = await assetsPromise;
      await completeEmbeddedChannelConnection(channelId, { code, state: connection.state, ...assets });
      await queryClient.invalidateQueries({ queryKey: getListChannelsQueryKey() });
      toast({ title: "WhatsApp connected", description: "Live inbound and outbound delivery is ready." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection could not start",
        description: error instanceof Error ? error.message : "Check the managed Meta app configuration and try again.",
      });
    }
  };

  const disconnect = (channelId: string) => {
    updateChannel.mutate({ id: channelId, data: { status: "not_configured" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListChannelsQueryKey() });
        toast({ title: "Channel disconnected", description: "Stored authorization was removed." });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Channel could not be disconnected",
          description: error instanceof Error ? error.message : "Try again.",
        });
      },
    });
  };

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
          <p>Live delivery starts only after an owner or admin completes Meta authorization. Opt-outs and failed delivery attempts remain visible in the inbox history.</p>
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
                    {channel.status === "connected"
                      ? `${channel.accountName ?? "Meta account"}${channel.externalAccountId ? ` · ${channel.externalAccountId}` : ""}`
                      : channel.configurationReady
                        ? channel.mode === "embedded_signup" ? "Ready for WhatsApp Embedded Signup" : "Ready for Meta OAuth"
                        : "Managed Meta app configuration is required"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={channel.status === "connected" ? "outline" : "default"}
                    className="w-full"
                    disabled={updateChannel.isPending || (!channel.configurationReady && channel.status !== "connected")}
                    onClick={() => channel.status === "connected" ? disconnect(channel.id) : startConnection(channel.id)}
                  >
                    {channel.status === "connected"
                      ? "Disconnect"
                      : channel.mode === "embedded_signup" ? "Connect WhatsApp" : `Connect ${channel.name}`}
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
