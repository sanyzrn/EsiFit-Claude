import type { LucideIcon } from 'lucide-react';
import {
  Calculator,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  Target,
} from 'lucide-react';

export type NavLabel = { en: string; fa: string };

export type NavLink = {
  href: string;
  label: NavLabel;
};

export const PRIMARY_NAV: NavLink[] = [
  { href: '/calculators', label: { en: 'Calculators', fa: 'ماشین‌حساب‌ها' } },
  { href: '/programs', label: { en: 'Programs', fa: 'برنامه‌های تمرینی' } },
  { href: '/diet', label: { en: 'Diet Plans', fa: 'برنامه‌های غذایی' } },
  { href: '/exercises', label: { en: 'Exercises', fa: 'حرکات تمرینی' } },
];

export const SECONDARY_NAV: NavLink[] = [
  { href: '/blog', label: { en: 'Blog', fa: 'مقالات' } },
  { href: '/pricing', label: { en: 'Pricing', fa: 'تعرفه‌ها' } },
];

export const LOGGED_IN_QUICK_NAV: NavLink[] = [
  { href: '/dashboard', label: { en: 'Dashboard', fa: 'داشبورد' } },
  { href: '/dashboard/chat', label: { en: 'Messages', fa: 'پیام‌ها' } },
];

export type MobileTab = {
  href: string;
  label: NavLabel;
  icon: LucideIcon;
  isMore?: boolean;
};

export const MOBILE_TABS: MobileTab[] = [
  { href: '/', label: { en: 'Home', fa: 'خانه' }, icon: Home },
  { href: '/calculators', label: { en: 'Tools', fa: 'ابزارها' }, icon: Calculator },
  { href: '/programs', label: { en: 'Programs', fa: 'برنامه‌ها' }, icon: Target },
  { href: '/dashboard', label: { en: 'Dashboard', fa: 'داشبورد' }, icon: LayoutDashboard },
  { href: '#more', label: { en: 'More', fa: 'بیشتر' }, icon: MoreHorizontal, isMore: true },
];

/** Routes where the mobile bottom bar is hidden (auth flows). */
export const HIDE_BOTTOM_NAV_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
