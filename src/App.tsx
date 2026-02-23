/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Library, 
  History, 
  Quote, 
  ExternalLink, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck,
  Loader2,
  Info,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { searchHistoricalSources } from './services/gemini';
import { HistoricalSource, SearchResult } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [savedSources, setSavedSources] = useState<HistoricalSource[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('clio_saved_sources');
    if (saved) {
      setSavedSources(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await searchHistoricalSources(query);
      setResults(data);
    } catch (err) {
      setError('Ocorreu um erro ao buscar as fontes. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (source: HistoricalSource) => {
    const isSaved = savedSources.some(s => s.url === source.url);
    let newSaved;
    if (isSaved) {
      newSaved = savedSources.filter(s => s.url !== source.url);
    } else {
      newSaved = [...savedSources, source];
    }
    setSavedSources(newSaved);
    localStorage.setItem('clio_saved_sources', JSON.stringify(newSaved));
  };

  const copyCitation = (citation: string, id: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-amber-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fdfcf8]/80 backdrop-blur-md border-b border-stone-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-amber-50">
              <History size={20} />
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">ClioArchive</h1>
          </div>
          
          <button 
            onClick={() => setShowSaved(!showSaved)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-50 transition-colors text-sm font-medium"
          >
            {showSaved ? <X size={16} /> : <Bookmark size={16} />}
            {showSaved ? 'Fechar' : `Salvos (${savedSources.length})`}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!showSaved ? (
            <motion.div
              key="search-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <section className="text-center space-y-6">
                <h2 className="font-serif text-5xl md:text-6xl font-medium leading-tight text-stone-900">
                  Descubra o passado com <br />
                  <span className="italic">rigor acadêmico.</span>
                </h2>
                <p className="text-stone-500 max-w-xl mx-auto text-lg">
                  Acesse fontes historiográficas, com citações automáticas em norma ABNT.
                </p>

                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-8">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ex: Tratado de Tordesilhas, Revolta da Vacina..."
                    className="w-full pl-14 pr-32 py-5 bg-white border-2 border-stone-200 rounded-2xl shadow-sm focus:border-stone-900 focus:ring-0 transition-all text-lg"
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400">
                    <Search size={24} />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-stone-900 text-amber-50 px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Pesquisar'}
                  </button>
                </form>
              </section>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
                  <Info size={20} />
                  <p>{error}</p>
                </div>
              )}

              {/* Results Section */}
              {results && (
                <section className="space-y-8">
                  {results.sources.length > 0 ? (
                    <>
                      <div className="border-l-4 border-stone-900 pl-6 py-2">
                        <h3 className="font-serif text-2xl font-medium text-stone-900">Contexto Histórico</h3>
                        <p className="text-stone-600 mt-2 leading-relaxed">{results.summary}</p>
                      </div>

                      <div className="grid gap-6">
                        {results.sources.map((source, idx) => (
                          <SourceCard 
                            key={idx} 
                            source={source} 
                            isSaved={savedSources.some(s => s.url === source.url)}
                            onToggleSave={() => toggleSave(source)}
                            onCopyCitation={() => copyCitation(source.abntCitation || '', `res-${idx}`)}
                            isCopied={copiedId === `res-${idx}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100">
                      <Info className="mx-auto text-stone-300 mb-3" size={32} />
                      <p className="text-stone-500">Nenhuma fonte específica foi encontrada para esta busca. Tente termos mais abrangentes.</p>
                    </div>
                  )}
                </section>
              )}

              {/* Empty State */}
              {!results && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                  <FeatureCard 
                    icon={<Library className="text-stone-500" />}
                    title="Acervos Globais"
                    description="Conexão com as principais instituições de pesquisa do mundo."
                  />
                  <FeatureCard 
                    icon={<Quote className="text-stone-500" />}
                    title="Normas ABNT"
                    description="Citações prontas para uso em trabalhos acadêmicos e teses."
                  />
                  <FeatureCard 
                    icon={<BookOpen className="text-stone-500" />}
                    title="Fontes Primárias"
                    description="Foco em documentos originais e registros historiográficos fiéis."
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="saved-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-4xl font-medium">Fontes Salvas</h2>
                <p className="text-stone-500">{savedSources.length} itens no seu acervo pessoal</p>
              </div>

              {savedSources.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl">
                  <Bookmark className="mx-auto text-stone-300 mb-4" size={48} />
                  <p className="text-stone-500">Você ainda não salvou nenhuma fonte.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {savedSources.map((source, idx) => (
                    <SourceCard 
                      key={idx} 
                      source={source} 
                      isSaved={true}
                      onToggleSave={() => toggleSave(source)}
                      onCopyCitation={() => copyCitation(source.abntCitation || '', `saved-${idx}`)}
                      isCopied={copiedId === `saved-${idx}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-stone-200 mt-20 text-center">
        <p className="text-stone-400 text-sm">
          ClioArchive © {new Date().getFullYear()} — Ferramenta de auxílio à pesquisa historiográfica.
        </p>
      </footer>
    </div>
  );
}

function SourceCard({ 
  source, 
  isSaved, 
  onToggleSave, 
  onCopyCitation, 
  isCopied 
}: { 
  source: HistoricalSource, 
  isSaved: boolean, 
  onToggleSave: () => void,
  onCopyCitation: () => void,
  isCopied: boolean
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider rounded">
              {source.type}
            </span>
            {source.institution && (
              <span className="text-stone-400 text-xs flex items-center gap-1">
                <Library size={12} />
                {source.institution}
              </span>
            )}
          </div>
          <h4 className="font-serif text-xl font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
            {source.title}
          </h4>
          <p className="text-stone-500 text-sm leading-relaxed">
            {source.description}
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={onToggleSave}
            className={cn(
              "p-2 rounded-full border transition-all",
              isSaved ? "bg-stone-900 border-stone-900 text-amber-50" : "bg-white border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900"
            )}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-full border border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900 bg-white transition-all"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Citação ABNT</p>
          <p className="font-mono text-[11px] text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100 break-all">
            {source.abntCitation}
          </p>
        </div>
        <button 
          onClick={onCopyCitation}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl text-xs font-medium transition-colors border border-stone-200"
        >
          {isCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          {isCopied ? 'Copiado!' : 'Copiar Citação'}
        </button>
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-white border border-stone-100 rounded-2xl shadow-sm space-y-3">
      <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h4 className="font-serif text-lg font-medium">{title}</h4>
      <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
