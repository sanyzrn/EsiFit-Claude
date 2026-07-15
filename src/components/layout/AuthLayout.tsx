import { Link, Outlet } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { PAGE_CONTAINER_CLASS } from '@/components/ui/PageContainer';

/** Minimal chrome for Login / Register / Forgot / Reset — logo only, no site nav. */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-app text-fg flex flex-col overflow-x-hidden">
      <header className="border-b border-border bg-app/90 backdrop-blur-md">
        <div className={`${PAGE_CONTAINER_CLASS} h-14 flex items-center`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] bg-brand flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-brand-fg" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Esi<span className="text-brand">Fit</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
