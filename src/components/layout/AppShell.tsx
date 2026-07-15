import { useState, useEffect, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout, getState, subscribe } from '@/lib/store';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileMoreSheet } from './MobileMoreSheet';
import { HIDE_BOTTOM_NAV_PREFIXES } from './nav-config';

/** Full site chrome. Prefer nested routes with `<Outlet />`; `children` kept for backward compat. */
export function AppShell({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState(getState());
  const [moreOpen, setMoreOpen] = useState(false);
  const [navPath, setNavPath] = useState(location.pathname);

  useEffect(() => {
    const unsub = subscribe(() => setState(getState()));
    return () => { unsub(); };
  }, []);

  if (navPath !== location.pathname) {
    setNavPath(location.pathname);
    setMoreOpen(false);
  }

  const showBottomPad = !HIDE_BOTTOM_NAV_PREFIXES.some((p) => location.pathname.startsWith(p));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-app text-fg flex flex-col overflow-x-hidden">
      <TopNav user={state.currentUser} />

      <main className={`flex-1 ${showBottomPad ? 'pb-20 lg:pb-0' : ''}`}>
        {children ?? <Outlet />}
      </main>

      <Footer />

      <MobileBottomNav
        moreOpen={moreOpen}
        onMoreOpen={() => setMoreOpen((v) => !v)}
      />

      <MobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        isLoggedIn={!!state.currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
