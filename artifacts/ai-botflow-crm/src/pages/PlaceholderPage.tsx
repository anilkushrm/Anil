import { AppLayout } from "@/components/layout/AppLayout";

export default function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-muted/50">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold text-foreground">Module in development</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              This section is currently being built and will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
