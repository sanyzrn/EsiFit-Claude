import { Link, Outlet } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { PAGE_CONTAINER_CLASS } from '@/components/ui/PageContainer';

/** Minimal chrome for Login / Register / Forgot / Reset — clean, branded, no site nav. */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-app text-fg flex flex-col overflow-x-hidden">
      <header className="border-b border-border bg-app">
        <div className={`${PAGE_CONTAINER_CLASS} h-16 flex items-center`}>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-[280ms] group-hover:scale-105"
              style={{ backgroundColor: 'var(--theme-primary)' }}>
              <Dumbbell className="w-5 h-5" style={{ color: 'var(--theme-primary-fg)' }} />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Esi<span style={{ color: 'var(--theme-primary)' }}>Fit</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}
