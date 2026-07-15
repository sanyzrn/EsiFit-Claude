import { Link } from 'react-router-dom';
import { Dumbbell, Calculator, TrendingUp, Users, ChevronRight, Star, Zap, Target, BarChart3, Apple, MessageSquare } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import HomeSmartTools from '@/components/calculators/HomeSmartTools';

export default function Home() {
  const { t } = useI18n();

  const features = [
    { icon: Dumbbell, title: t({ en: 'Exercise Library', fa: 'کتابخانه حرکات' }), desc: t({ en: 'Comprehensive database with video guides, muscle targeting, and difficulty levels.', fa: 'راهنمای جامع حرکات همراه با ویدیو، عضلات هدف، و سطوح دشواری.' }), link: '/exercises' },
    { icon: Target, title: t({ en: 'Training Programs', fa: 'برنامه‌های تمرینی' }), desc: t({ en: 'Structured programs from beginner to elite, matched to your specific goals.', fa: 'برنامه‌های ساختاریافته از مبتدی تا حرفه‌ای، متناسب با اهداف شما.' }), link: '/programs' },
    { icon: Apple, title: t({ en: 'Diet Plans', fa: 'برنامه‌های غذایی' }), desc: t({ en: 'Calorie-calculated meal plans with macros broken down per meal.', fa: 'برنامه‌های غذایی با محاسبه دقیق کالری و درشت‌مغذی‌ها در هر وعده.' }), link: '/diet' },
    { icon: Calculator, title: t({ en: 'Fitness Calculators', fa: 'ماشین‌حساب‌های فیتنس' }), desc: t({ en: '14 free calculators: BMI, TDEE, body fat, macros, 1RM, and more.', fa: '۱۴ ماشین حساب رایگان: BMI، چربی بدن، درشت‌مغذی‌ها و غیره.' }), link: '/calculators' },
    { icon: BarChart3, title: t({ en: 'Progress Tracking', fa: 'پیگیری پیشرفت' }), desc: t({ en: 'Log workouts and body measurements, visualize your gains with charts.', fa: 'ثبت تمرینات و سایزها، و مشاهده روند پیشرفت با نمودار.' }), link: '/dashboard/progress' },
    { icon: MessageSquare, title: t({ en: 'Coach Chat', fa: 'چت با مربی' }), desc: t({ en: 'Get personalized guidance from certified coaches via in-app messaging.', fa: 'دریافت راهنمایی اختصاصی از مربیان مجرب از طریق پیام‌رسان داخلی.' }), link: '/pricing' },
  ];

  const stats = [
    { value: t({ en: '10+', fa: '+۱۰' }), label: t({ en: 'Exercises', fa: 'حرکت تمرینی' }) },
    { value: t({ en: '3', fa: '۳' }), label: t({ en: 'Programs', fa: 'برنامه تمرینی' }) },
    { value: t({ en: '14', fa: '۱۴' }), label: t({ en: 'Calculators', fa: 'ماشین حساب' }) },
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
          <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950" />
        <div className="absolute top-20 start-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 end-1/4 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              {t({ en: 'Your Complete Fitness Platform', fa: 'پلتفرم جامع تناسب اندام شما' })}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
              {t({ en: 'Train Smarter.', fa: 'هوشمندانه‌تر تمرین کنید.' })}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                {t({ en: 'Grow Stronger.', fa: 'قوی‌تر شوید.' })}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              {t({ en: 'Programs, nutrition, calculators, and coaching — all in one platform. From your first rep to your personal records.', fa: 'برنامه‌ها، تغذیه، ماشین‌حساب‌ها، و مربی‌گری - همه در یک پلتفرم. از اولین تکرار تا ثبت رکوردهای شخصی شما.' })}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 animate-pulse-glow"
              >
                {t({ en: 'Start Free Today', fa: 'همین امروز رایگان شروع کنید' })}
              </Link>
              <Link
                to="/calculators"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
              >
                {t({ en: 'Try Free Calculators', fa: 'ماشین‌حساب‌های رایگان را امتحان کنید' })} <ChevronRight className="w-5 h-5 rtl:!rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-orange-400">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{t({ en: 'Everything You Need to Succeed', fa: 'هر آنچه برای موفقیت نیاز دارید' })}</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t({ en: 'A comprehensive suite of tools designed to support every aspect of your fitness journey.', fa: 'مجموعه‌ای جامع از ابزارهایی که برای پشتیبانی از تمام جنبه‌های سفر تناسب اندام شما طراحی شده‌اند.' })}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(feat => (
            <Link
              key={feat.title}
              to={feat.link}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 hover:bg-gray-900/80 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <feat.icon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">{feat.title}</h3>
              <p className="text-gray-400 text-sm">{feat.desc}</p>
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
          <p className="text-gray-400 text-lg">{t({ en: 'Start free, upgrade as you grow. No commitment required.', fa: 'رایگان شروع کنید، با پیشرفت خود ارتقا دهید. بدون هیچ تعهدی.' })}</p>
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
                  ? 'bg-gradient-to-b from-orange-500/10 to-orange-600/5 border-orange-500/50'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              {p.highlight && (
                <div className="text-xs font-bold text-orange-400 mb-2 uppercase tracking-wider">{t({ en: 'Most Popular', fa: 'محبوب‌ترین' })}</div>
              )}
              <div className="text-lg font-bold mb-1">{p.tier}</div>
              <div className="text-2xl font-black text-orange-400">{p.price}</div>
              <div className="text-xs text-gray-400">{t({ en: '/month', fa: '/ماهیانه' })}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-orange-400 font-medium hover:text-orange-300 transition-colors">
            {t({ en: 'View Full Plan Comparison', fa: 'مشاهده مقایسه کامل برنامه‌ها' })} <ChevronRight className="w-4 h-4 rtl:!rotate-180" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-900/50 border-y border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t({ en: 'Trusted by Fitness Enthusiasts', fa: 'مورد اعتماد ورزشکاران' })}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(tval => (
              <div key={tval.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: tval.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-4">"{tval.text}"</p>
                <div>
                  <div className="font-bold text-sm">{tval.name}</div>
                  <div className="text-xs text-gray-400">{tval.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <Users className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">{t({ en: 'Ready to Transform?', fa: 'آماده برای تغییر هستید؟' })}</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            {t({ en: 'Join EsiFit today and get access to programs, calculators, and coaching tools — all for free to start.', fa: 'همین امروز به اسی‌فیت بپیوندید و به برنامه‌ها، ماشین‌حساب‌ها و ابزارهای مربی‌گری دسترسی پیدا کنید - شروع کاملا رایگان است.' })}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
          >
            {t({ en: 'Create Free Account', fa: 'ساخت حساب کاربری رایگان' })} <ChevronRight className="w-5 h-5 rtl:!rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}
