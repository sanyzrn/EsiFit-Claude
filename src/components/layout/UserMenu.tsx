import { Link } from 'react-router-dom';
import { User, LogOut, ChevronDown, LayoutDashboard, Shield, GraduationCap } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useEntitlements } from '@/lib/entitlements';

type UserMenuProps = {
  user: { name?: string };
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
  subscriptionTier: string;
};

export function UserMenu({ user, open, onToggle, onClose, onLogout, subscriptionTier }: UserMenuProps) {
  const { t } = useI18n();
  const { role } = useEntitlements();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-elevated transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white">
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-medium max-w-[8rem] truncate">{user.name}</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-accent/15 text-accent font-medium">
          {subscriptionTier}
        </span>
        <ChevronDown className="w-4 h-4 text-fg-subtle" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 top-12 w-56 bg-surface border border-strong rounded-xl shadow-xl py-2 animate-fade-in z-50"
        >
          <Link
            to="/dashboard"
            role="menuitem"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> {t({ en: 'Dashboard', fa: 'داشبورد' })}
          </Link>
          <Link
            to="/dashboard/profile"
            role="menuitem"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors"
          >
            <User className="w-4 h-4" /> {t({ en: 'Profile', fa: 'پروفایل' })}
          </Link>
          {role === 'COACH' && (
            <Link
              to="/coach"
              role="menuitem"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors text-accent"
            >
              <GraduationCap className="w-4 h-4" /> {t({ en: 'Coach Dashboard', fa: 'داشبورد مربی' })}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link
              to="/admin"
              role="menuitem"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors text-accent"
            >
              <Shield className="w-4 h-4" /> {t({ en: 'Admin Panel', fa: 'پنل مدیریت' })}
            </Link>
          )}
          <hr className="my-2 border-strong" />
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-elevated transition-colors"
          >
            <LogOut className="w-4 h-4" /> {t({ en: 'Sign Out', fa: 'خروج' })}
          </button>
        </div>
      )}
    </div>
  );
}
