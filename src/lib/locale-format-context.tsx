import { createContext, useContext, useState, type ReactNode } from 'react';
import { useI18n } from './i18n';
import {
  type CalendarPreference,
  getStoredCalendar,
  setStoredCalendar,
  formatDate,
  formatTime,
  formatNumber,
  formatToman,
  formatTomanCompact,
  toPersianDigits,
} from './locale-format';

interface LocaleFormatContextType {
  calendar: CalendarPreference;
  setCalendar: (pref: CalendarPreference) => void;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatToman: (amount: number) => string;
  formatTomanCompact: (amount: number) => string;
  toPersianDigits: (input: string | number) => string;
}

const LocaleFormatContext = createContext<LocaleFormatContextType | null>(null);

export function LocaleFormatProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [calendar, setCalendarState] = useState<CalendarPreference>(() => getStoredCalendar(lang));
  const [syncedLang, setSyncedLang] = useState(lang);

  // Derive calendar when language changes and user has no explicit preference (render-time sync)
  if (syncedLang !== lang) {
    setSyncedLang(lang);
    try {
      const stored = localStorage.getItem('esifit_calendar');
      if (!stored) {
        setCalendarState(lang === 'fa' ? 'jalali' : 'gregorian');
      }
    } catch {
      setCalendarState(lang === 'fa' ? 'jalali' : 'gregorian');
    }
  }

  const setCalendar = (pref: CalendarPreference) => {
    setCalendarState(pref);
    setStoredCalendar(pref);
  };

  const value: LocaleFormatContextType = {
    calendar,
    setCalendar,
    formatDate: (date, options) => formatDate(date, lang, calendar, options),
    formatTime: (date, options) => formatTime(date, lang, options),
    formatNumber: (value, options) => formatNumber(value, lang, options),
    formatToman: (amount) => formatToman(amount, lang),
    formatTomanCompact: (amount) => formatTomanCompact(amount, lang),
    toPersianDigits: (input) => toPersianDigits(input, lang),
  };

  return (
    <LocaleFormatContext.Provider value={value}>
      {children}
    </LocaleFormatContext.Provider>
  );
}

export function useLocaleFormat() {
  const ctx = useContext(LocaleFormatContext);
  if (!ctx) throw new Error('useLocaleFormat must be used inside LocaleFormatProvider');
  return ctx;
}
