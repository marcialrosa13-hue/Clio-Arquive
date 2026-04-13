import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Feather, 
  ShieldCheck, 
  Compass, 
  Scroll, 
  Clock, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  X,
  Quote,
  Library,
  GraduationCap,
  History,
  Sparkles,
  FileText,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onStartFree: () => void;
  onTestPro: () => void;
}

export function LandingPage({ onStartFree, onTestPro }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-blue-50">
              <History size={20} />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">ClioArchive</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#solucao" className="hover:text-slate-900 transition-colors">Solução</a>
            <a href="#beneficios" className="hover:text-slate-900 transition-colors">Benefícios</a>
            <a href="#como-funciona" className="hover:text-slate-900 transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-slate-900 transition-colors">Planos</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onStartFree}
              className="text-sm font-bold text-slate-900 hover:text-slate-600 transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={onTestPro}
              className="bg-slate-950 text-blue-50 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-stone-100 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]"
            >
              <Sparkles size={12} className="text-blue-500" />
              Inteligência Documental para Historiadores
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-slate-950 leading-[0.9] tracking-tighter"
            >
              Pesquisa histórica com método. <br />
              <span className="text-slate-400 italic font-medium">Sem perder tempo.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-500 text-xl md:text-2xl font-serif italic max-w-2xl mx-auto leading-relaxed"
            >
              Acesse fontes confiáveis, organize sua pesquisa e gere citações em ABNT automaticamente.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <button 
                onClick={onStartFree}
                className="w-full sm:w-auto px-8 py-4 bg-slate-950 text-blue-50 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
              >
                Começar grátis
              </button>
              <button 
                onClick={onTestPro}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 border-2 border-slate-200 rounded-2xl font-bold text-sm uppercase tracking-widest hover:border-slate-900 transition-all active:scale-95"
              >
                Testar plano profissional
              </button>
            </motion.div>
          </div>

          {/* App Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-stone-900/5 rounded-[2.5rem] blur-3xl" />
            <div className="relative bg-white border border-stone-200 rounded-[2rem] shadow-2xl overflow-hidden aspect-video flex flex-col">
              <img 
                src="https://picsum.photos/seed/archive-app/1200/800" 
                alt="ClioArchive Interface" 
                className="absolute inset-0 w-full h-full object-cover opacity-10"
                referrerPolicy="no-referrer"
              />
              <div className="h-12 border-b border-stone-100 bg-stone-50/50 flex items-center px-6 gap-2 relative z-10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-stone-200" />
                  <div className="w-3 h-3 rounded-full bg-stone-200" />
                  <div className="w-3 h-3 rounded-full bg-stone-200" />
                </div>
                <div className="flex-1 max-w-md mx-auto h-6 bg-white rounded-md border border-stone-100" />
              </div>
              <div className="flex-1 p-8 flex gap-8 relative z-10">
                <div className="w-64 space-y-4 hidden md:block">
                  <div className="h-8 bg-stone-100/50 rounded-lg w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-50/50 rounded w-full" />
                    <div className="h-4 bg-stone-50/50 rounded w-5/6" />
                    <div className="h-4 bg-stone-50/50 rounded w-4/6" />
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="h-12 bg-stone-50/50 rounded-xl w-full flex items-center px-4">
                    <Search size={16} className="text-stone-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-48 bg-white/80 rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                      <img src="https://picsum.photos/seed/manuscript/400/300" alt="Manuscript" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                    </div>
                    <div className="h-48 bg-white/80 rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                      <img src="https://picsum.photos/seed/oldmap/400/300" alt="Old Map" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. PAIN SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Se você estuda ou ensina História, sabe o problema:
              </h2>
              <div className="space-y-6">
                {[
                  "Dificuldade em encontrar fontes confiáveis",
                  "Dúvidas na hora de citar corretamente",
                  "Perda de tempo organizando materiais",
                  "Risco de erro acadêmico"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-red-400 group-hover:bg-red-50 transition-colors">
                      <X size={20} />
                    </div>
                    <p className="text-lg text-slate-600 font-serif italic">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white rounded-[3rem] border border-slate-200 p-12 flex flex-col justify-center space-y-8 shadow-xl overflow-hidden group">
                <img 
                  src="https://picsum.photos/seed/old-library/800/800" 
                  alt="Old Library" 
                  className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <Quote className="text-slate-100 w-32 h-32 absolute top-8 right-8 -z-0" />
                <p className="text-2xl font-serif italic text-slate-800 relative z-10 leading-relaxed">
                  "O tempo gasto formatando referências e procurando documentos poderia ser investido na análise crítica e na escrita."
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <img 
                    src="https://picsum.photos/seed/professor/100/100" 
                    alt="Dr. Arnaldo Silva" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-sm">Dr. Arnaldo Silva</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Pesquisador Sênior</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section id="solucao" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900">
              A Clio Archive reúne tudo isso em um único ambiente.
            </h2>
            <p className="text-slate-500 text-lg">Tecnologia a serviço do rigor metodológico.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Fontes confiáveis", desc: "Acesso direto a acervos digitais de instituições renomadas.", icon: <Library />, seed: "ancient-books" },
              { title: "Contexto estruturado", desc: "Análise historiográfica e mapeamento de mentalidades.", icon: <Compass />, seed: "old-map-detail" },
              { title: "Citação ABNT", desc: "Geração automática conforme a NBR 6023 em um clique.", icon: <Scroll />, seed: "calligraphy" },
              { title: "Organização", desc: "Crie coleções e organize seu material por temas ou épocas.", icon: <Layers />, seed: "archive-boxes" },
              { title: "IA Assistiva", desc: "Localize trechos e temas específicos em segundos.", icon: <Sparkles />, seed: "digital-library" },
              { title: "Rigor Acadêmico", desc: "Ferramentas desenhadas por e para historiadores.", icon: <ShieldCheck />, seed: "university-hall" }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-950 transition-all group relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${item.seed}/400/300`} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-950 mb-6 shadow-sm group-hover:bg-slate-950 group-hover:text-blue-50 transition-all">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BENEFITS SECTION */}
      <section id="beneficios" className="py-32 bg-slate-950 text-blue-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { title: "Economize tempo", desc: "Reduza em até 70% o tempo gasto com busca e formatação.", icon: <Clock /> },
              { title: "Evite erros", desc: "Garanta que suas citações e fontes estejam sempre corretas.", icon: <CheckCircle2 /> },
              { title: "Pesquise com método", desc: "Siga um fluxo de trabalho acadêmico estruturado.", icon: <ShieldCheck /> },
              { title: "Organize sua produção", desc: "Mantenha todo seu material de pesquisa em um só lugar.", icon: <Layers /> }
            ].map((item, i) => (
              <div key={i} className="space-y-6">
                <div className="text-blue-200">{item.icon}</div>
                <h3 className="font-serif text-2xl font-bold">{item.title}</h3>
                <p className="text-blue-50/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="como-funciona" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900">Como funciona</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 hidden md:block -z-0" />
            {[
              { step: "01", title: "Busque o tema", desc: "Inicie sua investigação por palavras-chave ou épocas.", seed: "search-history" },
              { step: "02", title: "Acesse a fonte", desc: "Explore documentos originais e análises críticas.", seed: "old-document" },
              { step: "03", title: "Organize", desc: "Salve em suas coleções pessoais de pesquisa.", seed: "folders" },
              { step: "04", title: "Gere a citação", desc: "Copie a referência em ABNT pronta para o seu texto.", seed: "citation" }
            ].map((item, i) => (
              <div key={i} className="relative z-10 bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-4 hover:shadow-xl transition-all group overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${item.seed}/400/300`} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10">
                  <span className="font-mono text-slate-200 text-5xl font-black block group-hover:text-slate-100 transition-colors">{item.step}</span>
                  <h3 className="font-serif text-xl font-bold">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-serif text-4xl font-bold text-slate-900">Ideal para:</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Estudantes de Graduação", icon: <GraduationCap />, seed: "student" },
              { label: "TCC e Monografia", icon: <FileText />, seed: "writing" },
              { label: "Pós-graduação", icon: <BookOpen />, seed: "researcher" },
              { label: "Professores de História", icon: <Feather />, seed: "professor-history" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-200 text-center group hover:border-slate-900 transition-all">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-2 shadow-sm">
                  <img 
                    src={`https://picsum.photos/seed/${item.seed}/200/200`} 
                    alt={item.label} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-slate-900">{item.icon}</div>
                <p className="font-serif font-bold text-slate-800">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PLANS SECTION */}
      <section id="planos" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900">Planos</h2>
            <p className="text-slate-500 text-lg">Escolha a melhor forma de avançar em sua pesquisa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-8 flex flex-col">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold">Plano Gratuito</h3>
                <p className="text-slate-400 text-sm">Acesso Inicial</p>
              </div>
              <div className="text-4xl font-serif font-bold">R$ 0<span className="text-sm text-slate-400 font-sans font-normal">/mês</span></div>
              <ul className="space-y-4 flex-1">
                {["Acesso básico a fontes", "Busca limitada", "Visualização de documentos", "Sem exportação"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-slate-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={onStartFree}
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-slate-900 transition-all"
              >
                Começar grátis
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-10 bg-slate-950 text-blue-50 rounded-[2.5rem] border border-slate-800 space-y-8 flex flex-col relative overflow-hidden shadow-2xl shadow-slate-900/20">
              <div className="absolute top-6 right-6 bg-blue-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Recomendado
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold">Plano Profissional</h3>
                <p className="text-blue-50/40 text-sm">Pesquisa Acadêmica</p>
              </div>
              <div className="text-4xl font-serif font-bold">R$ 29<span className="text-sm text-blue-50/40 font-sans font-normal">/mês</span></div>
              <ul className="space-y-4 flex-1">
                {[
                  "Acesso completo à base",
                  "ABNT automático ilimitado",
                  "Exportação em PDF/DOCX",
                  "IA assistiva avançada",
                  "Organização de coleções"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-blue-50/80">
                    <CheckCircle2 size={16} className="text-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="space-y-4">
                <button 
                  onClick={onTestPro}
                  className="w-full py-4 bg-blue-500 text-slate-950 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-400 transition-all"
                >
                  Assinar Agora
                </button>
                <p className="text-center text-[10px] uppercase tracking-widest font-bold text-blue-50/40">
                  Teste gratuito por 7 dias
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. VALUE TRIGGER */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Quanto vale evitar um erro em um trabalho acadêmico?
            </h2>
            <p className="text-slate-500 text-xl font-serif italic">
              Quanto tempo você perde organizando suas fontes?
            </p>
          </div>
          <div className="p-12 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <p className="text-2xl font-serif text-slate-800 leading-relaxed italic">
              "A Clio Archive resolve em minutos o que antes levava horas de trabalho braçal e burocrático."
            </p>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-950 rounded-[4rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
            <img 
              src="https://picsum.photos/seed/library-dark/1600/900" 
              alt="Library Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#ffffff10,transparent)] pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-blue-50">
                Comece gratuitamente e avance com segurança acadêmica.
              </h2>
              <p className="text-blue-50/60 text-lg max-w-2xl mx-auto">
                Junte-se a milhares de pesquisadores que já transformaram seu método de trabalho.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button 
                onClick={onStartFree}
                className="w-full sm:w-auto px-10 py-5 bg-blue-500 text-slate-950 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-400 transition-all active:scale-95"
              >
                Começar grátis
              </button>
              <button 
                onClick={onTestPro}
                className="w-full sm:w-auto px-10 py-5 bg-slate-800 text-blue-50 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95 border border-slate-700"
              >
                Testar plano profissional
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-blue-50">
                  <History size={20} />
                </div>
                <span className="font-serif text-xl font-bold tracking-tight">ClioArchive</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Plataforma digital de auxílio à pesquisa histórica acadêmica. Rigor, método e tecnologia.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Produto</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Planos</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Metodologia</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Institucional</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Contato</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li>contato@clioarchive.com</li>
                <li>Suporte Acadêmico</li>
                <li>Imprensa</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-xs">
              ClioArchive© {new Date().getFullYear()} — Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
