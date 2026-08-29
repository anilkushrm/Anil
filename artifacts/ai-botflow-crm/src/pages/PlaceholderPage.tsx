import { AppLayout } from "@/components/layout/AppLayout";

export default function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <AppLayout title={title} subtitle={description}>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1 text-xs">{description}</p>
        </div>
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-display font-bold text-slate-800">Module in development</h3>
            <p className="mb-4 mt-2 text-sm text-slate-500">
              This section is currently being built and will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
