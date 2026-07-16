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
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-[180ms]"
        style={{ color: 'var(--theme-fg)' }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}>
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-medium max-w-[7rem] truncate">{user.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
          style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)' }}>
          {subscriptionTier}
        </span>
        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--theme-fg-subtle)' }} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 top-12 w-56 rounded-2xl py-2 border z-50 animate-scale-in"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)'
          }}
        >
          <Link
            to="/dashboard"
            role="menuitem"
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-[180ms]"
            style={{ color: 'var(--theme-fg-muted)' }}
          >
            <LayoutDashboard className="w-4 h-4" /> {t({ en: 'Dashboard', fa: 'داشبورد' })}
          </Link>
          <Link
            to="/dashboard/profile"
            role="menuitem"
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-[180ms]"
            style={{ color: 'var(--theme-fg-muted)' }}
          >
            <User className="w-4 h-4" /> {t({ en: 'Profile', fa: 'پروفایل' })}
          </Link>
          {role === 'COACH' && (
            <Link
              to="/coach"
              role="menuitem"
              onClick={onClose}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-[180ms]"
              style={{ color: 'var(--theme-accent)' }}
            >
              <GraduationCap className="w-4 h-4" /> {t({ en: 'Coach Dashboard', fa: 'داشبورد مربی' })}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link
              to="/admin"
              role="menuitem"
              onClick={onClose}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-[180ms]"
              style={{ color: 'var(--theme-accent)' }}
            >
              <Shield className="w-4 h-4" /> {t({ en: 'Admin Panel', fa: 'پنل مدیریت' })}
            </Link>
          )}
          <hr style={{ borderColor: 'var(--theme-border)', margin: '4px 0' }} />
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-[180ms]"
            style={{ color: 'var(--theme-error)' }}
          >
            <LogOut className="w-4 h-4" /> {t({ en: 'Sign Out', fa: 'خروج' })}
          </button>
        </div>
      )}
    </div>
  );
}
