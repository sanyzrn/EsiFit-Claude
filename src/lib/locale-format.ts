import type { Language } from './i18n';

export type CalendarPreference = 'jalali' | 'gregorian';

const CALENDAR_KEY = 'esifit_calendar';

/** Jalali by default for Farsi; Gregorian for English unless user overrides. */
export function getStoredCalendar(lang: Language): CalendarPreference {
  try {
    const value = localStorage.getItem(CALENDAR_KEY);
    if (value === 'jalali' || value === 'gregorian') return value;
  } catch {
    /* ignore */
  }
  return lang === 'fa' ? 'jalali' : 'gregorian';
}

export function setStoredCalendar(pref: CalendarPreference): void {
  try {
    localStorage.setItem(CALENDAR_KEY, pref);
  } catch {
    /* ignore */
  }
}

export function formatNumber(
  value: number,
  lang: Language,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', options).format(value);
}

/** Convert Latin digits in a string to Persian digits when lang is fa. */
export function toPersianDigits(input: string | number, lang: Language): string {
  const str = String(input);
  if (lang !== 'fa') return str;
  return str.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

/**
 * Format a date for display.
 * When calendar is jalali, uses Persian calendar (Intl) + Persian digits for fa.
 */
export function formatDate(
  date: Date | string | number,
  lang: Language,
  calendar: CalendarPreference,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
  const calendarOpt = calendar === 'jalali' ? 'persian' : 'gregory';

  try {
    return new Intl.DateTimeFormat(locale, {
      ...options,
      calendar: calendarOpt,
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat(locale, options).format(d);
  }
}

export function formatTime(
  date: Date | string | number,
  lang: Language,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-US', options).format(d);
}

/**
 * Prices are stored as integer Tomans (not USD cents).
 * FA: «۵۹۹٬۰۰۰ تومان»  EN: «599,000 Toman»
 */
export function formatToman(amountTomans: number, lang: Language): string {
  const formatted = formatNumber(amountTomans, lang, { maximumFractionDigits: 0 });
  if (lang === 'fa') return `${formatted} تومان`;
  return `${formatted} Toman`;
}

/** Compact price for cards: Free / 599k تومان */
export function formatTomanCompact(amountTomans: number, lang: Language): string {
  if (amountTomans === 0) {
    return lang === 'fa' ? 'رایگان' : 'Free';
  }
  if (amountTomans >= 1000 && amountTomans % 1000 === 0) {
    const thousands = amountTomans / 1000;
    const n = formatNumber(thousands, lang, { maximumFractionDigits: 0 });
    return lang === 'fa' ? `${n} هزار تومان` : `${n}k Toman`;
  }
  return formatToman(amountTomans, lang);
}
