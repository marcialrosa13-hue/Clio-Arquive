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
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { searchHistoricalSources, getHistoriographyArticles, generateResearchProject } from './services/gemini';
import { HistoricalSource, SearchResult, ResearchProject } from './types';
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
    setShowGuide(false);
    setShowAcademicWorks(false);
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
          
          <div className="flex items-center gap-3">
            <button 
              onClick={loadGuide}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-stone-600 hover:bg-stone-100 transition-colors text-sm font-medium"
            >
              <BookOpen size={16} />
              <span className="hidden sm:inline">Guia de Pesquisa</span>
            </button>
            <button 
              onClick={() => {
                setShowAcademicWorks(!showAcademicWorks);
                setShowSaved(false);
                setShowGuide(false);
                setShowProjectGenerator(false);
              }}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-stone-600 hover:bg-stone-100 transition-colors text-sm font-medium"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Trabalhos Acadêmicos</span>
            </button>
            <button 
              onClick={() => {
                setShowProjectGenerator(!showProjectGenerator);
                setShowAcademicWorks(false);
                setShowSaved(false);
                setShowGuide(false);
              }}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-stone-600 hover:bg-stone-100 transition-colors text-sm font-medium"
            >
              <Sparkles size={16} className="text-amber-500" />
              <span className="hidden sm:inline">Gerador de Projeto</span>
            </button>
            <button 
              onClick={() => {
                setShowSaved(!showSaved);
                setShowGuide(false);
                setShowAcademicWorks(false);
                setShowProjectGenerator(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-50 transition-colors text-sm font-medium"
            >
              {showSaved ? <X size={16} /> : <Bookmark size={16} />}
              {showSaved ? 'Fechar' : `Salvos (${savedSources.length})`}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!showSaved && !showGuide && !showAcademicWorks && !showProjectGenerator ? (
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
                  Acesse o passado com <br />
                  <span className="italic">rigor acadêmico.</span>
                </h2>
                <p className="text-stone-500 max-w-xl mx-auto text-lg">
                  Acesse fontes historiográficas, com citações automáticas em norma ABNT.
                </p>

                <div className="max-w-2xl mx-auto mt-8 space-y-4">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ex: Tratado de Tordesilhas, Revolta da Vacina..."
                      className="w-full pl-14 pr-6 py-5 bg-white border-2 border-stone-200 rounded-2xl shadow-sm focus:border-stone-900 focus:ring-0 transition-all text-lg"
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400">
                      <Search size={24} />
                    </div>
                  </form>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={(e) => handleSearch(e as any)}
                      disabled={loading}
                      className="bg-stone-900 text-amber-50 px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                      Pesquisar
                    </button>
                    <button
                      onClick={() => {
                        setShowProjectGenerator(true);
                        setShowAcademicWorks(false);
                        setShowSaved(false);
                        setShowGuide(false);
                      }}
                      className="bg-white border-2 border-stone-200 text-stone-900 px-8 py-3 rounded-xl font-medium hover:bg-stone-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Sparkles size={20} className="text-amber-500" />
                      Gerar Projeto
                    </button>
                  </div>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-serif text-4xl font-medium text-stone-900">Tipos de Trabalhos Acadêmicos</h2>
                  <p className="text-stone-500">Definições e características dos principais formatos de produção científica.</p>
                </div>
                <button 
                  onClick={() => setShowAcademicWorks(false)}
                  className="text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {ACADEMIC_WORK_TYPES.map((work, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all"
                  >
                    <h4 className="font-serif text-2xl font-semibold text-stone-900 mb-3">{work.title}</h4>
                    <p className="text-stone-600 leading-relaxed mb-6">{work.description}</p>
                    <a 
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-stone-900 font-medium hover:gap-3 transition-all group/link"
                    >
                      Saiba mais sobre {work.title.split(' (')[0]}
                      <ExternalLink size={16} className="text-stone-400 group-hover/link:text-stone-900 transition-colors" />
                    </a>
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
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-serif text-4xl font-medium text-stone-900">Gerador de Projeto de Pesquisa</h2>
                  <p className="text-stone-500">Transforme seu tema em um projeto estruturado seguindo normas acadêmicas.</p>
                </div>
                <button 
                  onClick={() => setShowProjectGenerator(false)}
                  className="text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-8 space-y-6">
                <form onSubmit={handleGenerateProject} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600 uppercase tracking-wider">Tema da Pesquisa</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={projectTheme}
                        onChange={(e) => setProjectTheme(e.target.value)}
                        placeholder="Ex: A influência da Escola dos Annales na historiografia brasileira..."
                        className="w-full pl-5 pr-40 py-4 bg-white border border-stone-200 rounded-2xl focus:border-stone-900 focus:ring-0 transition-all text-lg"
                      />
                      <button
                        type="submit"
                        disabled={loadingProject || !projectTheme.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-900 text-amber-50 px-6 py-2.5 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {loadingProject ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                        Gerar Projeto
                      </button>
                    </div>
                  </div>
                </form>

                {loadingProject && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="animate-spin text-stone-400" size={48} />
                    <p className="text-stone-500 font-serif italic">Estruturando seu projeto acadêmico...</p>
                  </div>
                )}

                {generatedProject && !loadingProject && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm space-y-8"
                  >
                    <div className="border-b border-stone-100 pb-6">
                      <h3 className="font-serif text-3xl font-bold text-stone-900 mb-2">{generatedProject.title}</h3>
                      <p className="text-stone-500 italic">Tema: {generatedProject.theme}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 text-left">
                      <ProjectSection title="Problema de Pesquisa" content={generatedProject.problem} />
                      
                      <div className="space-y-4">
                        <h5 className="font-bold text-stone-900 uppercase tracking-widest text-xs">Objetivos</h5>
                        <div className="space-y-4 pl-4 border-l-2 border-stone-100">
                          <div>
                            <span className="text-xs font-bold text-stone-400 block mb-1">GERAL</span>
                            <p className="text-stone-700">{generatedProject.objectives.general}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-400 block mb-1">ESPECÍFICOS</span>
                            <ul className="list-disc list-inside space-y-1 text-stone-700">
                              {generatedProject.objectives.specifics.map((obj, i) => (
                                <li key={i}>{obj}</li>
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
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-4xl font-medium text-stone-900">Fontes Salvas</h2>
                <button 
                  onClick={() => setShowSaved(false)}
                  className="text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {savedSources.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl">
                  <Bookmark className="mx-auto text-stone-300 mb-4" size={48} />
                  <p className="text-stone-500">Você ainda não salvou nenhuma fonte.</p>
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
              )}
            </motion.div>
          ) : (
            <motion.div
              key="guide-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-serif text-4xl font-medium text-stone-900">Guia de Pesquisa</h2>
                  <p className="text-stone-500">Artigos e textos fundamentais sobre metodologia historiográfica.</p>
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {loadingGuide ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="animate-spin text-stone-400" size={48} />
                  <p className="text-stone-500 font-serif italic">Consultando acervos acadêmicos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      case 'document': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'image': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'book': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'article': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'archive': return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'newspaper': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'literature': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'letter': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'oral_history': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-stone-50 text-stone-600 border-stone-100';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
          getTypeColor(source.type)
        )}>
          {getIcon(source.type)}
          {getTranslatedType(source.type)}
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={onToggleSave}
            className={cn(
              "p-2 rounded-full transition-all duration-300",
              isSaved 
                ? "bg-stone-900 text-amber-50 shadow-lg" 
                : "text-stone-400 hover:bg-stone-100 hover:text-stone-900"
            )}
            title={isSaved ? "Remover do acervo" : "Salvar no acervo"}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all duration-300"
            title="Acessar fonte original"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <h4 className="font-serif text-xl font-semibold text-stone-900 leading-tight group-hover:text-stone-700 transition-colors flex items-start gap-2">
          {showIconInTitle && <span className="mt-1 shrink-0 text-stone-400">{getIcon(source.type)}</span>}
          {source.title}
        </h4>
        
        {source.institution && (
          <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
            <Library size={14} className="shrink-0" />
            <span className="truncate">{source.institution}</span>
          </div>
        )}

        <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
          {source.description}
        </p>

        {source.socialContext && (
          <div className="bg-stone-50 border-l-2 border-stone-300 p-3 rounded-r-xl space-y-1 mt-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              <Users size={12} />
              Perspectiva Social
            </div>
            <p className="text-stone-600 text-xs italic leading-relaxed">
              {source.socialContext}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Citação ABNT</span>
          <button 
            onClick={onCopyCitation}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300",
              isCopied 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100"
            )}
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
            {isCopied ? 'COPIADO' : 'COPIAR'}
          </button>
        </div>
        <div className="font-mono text-[10px] text-stone-500 bg-stone-50/50 p-3 rounded-xl border border-stone-100/50 leading-relaxed italic break-words">
          {source.abntCitation}
        </div>
      </div>
    </motion.div>
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
