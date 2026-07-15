import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'en' | 'fa';
export type Translatable = string | { en: string; fa: string };

export const faDict: Record<string, string> = {
  // Features
  'Basic macro tracking': 'ردیابی پایه درشت‌مغذی‌ها',
  '3 sample workout routines': '۳ برنامه تمرینی نمونه',
  'Body weight metrics': 'شاخص‌های وزن بدن',
  'Personalized macro targets': 'اهداف سفارشی درشت‌مغذی‌ها',
  'Full access to all programs': 'دسترسی کامل به تمامی برنامه‌ها',
  'Progress photo gallery': 'گالری عکس‌های پیشرفت',
  'Priority email support': 'پشتیبانی ایمیل با اولویت',
  '1-on-1 coach messaging': 'ارسال پیام ۱ به ۱ با مربی',
  'Custom weekly program adjustments': 'تغییرات کلیدی سفارشی برنامه در هفته',
  'Video form reviews': 'بررسی فرم حرکات با ویدیو',
  '24/7 dedicated coach': 'تخصیص مربی اختصاصی ۲۴/۷',
  
  // Body type quiz — questions
  'What is your natural body build?': 'هیکل طبیعی شما چگونه است؟',
  'How easily do you gain weight?': 'چقدر راحت وزن اضافه می‌کنید؟',
  'What is your wrist circumference?': 'دور مچ دست شما چقدر است؟',
  'How would you describe your shoulders?': 'شانه‌های شما را چگونه توصیف می‌کنید؟',
  'What happens when you skip workouts for a week?': 'اگر یک هفته تمرین نکنید چه می‌شود؟',
  'How is your metabolism?': 'متابولیسم شما چگونه است؟',
  'Thin, narrow shoulders and hips': 'لاغر، شانه‌ها و باسن باریک',
  'Medium build, broad shoulders': 'هیکل متوسط، شانه‌های پهن',
  'Wider build, stores fat easily': 'هیکل پهن، به راحتی چربی ذخیره می‌کند',
  'Very hard to gain weight': 'افزایش وزن بسیار سخت است',
  'Can gain/lose relatively easily': 'نسبتاً راحت وزن کم یا زیاد می‌کند',
  'Gain weight easily, hard to lose': 'به راحتی وزن می‌گیرد، کاهش وزن سخت است',
  'Small (under 16 cm)': 'کوچک (کمتر از ۱۶ سانتی‌متر)',
  'Medium (16–18 cm)': 'متوسط (۱۶ تا ۱۸ سانتی‌متر)',
  'Large (over 18 cm)': 'بزرگ (بیش از ۱۸ سانتی‌متر)',
  'Narrower than my hips': 'باریک‌تر از باسن من',
  'Same width or wider than hips': 'هم‌عرض یا پهن‌تر از باسن',
  'Wide but rounded': 'پهن اما گرد',
  'I lose muscle and weight quickly': 'به سرعت عضله و وزن کم می‌کنم',
  'Not much changes': 'تغییر زیادی نمی‌کند',
  'I tend to gain fat': 'تمایل به افزایش چربی دارم',
  'Very fast — I can eat a lot without gaining': 'بسیار سریع — می‌توانم زیاد بخورم بدون افزایش وزن',
  'Moderate — predictable': 'متوسط — قابل پیش‌بینی',
  'Slow — everything seems to stick': 'کند — همه چیز به سرعت جذب می‌شود',

  // Admin & Coach & Diet & Exercise etc
  'Admin Dashboard': 'داشبورد مدیریت',
  'Manage users, content, and revenue': 'مدیریت کاربران، محتوا و درآمد',
  'Overview': 'نمای کلی',
  'Users': 'کاربران',
  'Exercises': 'تمرین‌ها',
  'Programs': 'برنامه‌ها',
  'Diet Plans': 'برنامه‌های غذایی',
  'Articles': 'مقاله‌ها',
  'MRR': 'درآمد ماهانه',
  'Total Users': 'کل کاربران',
  'New This Week': 'جدید در این هفته',
  'Paid Subscribers': 'مشترکین پولی',
  'Revenue by Plan': 'درآمد بر اساس طرح',
  'users': 'کاربران',
  'Recent Support Tickets': 'تیکت‌های پشتیبانی اخیر',
  'open': 'باز',
  'closed': 'بسته',
  'No recent tickets': 'تیکت اخیری وجود ندارد',
  'Search users...': 'جستجوی کاربران...',
  'Name / Email': 'نام / ایمیل',
  'Role': 'نقش',
  'Tier': 'طرح',
  'Joined': 'تاریخ عضویت',
  'Coach Dashboard': 'داشبورد مربی',
  'Manage clients, programs, and messages': 'مدیریت مشتریان، برنامه‌ها و پیام‌ها',
  'My Clients': 'مشتریان من',
  'Messages': 'پیام‌ها',
  'Search clients...': 'جستجوی مشتریان...',
  'Active Plan': 'طرح فعال',
  'Last Check-in': 'آخرین بررسی',
  'View Details': 'مشاهده جزئیات',
  'Select a client to view messages': 'برای مشاهده پیام‌ها یک مشتری انتخاب کنید',
  'Send': 'ارسال',
  'Diet Plans & Nutrition': 'برنامه‌های غذایی و تغذیه',
  'Professional nutrition plans tailored to your goals.': 'برنامه‌های تغذیه حرفه‌ای متناسب با اهداف شما.',
  'Search plans...': 'جستجوی برنامه‌ها...',
  'calories': 'کالری',
  'protein': 'پروتئین',
  'carbs': 'کربوهیدرات',
  'fat': 'چربی',
  'Nutrition Guide': 'راهنمای تغذیه',
  'Fitness & Nutrition Articles': 'مقاله‌های تناسب اندام و تغذیه',
  'Expert advice, workout tips, and nutritional guides.': 'توصیه‌های تخصصی، نکات تمرینی و راهنماهای تغذیه.',
  'Read More': 'بیشتر بخوانید',
  'Exercise Library': 'کتابخانه تمرین‌ها',
  'Search exercises...': 'جستجوی تمرین‌ها...',
  'Search by name or muscle...': 'جستجو بر اساس نام یا عضله...',
  'All Types': 'همه انواع',
  'All Difficulties': 'همه سطوح دشواری',
  'No exercises found': 'هیچ تمرینی یافت نشد',
  'Strength': 'قدرتی',
  'Cardio': 'هوازی',
  'Mobility': 'تحرک',
  'Beginner': 'مبتدی',
  'Intermediate': 'متوسط',
  'Advanced': 'پیشرفته',
  'Instructions': 'دستورالعمل‌ها',
  'Common Mistakes': 'اشتباهات رایج',

  // Programs
  'Full Body Foundation': 'برنامه پایه تمام بدن',
  'Upper/Lower Split': 'تقسیم‌بندی بالاتنه/پایین‌تنه',
  'Push Pull Legs': 'برنامه کششی، پرسی و پا',
  'Perfect for beginners. Focuses on compound movements to build a solid base of strength.': 'برای مبتدیان عالی است. تمرکز بر حرکات ترکیبی برای ایجاد یک پایه قدرتی قوی و محکم.',
  'A balanced 4-day routine targeting hypertrophy and strength development.': 'یک برنامه متعادل ۴ روزه با هدف هیپرتروفی و افزایش قدرت عضلانی.',
  'Advanced 6-day split for maximizing muscle growth and recovery.': 'یک تقسیم پیشرفته ۶ روزه برای به حداکثر رساندن رشد عضلانی.',
  'Full Body A': 'تمام بدن A',
  'Full Body B': 'تمام بدن B',
  'Upper Body Focus': 'تمرکز بالاتنه',
  'Lower Body Focus': 'تمرکز پایین‌تنه',
  'Upper Body Hypertrophy': 'هیپرتروفی بالاتنه',
  'Lower Body Hypertrophy': 'هیپرتروفی پایین‌تنه',
  'Push (Chest/Shoulders/Triceps)': 'کشش (سینه/شانه‌ها/پشت بازو)',
  'Pull (Back/Biceps)': 'کشش (پشت/جلو بازو)',
  'Legs Focus': 'تمرکز روی پاها',
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (str: Translatable | null | undefined, ...args: (string | number)[]) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('esifit_lang') as Language) || 'fa';
    } catch {
      return 'fa';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('esifit_lang', newLang);
    } catch {
      // Ignore localStorage quota or privacy errors.
    }
  };

  const isRtl = lang === 'fa';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    if (isRtl) {
      document.documentElement.classList.add('farsi-font');
    } else {
      document.documentElement.classList.remove('farsi-font');
    }
  }, [lang, isRtl]);

  const t = (str: Translatable | null | undefined, ...args: (string | number)[]) => {
    if (!str) return '';
    let result = typeof str === 'string'
      ? (lang === 'fa' && faDict[str] ? faDict[str] : str)
      : (str[lang] || str.fa || str.en || '');
    args.forEach((arg, i) => {
      result = result.replace(new RegExp(`\\{${i}\\}`, 'g'), String(arg));
    });
    return result;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
