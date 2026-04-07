/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText,
  Image as ImageIcon,
  Book,
  Newspaper,
  Archive,
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
  X,
  Mail,
  Mic2,
  PenTool,
  Users,
  Sparkles,
  Wand2,
  Calendar,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Scroll,
  Compass,
  Home,
  Feather,
  Map as MapIcon,
  Stamp,
  Camera,
  Newspaper as NewspaperIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { searchHistoricalSources, getHistoriographyArticles, generateResearchProject } from './services/gemini';
import { HistoricalSource, SearchResult, ResearchProject, SavedSearch } from './types';
import { ACADEMIC_WORK_TYPES } from './constants/academicWorks';

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
  const [showGuide, setShowGuide] = useState(false);
  const [showAcademicWorks, setShowAcademicWorks] = useState(false);
  const [showProjectGenerator, setShowProjectGenerator] = useState(false);
  const [projectTheme, setProjectTheme] = useState('');
  const [generatedProject, setGeneratedProject] = useState<ResearchProject | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [guideArticles, setGuideArticles] = useState<HistoricalSource[]>([]);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterInstitution, setFilterInstitution] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedTab, setSavedTab] = useState<'sources' | 'searches'>('sources');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('clio_saved_sources');
      if (saved) {
        setSavedSources(JSON.parse(saved));
      }
      const savedS = localStorage.getItem('clio_saved_searches');
      if (savedS) {
        setSavedSearches(JSON.parse(savedS));
      }
    } catch (err) {
      console.error('Erro ao carregar dados salvos:', err);
    }
  }, []);

  const toggleSave = (source: HistoricalSource) => {
    setSavedSources(prev => {
      const isAlreadySaved = prev.some(s => s.url === source.url);
      let newSaved;
      if (isAlreadySaved) {
        newSaved = prev.filter(s => s.url !== source.url);
      } else {
        newSaved = [...prev, source];
      }
      
      try {
        localStorage.setItem('clio_saved_sources', JSON.stringify(newSaved));
      } catch (err) {
        console.error('Erro ao salvar fonte:', err);
        setError('Não foi possível salvar a fonte. O armazenamento local pode estar cheio.');
      }
      
      return newSaved;
    });
  };

  const saveSearch = () => {
    if (!results || !query) return;

    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      query: query,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      result: results
    };

    setSavedSearches(prev => {
      const newSaved = [newSearch, ...prev];
      try {
        localStorage.setItem('clio_saved_searches', JSON.stringify(newSaved));
      } catch (err) {
        console.error('Erro ao salvar pesquisa:', err);
      }
      return newSaved;
    });
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => {
      const newSaved = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem('clio_saved_searches', JSON.stringify(newSaved));
      } catch (err) {
        console.error('Erro ao deletar pesquisa:', err);
      }
      return newSaved;
    });
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setQuery(search.query);
    setResults(search.result);
    setShowSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setShowGuide(false);
    setShowAcademicWorks(false);
    setError(null);
    setFilterType('all');
    setFilterInstitution('');
    setFilterDate('');
    try {
      const data = await searchHistoricalSources(query);
      setResults(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Ocorreu um erro ao buscar as fontes. Tente novamente.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGuide = async () => {
    if (guideArticles.length > 0) {
      setShowGuide(true);
      setShowSaved(false);
      return;
    }

    setLoadingGuide(true);
    setShowGuide(true);
    setShowSaved(false);
    setShowAcademicWorks(false);
    setShowProjectGenerator(false);
    try {
      const articles = await getHistoriographyArticles();
      setGuideArticles(articles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGuide(false);
    }
  };

  const handleGenerateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTheme.trim()) return;

    setLoadingProject(true);
    setError(null);
    try {
      const project = await generateResearchProject(projectTheme);
      setGeneratedProject(project);
    } catch (err) {
      setError('Ocorreu um erro ao gerar o projeto. Tente novamente.');
      console.error(err);
    } finally {
      setLoadingProject(false);
    }
  };

  const copyCitation = (citation: string, id: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSources = results?.sources.filter(source => {
    const matchesType = filterType === 'all' || source.type === filterType;
    const matchesInstitution = !filterInstitution || 
      source.institution?.toLowerCase().includes(filterInstitution.toLowerCase());
    const matchesDate = !filterDate || 
      source.date?.toLowerCase().includes(filterDate.toLowerCase());
    return matchesType && matchesInstitution && matchesDate;
  }) || [];

  return (
    <div className="min-h-screen font-sans selection:bg-amber-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-stone-200/60 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
            setShowSaved(false);
            setShowGuide(false);
            setShowAcademicWorks(false);
            setShowProjectGenerator(false);
            setResults(null);
            setQuery('');
          }}>
            <div className="w-11 h-11 bg-stone-900 rounded-2xl flex items-center justify-center text-amber-50 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <History size={22} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 leading-none">ClioArchive</h1>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-1">Historiografia Digital</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => {
                setShowSaved(false);
                setShowGuide(false);
                setShowAcademicWorks(false);
                setShowProjectGenerator(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100/80 transition-all text-sm font-medium"
            >
              <Home size={16} />
              <span className="hidden lg:inline">Início</span>
            </button>
            <button 
              onClick={loadGuide}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100/80 transition-all text-sm font-medium"
            >
              <BookOpen size={16} />
              <span className="hidden lg:inline">Guia</span>
            </button>
            <button 
              onClick={() => {
                setShowAcademicWorks(!showAcademicWorks);
                setShowSaved(false);
                setShowGuide(false);
                setShowProjectGenerator(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100/80 transition-all text-sm font-medium"
            >
              <FileText size={16} />
              <span className="hidden lg:inline">Trabalhos</span>
            </button>
            <button 
              onClick={() => {
                setShowProjectGenerator(!showProjectGenerator);
                setShowAcademicWorks(false);
                setShowSaved(false);
                setShowGuide(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100/80 transition-all text-sm font-medium"
            >
              <Sparkles size={16} className="text-amber-500" />
              <span className="hidden lg:inline">Projeto</span>
            </button>
            <div className="w-px h-6 bg-stone-200 mx-2 hidden sm:block" />
            <button 
              onClick={() => {
                setShowSaved(!showSaved);
                setShowGuide(false);
                setShowAcademicWorks(false);
                setShowProjectGenerator(false);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-amber-50 hover:bg-stone-800 transition-all text-sm font-medium shadow-md"
            >
              {showSaved ? <X size={16} /> : <Bookmark size={16} />}
              <span className="hidden sm:inline">{showSaved ? 'Fechar' : `Acervo (${savedSources.length})`}</span>
              <span className="sm:hidden">{savedSources.length}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!showSaved && !showGuide && !showAcademicWorks && !showProjectGenerator ? (
            <motion.div
              key="search-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-24"
            >
              {/* Hero Section */}
              <section className="text-center space-y-12 py-16 relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-stone-300 to-transparent opacity-40" />
                <div className="absolute -top-12 left-0 w-64 h-64 bg-amber-100/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -top-12 right-0 w-64 h-64 bg-stone-200/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="space-y-6 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-3 px-5 py-2 bg-white/50 backdrop-blur-sm border border-stone-200 rounded-full text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em] academic-shadow"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Laboratório de Investigação Histórica
                  </motion.div>
                  
                  <div className="space-y-4">
                    <h2 className="font-serif text-7xl md:text-9xl font-black text-stone-900 tracking-tighter ink-gradient leading-none">
                      Clio Archive
                    </h2>
                    <p className="text-stone-400 font-serif text-2xl italic tracking-tight">
                      Memória, Documento e Interpretação
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto pt-4">
                    <p className="text-stone-600 text-xl md:text-2xl font-serif leading-relaxed">
                      "Pesquisar, organizar e escrever História <br className="hidden md:block" />
                      com <span className="text-stone-900 font-bold underline decoration-amber-200 decoration-4 underline-offset-4">inteligência documental</span>."
                    </p>
                  </div>
                </div>

                {/* Central Search Doorway */}
                <div className="max-w-3xl mx-auto mt-16 relative z-10">
                  <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute -inset-4 bg-stone-900/5 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition duration-700" />
                    
                    <div className="relative flex items-center bg-white border-2 border-stone-200 rounded-[2rem] academic-shadow overflow-hidden group-focus-within:border-stone-900 transition-all duration-500">
                      <div className="pl-8 text-stone-400 group-focus-within:text-stone-900 transition-colors">
                        <Search size={32} strokeWidth={1.5} />
                      </div>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Inicie sua investigação histórica..."
                        className="w-full pl-6 pr-8 py-8 bg-transparent focus:ring-0 border-none text-2xl font-serif placeholder:text-stone-300 placeholder:italic"
                      />
                      <div className="pr-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-stone-900 text-amber-50 px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-xl"
                        >
                          {loading ? <Loader2 className="animate-spin" size={20} /> : <Feather size={20} />}
                          Explorar
                        </button>
                      </div>
                    </div>
                  </form>
                  
                  <div className="flex flex-wrap justify-center gap-6 mt-8">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] w-full mb-2">Sugestões de Pesquisa</p>
                    {['Revolução Francesa', 'Brasil Império', 'Guerra Fria', 'Micro-história'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-4 py-2 bg-stone-100/50 hover:bg-stone-900 hover:text-amber-50 rounded-full text-xs font-medium text-stone-500 transition-all border border-stone-200/50"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gabinete Historiográfico (Feature Section) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                  <FeatureCard 
                    icon={<ShieldCheck size={28} className="text-stone-800" />}
                    title="Rigor Metodológico"
                    description="Análises fundamentadas em princípios da crítica documental e hermenêutica histórica."
                    accent="amber"
                  />
                  <FeatureCard 
                    icon={<Compass size={28} className="text-stone-800" />}
                    title="Contexto Profundo"
                    description="Mapeamento de mentalidades, escolas historiográficas e tensões sociais de cada época."
                    accent="stone"
                  />
                  <FeatureCard 
                    icon={<Scroll size={28} className="text-stone-800" />}
                    title="Normas Acadêmicas"
                    description="Citações automáticas em ABNT e Chicago, prontas para teses, artigos e monografias."
                    accent="amber"
                  />
                </div>
              </section>

              {/* Secondary Cabinet Section */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
                <div className="editorial-frame bg-white/40 academic-shadow rounded-sm space-y-6">
                  <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center text-amber-50">
                    <MapIcon size={24} />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-stone-900">Cartografia do Tempo</h3>
                  <p className="text-stone-600 font-serif leading-relaxed italic">
                    Visualize a dispersão geográfica e temporal das fontes. Entenda como o espaço e o tempo moldam a narrativa histórica através de nossa interface de linha do tempo integrada.
                  </p>
                  <button 
                    onClick={() => setShowGuide(true)}
                    className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b-2 border-amber-200 pb-1 hover:border-stone-900 transition-all"
                  >
                    Explorar Metodologia
                  </button>
                </div>

                <div className="editorial-frame bg-white/40 academic-shadow rounded-sm space-y-6">
                  <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center text-amber-50">
                    <Stamp size={24} />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-stone-900">Crítica de Autenticidade</h3>
                  <p className="text-stone-600 font-serif leading-relaxed italic">
                    Cada documento passa por um crivo de análise de proveniência e intencionalidade. O ClioArchive ajuda a identificar silêncios e vozes marginais nos registros oficiais.
                  </p>
                  <button 
                    onClick={() => setShowProjectGenerator(true)}
                    className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b-2 border-amber-200 pb-1 hover:border-stone-900 transition-all"
                  >
                    Iniciar Projeto de Pesquisa
                  </button>
                </div>
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
                <section className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
                        <button 
                          onClick={() => setViewMode('grid')}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === 'grid' ? "bg-stone-900 text-amber-50 shadow-sm" : "text-stone-400 hover:text-stone-600"
                          )}
                          title="Visualização em Grade"
                        >
                          <Layers size={18} />
                        </button>
                        <button 
                          onClick={() => setViewMode('timeline')}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === 'timeline' ? "bg-stone-900 text-amber-50 shadow-sm" : "text-stone-400 hover:text-stone-600"
                          )}
                          title="Linha do Tempo"
                        >
                          <Calendar size={18} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setResults(null);
                            setQuery('');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200 transition-all"
                        >
                          <Home size={16} />
                          Voltar à página inicial
                        </button>
                        <button 
                          onClick={saveSearch}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition-all"
                        >
                          <Bookmark size={14} />
                          Salvar Pesquisa
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      {filteredSources.length} Fontes Encontradas
                    </p>
                  </div>
                  {results.sources.length > 0 ? (
                    <>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-stone-900 text-amber-50 rounded-3xl p-8 shadow-xl relative overflow-hidden"
                      >
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-amber-50/10 rounded-full flex items-center justify-center">
                              <Info size={16} className="text-amber-200" />
                            </div>
                            <h3 className="font-serif text-xl font-medium">Contexto Histórico</h3>
                          </div>
                          <p className="text-amber-50/80 leading-relaxed text-lg italic font-serif">
                            "{results.summary}"
                          </p>
                          <div className="mt-6 flex items-start gap-2 text-xs text-amber-50/40 bg-amber-50/5 p-3 rounded-xl border border-amber-50/10">
                            <Info size={14} className="shrink-0 mt-0.5" />
                            <p>
                              Nota: Links para acervos históricos podem ser instáveis ou exigir acesso institucional. 
                              Caso um link não funcione, recomendamos pesquisar o título da fonte diretamente no portal da instituição citada.
                            </p>
                          </div>
                        </div>
                        <Quote className="absolute -bottom-4 -right-4 text-amber-50/5 w-48 h-48 rotate-12" />
                      </motion.div>

                      {/* Advanced Filters */}
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[150px] space-y-1.5">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Tipo de Fonte</label>
                          <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:border-stone-900 focus:ring-0 transition-all"
                          >
                            <option value="all">Todos os tipos</option>
                            <option value="document">Documento</option>
                            <option value="article">Artigo</option>
                            <option value="book">Livro</option>
                            <option value="image">Imagem</option>
                            <option value="archive">Arquivo</option>
                            <option value="newspaper">Jornal</option>
                            <option value="literature">Literatura</option>
                            <option value="letter">Carta</option>
                            <option value="oral_history">História Oral</option>
                          </select>
                        </div>
                        <div className="flex-1 min-w-[150px] space-y-1.5">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Instituição</label>
                          <input 
                            type="text"
                            placeholder="Filtrar por instituição..."
                            value={filterInstitution}
                            onChange={(e) => setFilterInstitution(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:border-stone-900 focus:ring-0 transition-all"
                          />
                        </div>
                        <div className="flex-1 min-w-[100px] space-y-1.5">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Data/Época</label>
                          <input 
                            type="text"
                            placeholder="Ex: 1930..."
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:border-stone-900 focus:ring-0 transition-all"
                          />
                        </div>
                        {(filterType !== 'all' || filterInstitution || filterDate) && (
                          <button 
                            onClick={() => {
                              setFilterType('all');
                              setFilterInstitution('');
                              setFilterDate('');
                            }}
                            className="px-3 py-2 text-stone-400 hover:text-stone-900 transition-colors text-sm font-medium"
                          >
                            Limpar
                          </button>
                        )}
                      </div>

                      {filteredSources.length > 0 ? (
                        viewMode === 'grid' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredSources.map((source, idx) => (
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
                        ) : (
                          <Timeline sources={filteredSources} />
                        )
                      ) : (
                        <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-100">
                          <p className="text-stone-500">Nenhuma fonte corresponde aos filtros selecionados.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
                      <Info className="mx-auto text-stone-300 mb-4" size={48} />
                      <p className="text-stone-500 text-lg">Nenhuma fonte específica foi encontrada para esta busca.</p>
                      <p className="text-stone-400 text-sm mt-2">Tente termos mais abrangentes ou verifique a grafia.</p>
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
          ) : showAcademicWorks ? (
            <motion.div
              key="academic-works-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="font-serif text-5xl font-bold text-stone-900 tracking-tight">Trabalhos Acadêmicos</h2>
                  <p className="text-stone-500 text-lg font-serif italic">Definições e características da produção científica.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowAcademicWorks(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-stone-200 transition-all shadow-sm"
                  >
                    <Home size={16} />
                    Início
                  </button>
                  <button 
                    onClick={() => setShowAcademicWorks(false)}
                    className="p-3 bg-white border border-stone-200 text-stone-400 hover:text-stone-900 rounded-2xl transition-all shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {ACADEMIC_WORK_TYPES.map((work, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card rounded-[2.5rem] p-10 academic-shadow hover:scale-[1.01] transition-all duration-500 group"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                          Formato Acadêmico
                        </div>
                        <h4 className="font-serif text-3xl font-bold text-stone-900 group-hover:text-stone-700 transition-colors">{work.title}</h4>
                        <p className="text-stone-600 text-lg leading-relaxed font-serif italic">{work.description}</p>
                        <div className="pt-4">
                          <a 
                            href={work.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-3 bg-stone-900 text-amber-50 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg"
                          >
                            Explorar Diretrizes
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center justify-center w-32 h-32 bg-stone-50 rounded-3xl border border-stone-100/50 group-hover:rotate-3 transition-transform duration-500">
                        <FileText size={48} className="text-stone-200" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : showProjectGenerator ? (
            <motion.div
              key="project-generator-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="font-serif text-5xl font-bold text-stone-900 tracking-tight">Gerador de Projeto</h2>
                  <p className="text-stone-500 text-lg font-serif italic">Estruture sua pesquisa com auxílio de IA historiográfica.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowProjectGenerator(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-stone-200 transition-all shadow-sm"
                  >
                    <Home size={16} />
                    Início
                  </button>
                  <button 
                    onClick={() => setShowProjectGenerator(false)}
                    className="p-3 bg-white border border-stone-200 text-stone-400 hover:text-stone-900 rounded-2xl transition-all shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-[2.5rem] p-10 academic-shadow space-y-10">
                <form onSubmit={handleGenerateProject} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] ml-2">Tema da Pesquisa</label>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-200/20 to-stone-200/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                      <input
                        type="text"
                        value={projectTheme}
                        onChange={(e) => setProjectTheme(e.target.value)}
                        placeholder="Ex: A influência da Escola dos Annales na historiografia brasileira..."
                        className="relative w-full pl-6 pr-48 py-6 bg-white border border-stone-200 rounded-3xl focus:border-stone-900 focus:ring-0 transition-all text-xl font-serif italic placeholder:text-stone-300"
                      />
                      <button
                        type="submit"
                        disabled={loadingProject || !projectTheme.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-stone-900 text-amber-50 px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-lg"
                      >
                        {loadingProject ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} className="text-amber-400" />}
                        Gerar Projeto
                      </button>
                    </div>
                  </div>
                </form>

                {loadingProject && (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-amber-100 rounded-full blur-xl animate-pulse" />
                      <Loader2 className="animate-spin text-stone-900 relative z-10" size={64} strokeWidth={1.5} />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-stone-900 font-serif text-2xl font-bold italic">Estruturando seu projeto...</p>
                      <p className="text-stone-400 text-sm uppercase tracking-widest font-bold">Consultando bases historiográficas</p>
                    </div>
                  </div>
                )}

                {generatedProject && !loadingProject && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-12 border-t border-stone-100 space-y-12"
                  >
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-[10px] font-bold text-amber-50 uppercase tracking-[0.2em] shadow-lg">
                        Projeto Acadêmico Estruturado
                      </div>
                      <h3 className="font-serif text-5xl font-bold text-stone-900 leading-tight tracking-tight">{generatedProject.title}</h3>
                      <p className="text-stone-500 text-lg font-serif italic">Tema: {generatedProject.theme}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                      <ProjectSection title="Problema de Pesquisa" content={generatedProject.problem} />
                      
                      <div className="space-y-4">
                        <h5 className="font-bold text-stone-900 uppercase tracking-[0.2em] text-[10px]">Objetivos da Investigação</h5>
                        <div className="space-y-6 pl-6 border-l-2 border-stone-100">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-widest">Geral</span>
                            <p className="text-stone-700 text-lg font-serif italic leading-relaxed">{generatedProject.objectives.general}</p>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-widest">Específicos</span>
                            <ul className="space-y-3">
                              {generatedProject.objectives.specifics.map((obj, i) => (
                                <li key={i} className="flex items-start gap-3 text-stone-700 leading-relaxed">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <ProjectSection title="Justificativa" content={generatedProject.justification} />
                      <ProjectSection title="Metodologia" content={generatedProject.methodology} />
                      <ProjectSection title="Fundamentação Teórica" content={generatedProject.theoreticalFramework} />
                      <ProjectSection title="Resultados Esperados" content={generatedProject.expectedResults} />
                    </div>

                    <div className="pt-8 border-t border-stone-100 flex justify-end">
                      <button 
                        onClick={() => {
                          const text = `
TÍTULO: ${generatedProject.title}
TEMA: ${generatedProject.theme}
PROBLEMA: ${generatedProject.problem}
OBJETIVO GERAL: ${generatedProject.objectives.general}
OBJETIVOS ESPECÍFICOS:
${generatedProject.objectives.specifics.map(o => `- ${o}`).join('\n')}
JUSTIFICATIVA: ${generatedProject.justification}
METODOLOGIA: ${generatedProject.methodology}
FUNDAMENTAÇÃO TEÓRICA: ${generatedProject.theoreticalFramework}
RESULTADOS ESPERADOS: ${generatedProject.expectedResults}
                          `;
                          navigator.clipboard.writeText(text);
                          setCopiedId('project-copy');
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
                          copiedId === 'project-copy' 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-stone-900 text-amber-50 hover:bg-stone-800"
                        )}
                      >
                        {copiedId === 'project-copy' ? <Check size={18} /> : <Copy size={18} />}
                        {copiedId === 'project-copy' ? 'PROJETO COPIADO' : 'COPIAR PROJETO COMPLETO'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : showSaved ? (
            <motion.div
              key="saved-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="font-serif text-5xl font-bold text-stone-900 tracking-tight">Seu Acervo</h2>
                  <p className="text-stone-500 text-lg font-serif italic">Fontes e pesquisas salvas para sua investigação.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowSaved(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-stone-200 transition-all shadow-sm"
                  >
                    <Home size={16} />
                    Início
                  </button>
                  <button 
                    onClick={() => setShowSaved(false)}
                    className="p-3 bg-white border border-stone-200 text-stone-400 hover:text-stone-900 rounded-2xl transition-all shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-8 border-b border-stone-100">
                <button 
                  onClick={() => setSavedTab('sources')}
                  className={cn(
                    "pb-6 px-2 text-xs font-bold uppercase tracking-[0.2em] transition-all relative",
                    savedTab === 'sources' ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
                  )}
                >
                  Fontes Salvas ({savedSources.length})
                  {savedTab === 'sources' && <motion.div layoutId="savedTab" className="absolute bottom-0 left-0 right-0 h-1 bg-stone-900 rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setSavedTab('searches')}
                  className={cn(
                    "pb-6 px-2 text-xs font-bold uppercase tracking-[0.2em] transition-all relative",
                    savedTab === 'searches' ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
                  )}
                >
                  Pesquisas ({savedSearches.length})
                  {savedTab === 'searches' && <motion.div layoutId="savedTab" className="absolute bottom-0 left-0 right-0 h-1 bg-stone-900 rounded-t-full" />}
                </button>
              </div>

              {savedTab === 'sources' ? (
                savedSources.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl">
                    <Bookmark className="mx-auto text-stone-300 mb-4" size={48} />
                    <p className="text-stone-500">Você ainda não salvou nenhuma fonte individual.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                )
              ) : (
                savedSearches.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl">
                    <History className="mx-auto text-stone-300 mb-4" size={48} />
                    <p className="text-stone-500">Você ainda não salvou nenhuma pesquisa completa.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedSearches.map((search) => (
                      <motion.div 
                        key={search.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-stone-200 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-amber-50 transition-all">
                            <Search size={20} />
                          </div>
                          <div>
                            <h4 className="font-serif text-lg font-semibold text-stone-900">"{search.query}"</h4>
                            <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {search.date}</span>
                              <span className="flex items-center gap-1"><Library size={12} /> {search.result.sources.length} fontes</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => loadSavedSearch(search)}
                            className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-900 hover:text-amber-50 transition-all"
                          >
                            Restaurar
                          </button>
                          <button 
                            onClick={() => deleteSavedSearch(search.id)}
                            className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                            title="Excluir pesquisa"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
            </motion.div>
          ) : (
            <motion.div
              key="guide-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-stone-200">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-[10px] font-bold uppercase tracking-[0.2em] academic-shadow">
                    <BookOpen size={14} />
                    Metodologia Historiográfica
                  </div>
                  <h2 className="font-serif text-6xl font-bold text-stone-900 tracking-tight">Guia de Pesquisa</h2>
                  <p className="text-stone-500 text-xl font-serif italic max-w-2xl leading-relaxed">
                    Artigos e textos fundamentais sobre metodologia historiográfica, teoria da história e crítica documental.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="flex items-center gap-3 px-8 py-4 bg-stone-900 text-amber-50 rounded-[1.5rem] text-sm font-bold uppercase tracking-widest academic-shadow hover:scale-105 transition-all duration-300"
                  >
                    <Home size={18} />
                    Voltar ao Início
                  </button>
                </div>
              </div>

              {loadingGuide ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-amber-100/50 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="animate-spin text-amber-600 relative" size={64} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-stone-900 font-serif text-2xl italic">Consultando acervos acadêmicos...</p>
                    <p className="text-stone-400 text-sm font-bold uppercase tracking-[0.2em]">Aguarde a curadoria historiográfica</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {guideArticles.map((source, idx) => (
                    <SourceCard 
                      key={idx} 
                      source={source} 
                      isSaved={savedSources.some(s => s.url === source.url)}
                      onToggleSave={() => toggleSave(source)}
                      onCopyCitation={() => copyCitation(source.abntCitation || '', `guide-${idx}`)}
                      isCopied={copiedId === `guide-${idx}`}
                      showIconInTitle={source.type === 'article'}
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
          ClioArchive© {new Date().getFullYear()} — Marcial Rosa. Todos os direitos reservados, Ferramenta de auxílio à pesquisa historiográfica.
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
  isCopied,
  showIconInTitle = false
}: { 
  source: HistoricalSource, 
  isSaved: boolean, 
  onToggleSave: () => void,
  onCopyCitation: () => void,
  isCopied: boolean,
  showIconInTitle?: boolean
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'book': return <Book size={16} />;
      case 'article': return <Newspaper size={16} />;
      case 'archive': return <Archive size={16} />;
      case 'newspaper': return <Newspaper size={16} />;
      case 'literature': return <PenTool size={16} />;
      case 'letter': return <Mail size={16} />;
      case 'oral_history': return <Mic2 size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getTranslatedType = (type: string) => {
    switch (type) {
      case 'document': return 'Documento';
      case 'image': return 'Imagem';
      case 'book': return 'Livro';
      case 'article': return 'Artigo';
      case 'archive': return 'Arquivo';
      case 'newspaper': return 'Jornal';
      case 'literature': return 'Literatura';
      case 'letter': return 'Carta';
      case 'oral_history': return 'História Oral';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'image': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'book': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'article': return 'bg-stone-900 text-amber-50 border-stone-800';
      case 'archive': return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'newspaper': return 'bg-stone-50 text-stone-600 border-stone-200';
      case 'literature': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'letter': return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'oral_history': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-stone-50 text-stone-600 border-stone-100';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[2.5rem] p-8 academic-shadow hover:scale-[1.01] transition-all duration-500 flex flex-col h-full group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm",
          getTypeColor(source.type)
        )}>
          {getIcon(source.type)}
          {getTranslatedType(source.type)}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 shadow-sm",
              showAnalysis ? "bg-stone-900 text-amber-50" : "bg-white border border-stone-200 text-stone-400 hover:text-stone-900"
            )}
            title="Análise Historiográfica"
          >
            <Compass size={18} />
          </button>
          <button 
            onClick={onToggleSave}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 shadow-sm",
              isSaved 
                ? "bg-stone-900 text-amber-50" 
                : "bg-white border border-stone-200 text-stone-400 hover:text-stone-900"
            )}
            title={isSaved ? "Remover do acervo" : "Salvar no acervo"}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 bg-white border border-stone-200 text-stone-400 hover:text-stone-900 rounded-xl transition-all duration-300 shadow-sm"
            title="Acessar fonte original"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <h4 className="font-serif text-2xl font-bold text-stone-900 leading-tight group-hover:text-stone-700 transition-colors">
          {source.title}
        </h4>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
          {source.author && (
            <span className="flex items-center gap-2">
              <Users size={12} className="text-amber-500" /> {source.author}
            </span>
          )}
          {source.date && (
            <span className="flex items-center gap-2">
              <Calendar size={12} className="text-amber-500" /> {source.date}
            </span>
          )}
          {source.institution && (
            <span className="flex items-center gap-2">
              <Library size={12} className="text-amber-500" /> {source.institution}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showAnalysis ? (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 pt-4"
            >
              {source.historiographicalSchool && (
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 academic-shadow">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] block mb-2">Escola Historiográfica</span>
                  <p className="text-base text-stone-700 font-serif italic leading-relaxed">{source.historiographicalSchool}</p>
                </div>
              )}
              {source.criticalAnalysis && (
                <div className="bg-amber-50/20 p-4 rounded-2xl border border-amber-100/50 academic-shadow">
                  <span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-[0.2em] block mb-2">Análise Crítica</span>
                  <p className="text-base text-stone-700 font-serif italic leading-relaxed">{source.criticalAnalysis}</p>
                </div>
              )}
              {source.socialContext && (
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 academic-shadow">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] block mb-2">Contexto Social</span>
                  <p className="text-base text-stone-700 font-serif italic leading-relaxed">{source.socialContext}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-stone-600 text-lg leading-relaxed font-serif italic line-clamp-4">
                {source.description}
              </p>
              
              {source.tags && source.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {source.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-stone-50 text-stone-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-stone-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
        <button 
          onClick={onCopyCitation}
          className={cn(
            "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all",
            isCopied ? "text-emerald-600" : "text-stone-400 hover:text-stone-900"
          )}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          {isCopied ? 'Citação ABNT Copiada' : 'Copiar Citação ABNT'}
        </button>
        <p className="text-[11px] text-stone-500 font-mono leading-tight bg-stone-50 p-2 rounded-lg border border-stone-100">
          {source.abntCitation}
        </p>
      </div>
    </motion.div>
  );
}

function Timeline({ sources }: { sources: HistoricalSource[] }) {
  // Sort sources by date (naive sorting)
  const sortedSources = [...sources].sort((a, b) => {
    const dateA = a.date?.match(/\d{4}/)?.[0] || '0';
    const dateB = b.date?.match(/\d{4}/)?.[0] || '0';
    return parseInt(dateA) - parseInt(dateB);
  });

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
      {sortedSources.map((source, idx) => (
        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-stone-900 text-amber-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            <History size={16} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[45%] bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <time className="font-serif font-bold text-stone-900">{source.date || 'S.D.'}</time>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{source.institution}</span>
            </div>
            <h4 className="font-serif font-semibold text-stone-900 mb-2">{source.title}</h4>
            <p className="text-sm text-stone-600 line-clamp-2">{source.description}</p>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 hover:gap-2 transition-all"
            >
              Acessar Fonte <ExternalLink size={12} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectSection({ title, content }: { title: string, content: string }) {
  return (
    <div className="space-y-2">
      <h5 className="font-bold text-stone-900 uppercase tracking-widest text-xs">{title}</h5>
      <p className="text-stone-700 leading-relaxed">{content}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, accent = 'stone' }: { icon: React.ReactNode, title: string, description: string, accent?: 'amber' | 'stone' }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={cn(
        "cabinet-border p-8 text-left bg-white transition-all duration-500 group",
        accent === 'amber' ? "hover:border-amber-200" : "hover:border-stone-900"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-lg",
        accent === 'amber' ? "bg-amber-50 text-amber-700 group-hover:bg-amber-100" : "bg-stone-100 text-stone-900 group-hover:bg-stone-900 group-hover:text-amber-50"
      )}>
        {icon}
      </div>
      <h4 className="font-serif text-2xl font-bold text-stone-900 mb-3 tracking-tight">{title}</h4>
      <p className="text-stone-500 text-sm leading-relaxed font-serif italic">
        {description}
      </p>
      <div className="mt-6 w-8 h-0.5 bg-stone-200 group-hover:w-full transition-all duration-700" />
    </motion.div>
  );
}
