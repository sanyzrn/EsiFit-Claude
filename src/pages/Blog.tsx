import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Tag, BookOpen, ArrowRight } from 'lucide-react';
import { ARTICLES } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localizedArticle } from '@/lib/content-i18n';
import { useLocaleFormat } from '@/lib/locale-format-context';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageContainer } from '@/components/ui/PageContainer';

export function BlogList() {
  const { t, lang } = useI18n();
  const { formatDate } = useLocaleFormat();

  return (
    <PageContainer>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ backgroundColor: 'var(--theme-secondary-dim)', color: 'var(--theme-secondary)', border: '1px solid rgba(76,201,240,0.2)' }}>
          <BookOpen className="w-3.5 h-3.5" />
          {t({ en: 'Evidence-Based Articles', fa: 'مقالات علمی' })}
        </div>
        <h1 className="text-5xl font-black mb-3 font-display">
          {t({ en: 'Blog', fa: 'وبلاگ' })}
        </h1>
        <p className="text-lg" style={{ color: 'var(--theme-fg-subtle)' }}>
          {t({ en: 'Evidence-based articles on training, nutrition, and recovery.', fa: 'مقاله‌های مبتنی بر شواهد در زمینه تمرین، تغذیه و بازیابی.' })}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTICLES.map(article => {
          const copy = localizedArticle(article, lang);
          return (
            <Link key={article.id} to={`/blog/${article.slug}`}
              className="group card-premium p-0 overflow-hidden transition-all duration-[280ms]">
              <div className="h-44 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--theme-secondary-dim), var(--theme-primary-dim))' }}>
                <BookOpen className="w-16 h-16" style={{ color: 'var(--theme-secondary)' }} />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--theme-fg-subtle)' }}>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(article.date)}</span>
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{article.tags?.[0] || t({ en: 'Fitness', fa: 'تناسب اندام' })}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 font-display group-hover:translate-x-0.5 transition-transform">{copy.title}</h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--theme-fg-subtle)' }}>{copy.summary}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--theme-secondary)' }}>
                  <span>{t({ en: 'Read More', fa: 'ادامه مطلب' })}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}

export function BlogDetail() {
  const { t, lang } = useI18n();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { formatDate } = useLocaleFormat();

  const article = ARTICLES.find(a => a.slug === slug);
  if (!article) {
    return (
      <PageContainer className="text-center py-20">
        <Breadcrumbs items={[
          { label: t({ en: 'Blog', fa: 'وبلاگ' }), href: '/blog' },
          { label: t({ en: 'Not found', fa: 'یافت نشد' }) },
        ]} />
        <h1 className="text-2xl font-bold mb-2">{t({ en: 'Article not found', fa: 'مقاله یافت نشد' })}</h1>
        <button onClick={() => navigate('/blog')} className="text-sm font-semibold"
          style={{ color: 'var(--theme-primary)' }}>
          {t({ en: '← Back to blog', fa: 'بازگشت به وبلاگ' })}
        </button>
      </PageContainer>
    );
  }

  const copy = localizedArticle(article, lang);

  return (
    <PageContainer padY="md">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={[
          { label: t({ en: 'Blog', fa: 'وبلاگ' }), href: '/blog' },
          { label: copy.title },
        ]} />

        <div className="card-premium overflow-hidden">
          <div className="h-56 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--theme-secondary-dim), var(--theme-primary-dim))' }}>
            <BookOpen className="w-20 h-20" style={{ color: 'var(--theme-secondary)' }} />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 text-xs mb-4" style={{ color: 'var(--theme-fg-subtle)' }}>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(article.date)}</span>
              {article.tags?.map(tag => (
                <span key={tag} className="flex items-center gap-1"><Tag className="w-4 h-4" />{tag}</span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-6 font-display">{copy.title}</h1>
            <div className="prose prose-sm max-w-none"
              style={{ color: 'var(--theme-fg-muted)' }}>
              {copy.content.split('\n').map((paragraph, i) => (
                paragraph ? <p key={i} className="mb-4 leading-relaxed">{paragraph}</p> : null
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
