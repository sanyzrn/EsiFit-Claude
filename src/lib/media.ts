/**
 * Curated fitness imagery — diverse, relatable training contexts.
 * Unsplash/Pexels URLs (no local binary assets required).
 */
export const IMAGES = {
  hero: {
    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80&auto=format&fit=crop',
    alt: {
      en: 'People training together in a bright modern gym',
      fa: 'افراد در حال تمرین گروهی در باشگاهی روشن',
    },
  },
  programs: {
    'beginner-full-body': {
      src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'Beginner full-body strength training', fa: 'تمرین قدرتی تمام‌بدن برای مبتدیان' },
    },
    'hypertrophy-upper-lower': {
      src: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'Hypertrophy upper body workout', fa: 'تمرین عضله‌سازی بالاتنه' },
    },
    'strength-powerlifting': {
      src: 'https://images.unsplash.com/photo-1574680096145-d05b474e215a?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'Powerlifter preparing for a heavy squat', fa: 'پاورلیفتر در حال آماده‌سازی برای اسکوات سنگین' },
    },
    'fat-loss-circuit': {
      src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'High-intensity circuit training for fat loss', fa: 'تمرین مداری شدید برای چربی‌سوزی' },
    },
    'push-pull-legs': {
      src: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'Push pull legs split training session', fa: 'جلسه تمرین اسپلیت پوش-پول-پا' },
    },
  },
  diet: {
    'clean-bulk-3000': {
      src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'Balanced high-protein meal for muscle gain', fa: 'وعده غذایی متعادل پرپروتئین برای عضله‌سازی' },
    },
    'fat-loss-1800': {
      src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'Fresh salad bowl for fat loss nutrition', fa: 'کاسه سالاد تازه برای رژیم چربی‌سوزی' },
    },
    'maintenance-2500': {
      src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'Colorful maintenance meal with vegetables and grains', fa: 'وعده نگهدارنده رنگارنگ با سبزیجات و غلات' },
    },
    'high-protein-cut-2200': {
      src: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80&auto=format&fit=crop',
      alt: { en: 'Grilled salmon with vegetables — high protein cut', fa: 'ماهی کبابی با سبزیجات — برش پرپروتئین' },
    },
  },
} as const;

export function programImage(slug: string) {
  return IMAGES.programs[slug as keyof typeof IMAGES.programs] ?? null;
}

export function dietImage(slug: string) {
  return IMAGES.diet[slug as keyof typeof IMAGES.diet] ?? null;
}
