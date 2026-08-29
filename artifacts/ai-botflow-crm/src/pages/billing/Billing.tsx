import { useGetBilling } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function Billing() {
  const { data: billing } = useGetBilling();
  return <AppLayout><div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Billing & Plans</h1><p className="text-muted-foreground">Review your plan, wallet ledger, and channel pricing.</p></div>
    <div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle>Current plan</CardTitle></CardHeader><CardContent><Badge className="capitalize">{billing?.plan ?? "starter"}</Badge></CardContent></Card><Card><CardHeader><CardTitle>Wallet balance</CardTitle></CardHeader><CardContent className="text-3xl font-bold">₹{(billing?.walletBalance ?? 0).toFixed(2)}</CardContent></Card><Card><CardHeader><CardTitle>Social messaging</CardTitle></CardHeader><CardContent className="text-3xl font-bold">Free</CardContent></Card></div>
    <Card><CardHeader><CardTitle>WhatsApp pricing</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Marketing</p><p className="text-2xl font-bold">₹{billing?.pricing.marketing.toFixed(2)}</p><p className="text-xs text-muted-foreground">per message</p></div><div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Utility / authentication</p><p className="text-2xl font-bold">₹{billing?.pricing.utilityAuthentication.toFixed(2)}</p><p className="text-xs text-muted-foreground">per message</p></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Transaction history</CardTitle></CardHeader><CardContent className="space-y-3">{billing?.transactions.map((transaction) => <div key={transaction.id} className="flex justify-between border-b pb-3 text-sm"><div><p className="font-medium capitalize">{transaction.type}</p><p className="text-muted-foreground">{transaction.reference || "—"} · {formatDate(transaction.createdAt)}</p></div><p className="font-semibold">₹{transaction.amount.toFixed(2)}</p></div>)}{!billing?.transactions.length && <p className="text-sm text-muted-foreground">No transactions yet.</p>}</CardContent></Card>
    <p className="text-sm text-muted-foreground">Wallet top-ups and payment processing will be enabled after the payment provider integration.</p>
  </div></AppLayout>;
}
