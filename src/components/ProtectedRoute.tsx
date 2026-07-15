import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { getState } from '@/lib/store';
import { useEntitlements } from '@/lib/entitlements';
import type { Role } from '@/lib/types';
import { useSyncExternalStore } from 'react';
import { subscribe } from '@/lib/store';

/**
 * Client-side auth/role gate for UX redirects only.
 * Security is enforced server-side via JWT on protected API routes
 * (backend requireAuth / requireRole).
 */
export function ProtectedRoute({
  children,
  roles,
  redirectTo = '/login',
}: {
  children: ReactNode;
  /** If set, user must have one of these roles (e.g. ADMIN, COACH). */
  roles?: Role[];
  redirectTo?: string;
}) {
  const location = useLocation();
  const user = useSyncExternalStore(subscribe, () => getState().currentUser, () => null);
  const { role, loading } = useEntitlements();

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0) {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[40vh]" role="status">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (!roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

/** Alias emphasizing role checks — same as ProtectedRoute with roles. */
export function RoleGate({
  children,
  roles,
}: {
  children: ReactNode;
  roles: Role[];
}) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}
