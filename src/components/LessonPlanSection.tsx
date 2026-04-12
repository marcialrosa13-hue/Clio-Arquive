import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  Brain, 
  FileText, 
  Download, 
  Edit, 
  Star, 
  Sparkles,
  ChevronRight,
  Home,
  Presentation,
  ExternalLink,
  Loader2,
  Check,
  Info,
  Bookmark
} from 'lucide-react';
import { motion } from 'motion/react';
import { LessonPlan } from '../types';
import { generateLessonPlan } from '../services/gemini';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LessonPlanSectionProps {
  user: any;
  onBack: () => void;
}

export const LessonPlanSection: React.FC<LessonPlanSectionProps> = ({ user, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [bnccFilter, setBnccFilter] = useState('');
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdatePlan = (field: keyof LessonPlan, value: any) => {
    if (!selectedPlan) return;
    setSelectedPlan({ ...selectedPlan, [field]: value });
  };

  const toggleFavorite = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(planId)) {
      newFavorites.delete(planId);
    } else {
      newFavorites.add(planId);
    }
    setFavorites(newFavorites);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!user || !selectedPlan) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'lesson_plans'), {
        ...selectedPlan,
        savedAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const plan = await generateLessonPlan(
        searchTerm + (bnccFilter ? ` (Habilidades BNCC: ${bnccFilter})` : ''), 
        selectedLevel === 'all' ? 'Ensino Médio' : selectedLevel, 
        selectedPeriod === 'all' ? 'História do Brasil' : selectedPeriod
      );
      setPlans([plan, ...plans]);
      setSelectedPlan(plan);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="font-serif text-5xl font-bold text-stone-900 tracking-tight">Planos de Aula</h2>
          <p className="text-stone-500 text-lg font-serif italic">Rigor histórico e didática para todos os níveis.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-stone-200 transition-all shadow-sm"
        >
          <Home size={16} />
          Início
        </button>
      </div>

      {!selectedPlan ? (
        <div className="space-y-8">
          {/* Search and Filters */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="text"
                placeholder="Busque por tema (ex: Revolução Francesa, Escravidão no Brasil...)"
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-stone-900 transition-all text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                onClick={handleGenerate}
                disabled={loading || !searchTerm}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-900 text-amber-50 px-6 py-2.5 rounded-xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Gerar com IA
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Nível de Ensino</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'Fundamental I', 'Fundamental II', 'Ensino Médio'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        selectedLevel === level ? "bg-stone-900 text-amber-50" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      )}
                    >
                      {level === 'all' ? 'Todos' : level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Período Histórico</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'Antiga', 'Medieval', 'Moderna', 'Contemporânea', 'História do Brasil'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        selectedPeriod === period ? "bg-stone-900 text-amber-50" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      )}
                    >
                      {period === 'all' ? 'Todos' : period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Habilidades BNCC (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Ex: EF09HI01, EM13CHS101..."
                  className="w-full px-4 py-2 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-stone-900 transition-all text-sm"
                  value={bnccFilter}
                  onChange={(e) => setBnccFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Plans List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                layoutId={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-stone-50 rounded-2xl text-stone-900 group-hover:bg-stone-900 group-hover:text-amber-50 transition-colors">
                    <Presentation size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => toggleFavorite(e, plan.id)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        favorites.has(plan.id) ? "text-amber-500 bg-amber-50" : "text-stone-300 hover:text-stone-400 bg-stone-50"
                      )}
                    >
                      <Star size={18} fill={favorites.has(plan.id) ? "currentColor" : "none"} />
                    </button>
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-md tracking-wider flex items-center">
                      {plan.level}
                    </span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{plan.title}</h3>
                <p className="text-stone-500 text-sm line-clamp-2 italic mb-4">{plan.objective}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{plan.period}</span>
                  <ChevronRight size={18} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden"
        >
          {/* Plan Detail Header */}
          <div className="bg-stone-900 p-8 md:p-12 text-amber-50 relative overflow-hidden">
            <div className="hidden print:block text-stone-900 mb-4">
              <h1 className="text-2xl font-bold">ClioArchive - Plano de Aula</h1>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-amber-400/20 text-amber-200 text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-sm border border-amber-400/30">
                  {selectedPlan.level}
                </span>
                <span className="px-3 py-1 bg-stone-800 text-stone-400 text-xs font-bold uppercase tracking-widest rounded-full border border-stone-700">
                  {selectedPlan.period}
                </span>
                <span className="px-3 py-1 bg-stone-800 text-stone-400 text-xs font-bold uppercase tracking-widest rounded-full border border-stone-700 flex items-center gap-1">
                  <Clock size={12} />
                  {selectedPlan.duration}
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl">
                {selectedPlan.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button 
                  onClick={handleSave}
                  disabled={saving || saveSuccess}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg",
                    saveSuccess 
                      ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                      : "bg-amber-400 text-stone-900 hover:bg-amber-300 shadow-amber-400/20"
                  )}
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : saveSuccess ? <Check size={18} /> : <Bookmark size={18} />}
                  {saveSuccess ? 'Salvo!' : 'Salvar plano'}
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-3 bg-stone-800 text-amber-50 rounded-2xl font-bold hover:bg-stone-700 transition-all"
                >
                  <Download size={18} />
                  Exportar PDF
                </button>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all",
                    isEditing ? "bg-amber-100 text-amber-700" : "bg-stone-800 text-amber-50 hover:bg-stone-700"
                  )}
                >
                  <Edit size={18} />
                  {isEditing ? 'Finalizar Edição' : 'Editar Plano'}
                </button>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="flex items-center gap-2 px-6 py-3 bg-stone-800/50 text-stone-400 rounded-2xl font-bold hover:bg-stone-800 transition-all"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>

          {/* Plan Content */}
          <div className="p-8 md:p-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                {/* Objective */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 text-stone-900">
                    <div className="p-2 bg-stone-100 rounded-lg">
                      <Target size={20} />
                    </div>
                    <h3 className="text-xl font-bold font-serif">Objetivo da Aula</h3>
                  </div>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-stone-900 min-h-[100px]"
                      value={selectedPlan.objective}
                      onChange={(e) => handleUpdatePlan('objective', e.target.value)}
                    />
                  ) : (
                    <p className="text-stone-600 text-lg leading-relaxed">{selectedPlan.objective}</p>
                  )}
                </section>

                {/* Content */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 text-stone-900">
                    <div className="p-2 bg-stone-100 rounded-lg">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="text-xl font-bold font-serif">Conteúdo Histórico</h3>
                  </div>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-stone-900 min-h-[200px]"
                      value={selectedPlan.content}
                      onChange={(e) => handleUpdatePlan('content', e.target.value)}
                    />
                  ) : (
                    <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {selectedPlan.content}
                    </div>
                  )}
                </section>

                {/* Methodology */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 text-stone-900">
                    <div className="p-2 bg-stone-100 rounded-lg">
                      <Brain size={20} />
                    </div>
                    <h3 className="text-xl font-bold font-serif">Metodologia e Passo a Passo</h3>
                  </div>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-stone-900 min-h-[200px]"
                      value={selectedPlan.methodology}
                      onChange={(e) => handleUpdatePlan('methodology', e.target.value)}
                    />
                  ) : (
                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {selectedPlan.methodology}
                    </div>
                  )}
                </section>

                {/* Activity */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 text-stone-900">
                    <div className="p-2 bg-stone-100 rounded-lg">
                      <Edit size={20} />
                    </div>
                    <h3 className="text-xl font-bold font-serif">Atividade Prática</h3>
                  </div>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-stone-900 min-h-[100px]"
                      value={selectedPlan.activity}
                      onChange={(e) => handleUpdatePlan('activity', e.target.value)}
                    />
                  ) : (
                    <div className="p-6 border-2 border-dashed border-stone-200 rounded-3xl text-stone-600 italic">
                      {selectedPlan.activity}
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-8">
                {/* BNCC Skills */}
                <section className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 space-y-4">
                  <div className="flex items-center gap-3 text-amber-900">
                    <Brain size={20} />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Habilidades BNCC</h3>
                  </div>
                  <div className="space-y-2">
                    {selectedPlan.bnccSkills.map((skill, i) => (
                      <div key={i} className="flex gap-2 text-sm text-amber-800 bg-white/50 p-2 rounded-lg border border-amber-200/50">
                        <span className="font-bold shrink-0">•</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Resources */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Recursos Didáticos</h4>
                  <div className="space-y-2">
                    {selectedPlan.resources.map((res, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white border border-stone-100 rounded-xl text-stone-600 text-sm">
                        <FileText size={16} className="text-stone-400" />
                        {res}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Historical Connections */}
                <section className="space-y-4">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Conexão com Fontes</h4>
                  <div className="space-y-2">
                    {selectedPlan.historicalConnections.map((conn, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-stone-900 text-amber-50 rounded-xl text-xs font-medium group cursor-pointer hover:bg-stone-800 transition-all">
                        <ExternalLink size={14} className="text-amber-400" />
                        {conn}
                      </div>
                    ))}
                  </div>
                </section>

                {/* AI Disclaimer */}
                <div className="p-4 bg-stone-100 rounded-2xl flex gap-3 text-stone-500 text-xs italic">
                  <Info size={16} className="shrink-0" />
                  <p>Conteúdo gerado com apoio de IA. Recomenda-se revisão do professor.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
