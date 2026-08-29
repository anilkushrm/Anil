import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f8fb] p-4">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-display font-extrabold text-slate-900">
              Page not found
            </h1>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            This route does not exist in the current workspace.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
