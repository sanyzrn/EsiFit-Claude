import { Link } from 'react-router-dom';
import {
  Dumbbell, Calculator, TrendingUp, Users, ChevronRight, Star,
  Target, BarChart3, Apple, MessageSquare, Flame, Zap, Shield,
  Activity, Heart, Award, ArrowUpRight
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import HomeSmartTools from '@/components/calculators/HomeSmartTools';
import { IconBadge } from '@/components/ui/IconBadge';
import { IMAGES } from '@/lib/media';
import { PAGE_CONTAINER_CLASS } from '@/components/ui/PageContainer';
import { useLocaleFormat } from '@/lib/locale-format-context';
import { PLANS } from '@/lib/store';

function StatsCard({ value, label, icon: Icon, color }: { value: string; label: string; icon: any; color: string }) {
  return (
    <div className="card-premium p-6 text-center hover:border-border-accent transition-all duration-[280ms] group">
      <div className={`w-12 h-12 rounded-xl bg-${color}-dim flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-[280ms]`}
        style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
        <Icon className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
      </div>
      <div className="text-3xl md:text-4xl font-black font-display animate-count" style={{ color: 'var(--theme-primary)' }}>
        {value}
      </div>
      <div className="text-sm mt-1" style={{ color: 'var(--theme-fg-subtle)' }}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, link, index }: { icon: any; title: string; desc: string; link: string; index: number }) {
  const colors = [
    { bg: 'var(--theme-primary-dim)', text: 'var(--theme-primary)' },
    { bg: 'var(--theme-accent-dim)', text: 'var(--theme-accent)' },
    { bg: 'var(--theme-secondary-dim)', text: 'var(--theme-secondary)' },
  ];
  const c = colors[index % colors.length];
  return (
    <Link
      to={link}
      className="group card-premium p-6 hover:border-border-accent transition-all duration-[280ms] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rounded-full opacity-[0.03]"
        style={{ backgroundColor: c.text }} />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-[280ms]"
          style={{ backgroundColor: c.bg }}>
          <Icon className="w-6 h-6" style={{ color: c.text }} />
        </div>
        <h3 className="text-lg font-bold mb-2 font-display group-hover:translate-x-0.5 transition-transform duration-[280ms]">{title}</h3>
        <p className="text-sm" style={{ color: 'var(--theme-fg-subtle)' }}>{desc}</p>
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: c.text }}>
          <span>{link.includes('pricing') ? 'View Plans' : link.includes('diet') ? 'View Plans' : 'Explore'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function TestimonialCard({ name, role, text, rating, index }: { name: string; role: string; text: string; rating: number; index: number }) {
  const avatars = ['AM', 'SK', 'JR'];
  return (
    <div className="card-premium p-6 animate-scale-in relative overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="absolute top-0 left-0 w-1 h-full rounded-r" style={{ backgroundColor: 'var(--theme-primary)' }} />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)' }}>
          {avatars[index]}
        </div>
        <div>
          <div className="font-bold text-sm">{name}</div>
          <div className="text-xs" style={{ color: 'var(--theme-fg-subtle)' }}>{role}</div>
        </div>
      </div>
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4" style={{ fill: 'var(--theme-primary)', color: 'var(--theme-primary)' }} />
        ))}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-fg-muted)' }}>"{text}"</p>
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const { formatTomanCompact } = useLocaleFormat();

  const features = [
    { icon: Dumbbell, title: t({ en: 'Exercise Library', fa: 'کتابخانه حرکات' }), desc: t({ en: 'Comprehensive database with video guides, muscle targeting, and difficulty levels.', fa: 'راهنمای جامع حرکات همراه با ویدیو، عضلات هدف، و سطوح دشواری.' }), link: '/exercises' },
    { icon: Target, title: t({ en: 'Training Programs', fa: 'برنامه‌های تمرینی' }), desc: t({ en: 'Structured programs from beginner to elite, matched to your specific goals.', fa: 'برنامه‌های ساختاریافته از مبتدی تا حرفه‌ای، متناسب با اهداف شما.' }), link: '/programs' },
    { icon: Apple, title: t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' }), desc: t({ en: 'Calorie-calculated meal plans with macros broken down per meal.', fa: 'برنامه‌های غذایی با محاسبه دقیق کالری و درشت‌مغذی‌ها در هر وعده.' }), link: '/diet' },
    { icon: Calculator, title: t({ en: 'Fitness Calculators', fa: 'ماشین‌حساب‌های فیتنس' }), desc: t({ en: '14 science-based calculators to understand your body and optimize training.', fa: '۱۴ ماشین حساب علمی برای کمک به درک بدن و بهینه‌سازی تمرینات.' }), link: '/calculators' },
    { icon: BarChart3, title: t({ en: 'Progress Tracking', fa: 'پیگیری پیشرفت' }), desc: t({ en: 'Log workouts and body measurements, visualize your gains with premium charts.', fa: 'ثبت تمرینات و سایزها، و مشاهده روند پیشرفت با نمودارهای حرفه‌ای.' }), link: '/dashboard/progress' },
    { icon: MessageSquare, title: t({ en: 'Coach Chat', fa: 'چت با مربی' }), desc: t({ en: 'Get personalized guidance from certified coaches via in-app messaging.', fa: 'دریافت راهنمایی اختصاصی از مربیان مجرب از طریق پیام‌رسان داخلی.' }), link: '/pricing' },
  ];

  const stats = [
    { value: t({ en: '100+', fa: '+۱۰۰' }), label: t({ en: 'Exercises', fa: 'حرکت تمرینی' }), icon: Dumbbell },
    { value: t({ en: '12', fa: '۱۲' }), label: t({ en: 'Programs', fa: 'برنامه تمرینی' }), icon: Target },
    { value: t({ en: '14', fa: '۱۴' }), label: t({ en: 'Smart Tools', fa: 'ابزار هوشمند' }), icon: Calculator },
    { value: t({ en: '24/7', fa: '۲۴/۷' }), label: t({ en: 'Support', fa: 'پشتیبانی' }), icon: Heart },
  ];

  const testimonials = [
    { name: t({ en: 'Alex M.', fa: 'الکس م.' }), role: t({ en: 'Gym Enthusiast', fa: 'بدنساز' }), text: t({ en: 'EsiFit\'s calculators and programs helped me lose 15 lbs in 3 months. The progress tracking keeps me accountable.', fa: 'برنامه‌ها و ماشین‌حساب‌های اسی‌فیت به من کمک کرد در ۳ ماه ۷ کیلو وزن کم کنم.' }), rating: 5 },
    { name: t({ en: 'Sarah K.', fa: 'سارا ک.' }), role: t({ en: 'Fitness Competitor', fa: 'ورزشکار مسابقه‌ای' }), text: t({ en: 'The VIP coaching feature is a game-changer. My coach reviews my program weekly and adjusts based on my progress.', fa: 'مربی VIP یک تغییر بزرگ بود. مربی من هر هفته برنامه مرا بر اساس پیشرفتم تنظیم می‌کند.' }), rating: 5 },
    { name: t({ en: 'James R.', fa: 'جیمز ر.' }), role: t({ en: 'Beginner', fa: 'مبتدی' }), text: t({ en: 'As someone new to the gym, the exercise library with detailed instructions gave me the confidence to start training.', fa: 'به عنوان فردی مبتدی، کتابخانه حرکات با توضیحات دقیق به من اعتماد به نفس شروع داد.' }), rating: 5 },
  ];

  return (
    <div>
      {/* ════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src={IMAGES.hero.src}
            alt={t(IMAGES.hero.alt)}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, var(--theme-app) 0%, rgba(7,8,10,0.7) 40%, rgba(7,8,10,0.85) 70%, var(--theme-app) 100%)'
        }} />
        <div className={`relative ${PAGE_CONTAINER_CLASS} py-20 md:py-32 w-full`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)', border: '1px solid var(--theme-border-accent)' }}>
                <div className="viz-live-dot" />
                {t({ en: 'Your Complete Fitness Platform', fa: 'پلتفرم جامع تناسب اندام شما' })}
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6 font-display">
                {t({ en: 'Train', fa: 'هوشمندانه' })}
                <br />
                <span className="inline-block mt-2" style={{ color: 'var(--theme-primary)' }}>
                  {t({ en: 'Smarter.', fa: 'تمرین کنید' })}
                </span>
                <br />
                <span className="inline-block mt-2">
                  {t({ en: 'Grow', fa: 'قوی‌تر' })}
                </span>
                <br />
                <span className="inline-block mt-2" style={{ color: 'var(--theme-accent)' }}>
                  {t({ en: 'Stronger.', fa: 'شوید.' })}
                </span>
              </h1>
              <p className="text-lg md:text-xl max-w-lg mb-10" style={{ color: 'var(--theme-fg-subtle)' }}>
                {t({ en: 'Programs, nutrition, calculators, and coaching — all in one platform. From your first rep to your personal records.', fa: 'برنامه‌ها، تغذیه، ماشین‌حساب‌ها، و مربی‌گری - همه در یک پلتفرم. از اولین تکرار تا ثبت رکوردهای شخصی شما.' })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-lg rounded-xl transition-all duration-[280ms]"
                  style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}
                >
                  {t({ en: 'Start Free Today', fa: 'همین امروز رایگان شروع کنید' })}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:!rotate-180" />
                </Link>
                <Link
                  to="/calculators"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-lg rounded-xl transition-all duration-[280ms]"
                  style={{ backgroundColor: 'var(--theme-elevated)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border-strong)' }}
                >
                  {t({ en: 'Try Free Tools', fa: 'ابزارهای رایگان' })}
                  <Zap className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                </Link>
              </div>
            </div>

            {/* Hero Right - Stats showcase */}
            <div className="hidden lg:grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              {[
                { value: '100+', label: t({ en: 'Exercises', fa: 'حرکات' }), icon: Dumbbell, color: 'var(--theme-primary)' },
                { value: '14', label: t({ en: 'Calculators', fa: 'ماشین حساب' }), icon: Calculator, color: 'var(--theme-accent)' },
                { value: '12', label: t({ en: 'Programs', fa: 'برنامه‌ها' }), icon: Target, color: 'var(--theme-secondary)' },
                { value: '24/7', label: t({ en: 'Support', fa: 'پشتیبانی' }), icon: Heart, color: 'var(--theme-primary)' },
              ].map((item, i) => (
                <div key={i} className="card-premium p-6 text-center relative overflow-hidden group">
                  <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-[0.04]"
                    style={{ backgroundColor: item.color }} />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div className="text-3xl font-black font-display mb-1" style={{ color: 'var(--theme-primary)' }}>
                      {item.value}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--theme-fg-subtle)' }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          METRICS BAR
          ════════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--theme-border)', borderBottom: '1px solid var(--theme-border)', backgroundColor: 'color-mix(in srgb, var(--theme-surface) 50%, transparent)' }}>
        <div className={`${PAGE_CONTAINER_CLASS} py-8`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up-children">
            {stats.map((stat, i) => (
              <StatsCard key={i} value={stat.value} label={stat.label} icon={stat.icon} color="brand" />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES GRID
          ════════════════════════════════════════ */}
      <section className={`${PAGE_CONTAINER_CLASS} py-24`}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)', border: '1px solid var(--theme-border-accent)' }}>
            <Zap className="w-3.5 h-3.5" />
            {t({ en: 'All-in-One Platform', fa: 'پلتفرم جامع' })}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 font-display">
            {t({ en: 'Everything You Need', fa: 'هر آنچه نیاز دارید' })}
          </h2>
          <p className="text-lg mx-auto max-w-2xl" style={{ color: 'var(--theme-fg-subtle)' }}>
            {t({ en: 'A comprehensive suite of tools designed to support every aspect of your fitness journey.', fa: 'مجموعه‌ای جامع از ابزارهایی که برای پشتیبانی از تمام جنبه‌های سفر تناسب اندام شما طراحی شده‌اند.' })}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up-children">
          {features.map((feat, i) => (
            <FeatureCard key={i} {...feat} index={i} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SMART TOOLS
          ════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'color-mix(in srgb, var(--theme-surface) 60%, transparent)' }}>
        <div className={`${PAGE_CONTAINER_CLASS} py-24`}>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 font-display">
              {t({ en: 'Smart Tools', fa: 'ابزارهای هوشمند' })}
            </h2>
            <p className="text-lg mx-auto max-w-2xl" style={{ color: 'var(--theme-fg-subtle)' }}>
              {t({ en: 'Quick calculators right on your home screen. Tap any for a detailed view.', fa: 'ماشین حساب‌های سریع در صفحه اصلی. برای مشاهده دقیق روی هرکدام کلیک کنید.' })}
            </p>
          </div>
          <HomeSmartTools />
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING TEASER
          ════════════════════════════════════════ */}
      <section className={`${PAGE_CONTAINER_CLASS} py-24`}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ backgroundColor: 'var(--theme-accent-dim)', color: 'var(--theme-accent)', border: '1px solid rgba(255,107,53,0.2)' }}>
            <Award className="w-3.5 h-3.5" />
            {t({ en: 'Plans for Every Level', fa: 'برنامه‌هایی برای هر سطح' })}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 font-display">
            {t({ en: 'Start Free, Upgrade as You Grow', fa: 'رایگان شروع کنید، با پیشرفت ارتقا دهید' })}
          </h2>
          <p className="text-lg mx-auto max-w-2xl" style={{ color: 'var(--theme-fg-subtle)' }}>
            {t({ en: 'No commitment required. Upgrade when you\'re ready for more.', fa: 'بدون هیچ تعهدی. هر وقت آماده بودید ارتقا دهید.' })}
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {PLANS.map((plan, i) => {
            const highlight = plan.tier === 'VIP';
            const colors = ['#06d6a0', '#ff6b35', '#4cc9f0', '#ffbe0b'];
            return (
              <div
                key={plan.tier}
                className={`card-premium p-6 text-center transition-all duration-[280ms] ${
                  highlight ? 'border-border-accent scale-[1.02]' : ''
                }`}
              >
                {highlight && (
                  <div className="text-xs font-bold mb-3 px-3 py-1 rounded-full inline-block"
                    style={{ backgroundColor: 'var(--theme-primary-dim)', color: 'var(--theme-primary)' }}>
                    {t({ en: 'Most Popular', fa: 'محبوب‌ترین' })}
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `color-mix(in srgb, ${colors[i]} 15%, transparent)` }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                </div>
                <div className="text-lg font-bold mb-1 font-display">{plan.name}</div>
                <div className="text-3xl font-black font-display mb-1" style={{ color: 'var(--theme-primary)' }}>
                  {formatTomanCompact(plan.priceMonthly)}
                </div>
                <div className="text-xs" style={{ color: 'var(--theme-fg-subtle)' }}>
                  {t({ en: '/month', fa: '/ماهیانه' })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link to="/pricing" className="inline-flex items-center gap-2 font-semibold text-sm transition-all duration-[280ms]"
            style={{ color: 'var(--theme-primary)' }}>
            {t({ en: 'View Full Comparison', fa: 'مشاهده مقایسه کامل' })}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════ */}
      <section className="py-24" style={{
        borderTop: '1px solid var(--theme-border)',
        borderBottom: '1px solid var(--theme-border)',
        backgroundColor: 'color-mix(in srgb, var(--theme-surface) 60%, transparent)'
      }}>
        <div className={`${PAGE_CONTAINER_CLASS}`}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 font-display">
              {t({ en: 'Trusted by Athletes', fa: 'مورد اعتماد ورزشکاران' })}
            </h2>
            <p className="text-lg mx-auto max-w-2xl" style={{ color: 'var(--theme-fg-subtle)' }}>
              {t({ en: 'Join thousands who have transformed their fitness journey with EsiFit.', fa: 'به هزاران نفری بپیوندید که سفر تناسب اندام خود را با اسی‌فیت متحول کرده‌اند.' })}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tval, i) => (
              <TestimonialCard key={i} {...tval} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA
          ════════════════════════════════════════ */}
      <section className={`${PAGE_CONTAINER_CLASS} py-24`}>
        <div className="relative card-premium overflow-hidden p-12 md:p-16 text-center"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 30%, var(--theme-primary-dim), transparent 70%),
                        radial-gradient(ellipse 40% 30% at 70% 80%, var(--theme-accent-dim), transparent 60%),
                        var(--theme-surface)`
          }}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'var(--theme-primary-dim)' }}>
              <Activity className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 font-display">
              {t({ en: 'Ready to Transform?', fa: 'آماده تغییر؟' })}
            </h2>
            <p className="text-lg mb-10" style={{ color: 'var(--theme-fg-subtle)' }}>
              {t({ en: 'Join EsiFit today and get access to programs, calculators, and coaching tools — all free to start.', fa: 'همین امروز به اسی‌فیت بپیوندید و به برنامه‌ها، ماشین‌حساب‌ها و ابزارهای مربی‌گری دسترسی پیدا کنید - شروع کاملا رایگان.' })}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-10 py-4 font-bold text-lg rounded-xl transition-all duration-[280ms]"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}
              >
                {t({ en: 'Create Free Account', fa: 'ساخت حساب رایگان' })}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/programs"
                className="group inline-flex items-center gap-2 px-10 py-4 font-bold text-lg rounded-xl transition-all duration-[280ms]"
                style={{ backgroundColor: 'var(--theme-elevated)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border-strong)' }}
              >
                {t({ en: 'Browse Programs', fa: 'مشاهده برنامه‌ها' })}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
