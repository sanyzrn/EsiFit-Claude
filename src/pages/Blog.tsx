import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { ARTICLES } from '@/lib/store';

export function BlogList() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">Blog</h1>
        <p className="text-gray-400 text-lg">Evidence-based articles on training, nutrition, and recovery.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTICLES.map(article => (
          <Link
            key={article.id}
            to={`/blog/${article.slug}`}
            className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all"
          >
            <div className="h-48 bg-gradient-to-br from-orange-500/5 to-purple-500/5 overflow-hidden">
              {article.coverImage ? (
                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><div className="text-4xl">📝</div></div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{article.category}</span>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">{article.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-3">{article.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = ARTICLES.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <button onClick={() => navigate('/blog')} className="text-orange-400">← Back to blog</button>
      </div>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black mt-8 mb-4">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3">{line.slice(4)}</h3>;
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\* — (.+)/);
        if (match) return <li key={i} className="ml-4 mb-2 text-gray-300"><strong className="text-white">{match[1]}</strong> — {match[2]}</li>;
      }
      if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1 text-gray-300">{line.slice(2)}</li>;
      if (line.startsWith('| ')) {
        const cells = line.split('|').filter(Boolean).map(c => c.trim());
        if (cells.every(c => /^-+$/.test(c))) return null;
        return (
          <div key={i} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-gray-800">
            {cells.map((cell, j) => <span key={j} className="text-gray-300">{cell}</span>)}
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-gray-300 leading-relaxed mb-3">{line}</p>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </button>

      <article className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-10">
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">{article.category}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-6">{article.title}</h1>
        <div className="prose prose-invert max-w-none">
          {renderContent(article.content)}
        </div>
      </article>
    </div>
  );
}
