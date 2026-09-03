import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useListConversations, 
  useListMessages, 
  useSendMessage,
  getListConversationsQueryKey,
  getListMessagesQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Instagram, Facebook, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const channelIcon = {
  whatsapp: <MessageCircle className="h-4 w-4 text-green-500" />,
  instagram: <Instagram className="h-4 w-4 text-pink-500" />,
  facebook: <Facebook className="h-4 w-4 text-blue-500" />,
};

export default function Inbox() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: conversations = [], isLoading: loadingConvs } = useListConversations({ search });
  const messageQueryId = activeConvId ?? "";
  const { data: messages = [], isLoading: loadingMsgs } = useListMessages(messageQueryId, {
    query: {
      enabled: Boolean(activeConvId),
      queryKey: getListMessagesQueryKey(messageQueryId),
    },
  });
  const sendMessage = useSendMessage();

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeConvId) return;

    sendMessage.mutate({
      id: activeConvId,
      data: { body: reply }
    }, {
      onSuccess: () => {
        setReply("");
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(activeConvId) });
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey({ search }) });
      },
      onError: (error) => {
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(activeConvId) });
        toast({
          variant: "destructive",
          title: "Message was not delivered",
          description: error instanceof Error ? error.message : "The failed attempt remains in delivery history.",
        });
      },
    });
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-border flex flex-col bg-muted/10">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-9 bg-background"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No conversations found.
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={cn(
                    "w-full text-left p-4 border-b border-border/50 hover:bg-muted/50 transition-colors",
                    activeConvId === conv.id ? "bg-muted" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-sm truncate pr-2 flex items-center gap-2">
                      {channelIcon[conv.channel]}
                      {conv.contactName}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate pr-6">
                    {conv.lastMessage}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {activeConvId ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-border flex items-center px-6 bg-card">
                <div className="font-semibold flex items-center gap-2">
                  {activeConv && channelIcon[activeConv.channel]}
                  {activeConv?.contactName}
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingMsgs ? (
                  <div className="text-center text-sm text-muted-foreground">Loading messages...</div>
                ) : (
                  messages.map((msg) => {
                    const isOutbound = msg.direction === "outbound";
                    return (
                      <div 
                        key={msg.id} 
                        className={cn(
                          "flex max-w-[75%]",
                          isOutbound ? "ml-auto justify-end" : ""
                        )}
                      >
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm",
                          isOutbound 
                            ? "bg-primary text-primary-foreground rounded-br-sm" 
                            : "bg-muted text-foreground rounded-bl-sm border border-border"
                        )}>
                          {msg.body}
                          <div className={cn(
                            "text-[10px] mt-1 opacity-70 text-right",
                            isOutbound ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isOutbound ? ` · ${msg.deliveryStatus.replace("_", " ")}` : ""}
                          </div>
                          {msg.deliveryError && (
                            <div className="mt-1 text-[10px] text-left opacity-90">
                              {msg.deliveryError}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-card border-t border-border">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!reply.trim() || sendMessage.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
