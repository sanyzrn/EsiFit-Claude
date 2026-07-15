import { Link } from 'react-router-dom';
import { Dumbbell, Calculator, TrendingUp, Users, ChevronRight, Star, Zap, Target, BarChart3, Apple, MessageSquare } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import HomeSmartTools from '@/components/calculators/HomeSmartTools';
import { PersianPattern } from '@/components/ui/PersianPattern';
import { IconBadge } from '@/components/ui/IconBadge';
import { IMAGES } from '@/lib/media';

export default function Home() {
  const { t } = useI18n();

  const features = [
    { icon: Dumbbell, title: t({ en: 'Exercise Library', fa: 'کتابخانه حرکات' }), desc: t({ en: 'Comprehensive database with video guides, muscle targeting, and difficulty levels.', fa: 'راهنمای جامع حرکات همراه با ویدیو، عضلات هدف، و سطوح دشواری.' }), link: '/exercises' },
    { icon: Target, title: t({ en: 'Training Programs', fa: 'برنامه‌های تمرینی' }), desc: t({ en: 'Structured programs from beginner to elite, matched to your specific goals.', fa: 'برنامه‌های ساختاریافته از مبتدی تا حرفه‌ای، متناسب با اهداف شما.' }), link: '/programs' },
    { icon: Apple, title: t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' }), desc: t({ en: 'Calorie-calculated meal plans with macros broken down per meal.', fa: 'برنامه‌های غذایی با محاسبه دقیق کالری و درشت‌مغذی‌ها در هر وعده.' }), link: '/diet' },
    { icon: Calculator, title: t({ en: 'Fitness Calculators', fa: 'ماشین‌حساب‌های فیتنس' }), desc: t({ en: '13 interactive tools on Home; 14 dedicated calculator pages (BMI, TDEE, body fat, macros, 1RM with % table, and more).', fa: '۱۳ ابزار تعاملی در صفحه اصلی؛ ۱۴ صفحه ماشین‌حساب (BMI، چربی بدن، درشت‌مغذی‌ها، 1RM با جدول درصد، و غیره).' }), link: '/calculators' },
    { icon: BarChart3, title: t({ en: 'Progress Tracking', fa: 'پیگیری پیشرفت' }), desc: t({ en: 'Log workouts and body measurements, visualize your gains with charts.', fa: 'ثبت تمرینات و سایزها، و مشاهده روند پیشرفت با نمودار.' }), link: '/dashboard/progress' },
    { icon: MessageSquare, title: t({ en: 'Coach Chat', fa: 'چت با مربی' }), desc: t({ en: 'Get personalized guidance from certified coaches via in-app messaging.', fa: 'دریافت راهنمایی اختصاصی از مربیان مجرب از طریق پیام‌رسان داخلی.' }), link: '/pricing' },
  ];

  const stats = [
    { value: t({ en: '10+', fa: '+۱۰' }), label: t({ en: 'Exercises', fa: 'حرکت تمرینی' }) },
    { value: t({ en: '3', fa: '۳' }), label: t({ en: 'Programs', fa: 'برنامه تمرینی' }) },
    { value: t({ en: '13', fa: '۱۳' }), label: t({ en: 'Home tools', fa: 'ابزار صفحه اصلی' }) },
    { value: t({ en: '24/7', fa: '۲۴/۷' }), label: t({ en: 'Support', fa: 'پشتیبانی' }) },
  ];

  const testimonials = [
    { name: t({ en: 'Alex M.', fa: 'الکس م.' }), role: t({ en: 'Gym Enthusiast', fa: 'بدنساز' }), text: t({ en: 'EsiFit\'s calculators and programs helped me lose 15 lbs in 3 months. The progress tracking keeps me accountable.', fa: 'برنامه‌ها و ماشین‌حساب‌های اسی‌فیت به من کمک کرد در ۳ ماه ۷ کیلو وزن کم کنم.' }), rating: 5 },
    { name: t({ en: 'Sarah K.', fa: 'سارا ک.' }), role: t({ en: 'Fitness Competitor', fa: 'ورزشکار مسابقه‌ای' }), text: t({ en: 'The VIP coaching feature is a game-changer. My coach reviews my program weekly and adjusts based on my progress.', fa: 'مربی VIP یک تغییر بزرگ بود. مربی من هر هفته برنامه مرا بر اساس پیشرفتم تنظیم می‌کند.' }), rating: 5 },
    { name: t({ en: 'James R.', fa: 'جیمز ر.' }), role: t({ en: 'Beginner', fa: 'مبتدی' }), text: t({ en: 'As someone new to the gym, the exercise library with detailed instructions gave me the confidence to start training.', fa: 'به عنوان فردی مبتدی، کتابخانه حرکات با توضیحات دقیق به من اعتماد به نفس شروع داد.' }), rating: 5 },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMAGES.hero.src}
            alt={t(IMAGES.hero.alt)}
            className="w-full h-full object-cover opacity-30 scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-app/90 via-app/70 to-app" />
        <PersianPattern opacity={0.6} />
        <div className="absolute top-20 start-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 end-1/4 w-72 h-72 bg-accent/15 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-muted border border-brand/30 text-brand text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              {t({ en: 'Your Complete Fitness Platform', fa: 'پلتفرم جامع تناسب اندام شما' })}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] font-display">
              {t({ en: 'Train Smarter.', fa: 'هوشمندانه‌تر تمرین کنید.' })}
              <br />
              <span className="text-gradient-brand">
                {t({ en: 'Grow Stronger.', fa: 'قوی‌تر شوید.' })}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-fg-subtle max-w-2xl mx-auto mb-10">
              {t({ en: 'Programs, nutrition, calculators, and coaching — all in one platform. From your first rep to your personal records.', fa: 'برنامه‌ها، تغذیه، ماشین‌حساب‌ها، و مربی‌گری - همه در یک پلتفرم. از اولین تکرار تا ثبت رکوردهای شخصی شما.' })}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 gradient-brand text-[#1a1410] font-bold text-lg rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand/30 animate-pulse-glow"
              >
                {t({ en: 'Start Free Today', fa: 'همین امروز رایگان شروع کنید' })}
              </Link>
              <Link
                to="/calculators"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-elevated text-fg font-bold text-lg rounded-xl hover:bg-elevated-hover transition-colors border border-strong"
              >
                {t({ en: 'Try Free Calculators', fa: 'ماشین‌حساب‌های رایگان را امتحان کنید' })} <ChevronRight className="w-5 h-5 rtl:!rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-brand font-display">{stat.value}</div>
                <div className="text-sm text-fg-subtle mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{t({ en: 'Everything You Need to Succeed', fa: 'هر آنچه برای موفقیت نیاز دارید' })}</h2>
          <p className="text-fg-subtle text-lg max-w-2xl mx-auto">
            {t({ en: 'A comprehensive suite of tools designed to support every aspect of your fitness journey.', fa: 'مجموعه‌ای جامع از ابزارهایی که برای پشتیبانی از تمام جنبه‌های سفر تناسب اندام شما طراحی شده‌اند.' })}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(feat => (
            <Link
              key={feat.title}
              to={feat.link}
              className="group card-iranian p-6 hover:border-brand/40 transition-all"
            >
              <div className="mb-4">
                <IconBadge icon={feat.icon} variant={feat.link.includes('diet') ? 'firuze' : feat.link.includes('pricing') ? 'terracotta' : 'saffron'} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-brand transition-colors font-display">{feat.title}</h3>
              <p className="text-fg-subtle text-sm">{feat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Smart Tools */}
      <HomeSmartTools />

      {/* Pricing Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{t({ en: 'Plans for Every Level', fa: 'برنامه‌هایی برای هر سطح' })}</h2>
          <p className="text-fg-subtle text-lg">{t({ en: 'Start free, upgrade as you grow. No commitment required.', fa: 'رایگان شروع کنید، با پیشرفت خود ارتقا دهید. بدون هیچ تعهدی.' })}</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { tier: t({ en: 'Free', fa: 'رایگان' }), price: t({ en: '$0', fa: '۰ تومان' }), highlight: false },
            { tier: t({ en: 'Economy', fa: 'اقتصادی' }), price: t({ en: '$9.99', fa: '۹۹.۰۰۰ تومان' }), highlight: false },
            { tier: t({ en: 'VIP', fa: 'ویژه' }), price: t({ en: '$29.99', fa: '۲۹۹.۰۰۰ تومان' }), highlight: true },
            { tier: t({ en: 'Elite', fa: 'نخبگان' }), price: t({ en: '$79.99', fa: '۷۹۹.۰۰۰ تومان' }), highlight: false },
          ].map(p => (
            <div
              key={p.tier}
              className={`rounded-2xl p-6 border text-center ${
                p.highlight
                  ? 'bg-gradient-to-b from-brand-muted to-accent-muted border-brand/40'
                  : 'bg-surface border-border'
              }`}
            >
              {p.highlight && (
                <div className="text-xs font-bold text-brand mb-2 uppercase tracking-wider">{t({ en: 'Most Popular', fa: 'محبوب‌ترین' })}</div>
              )}
              <div className="text-lg font-bold mb-1 font-display">{p.tier}</div>
              <div className="text-2xl font-black text-brand font-display">{p.price}</div>
              <div className="text-xs text-fg-subtle">{t({ en: '/month', fa: '/ماهیانه' })}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-brand font-medium hover:text-accent transition-colors">
            {t({ en: 'View Full Plan Comparison', fa: 'مشاهده مقایسه کامل برنامه‌ها' })} <ChevronRight className="w-4 h-4 rtl:!rotate-180" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface/50 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t({ en: 'Trusted by Fitness Enthusiasts', fa: 'مورد اعتماد ورزشکاران' })}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(tval => (
              <div key={tval.name} className="card-iranian p-6 relative overflow-hidden">
                <PersianPattern opacity={0.2} />
                <div className="relative z-10">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: tval.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand text-brand" />
                  ))}
                </div>
                <p className="text-fg-muted text-sm mb-4">"{tval.text}"</p>
                <div>
                  <div className="font-bold text-sm">{tval.name}</div>
                  <div className="text-xs text-fg-subtle">{tval.role}</div>
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative card-iranian gradient-hero p-12 text-center overflow-hidden">
          <PersianPattern opacity={0.35} />
          <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <IconBadge icon={TrendingUp} variant="saffron" size="sm" />
            <IconBadge icon={Users} variant="firuze" size="sm" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 font-display">{t({ en: 'Ready to Transform?', fa: 'آماده برای تغییر هستید؟' })}</h2>
          <p className="text-fg-subtle text-lg max-w-xl mx-auto mb-8">
            {t({ en: 'Join EsiFit today and get access to programs, calculators, and coaching tools — all for free to start.', fa: 'همین امروز به اسی‌فیت بپیوندید و به برنامه‌ها، ماشین‌حساب‌ها و ابزارهای مربی‌گری دسترسی پیدا کنید - شروع کاملا رایگان است.' })}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 gradient-brand text-[#1a1410] font-bold text-lg rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand/25"
          >
            {t({ en: 'Create Free Account', fa: 'ساخت حساب کاربری رایگان' })} <ChevronRight className="w-5 h-5 rtl:!rotate-180" />
          </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
