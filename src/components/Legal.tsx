import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, ChevronLeft, Lock, Scale, Eye } from 'lucide-react';

interface LegalProps {
  onBack: () => void;
  type: 'terms' | 'privacy';
}

export const Legal: React.FC<LegalProps> = ({ onBack, type }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-all font-bold uppercase tracking-widest text-xs"
      >
        <ChevronLeft size={16} />
        Voltar
      </button>

      <div className="space-y-8 bg-white p-12 rounded-[2.5rem] academic-shadow border border-stone-100">
        <div className="flex items-center gap-4 text-stone-900 border-b border-stone-100 pb-8">
          <div className="p-4 bg-stone-50 rounded-2xl">
            {type === 'terms' ? <Scale size={32} /> : <Lock size={32} />}
          </div>
          <div>
            <h2 className="font-serif text-4xl font-bold tracking-tight">
              {type === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
            </h2>
            <p className="text-stone-400 text-sm italic mt-1">Última atualização: Maio de 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed space-y-8 font-serif">
          {type === 'terms' ? (
            <>
              <section className="space-y-4">
                <h3 className="text-stone-900 text-xl font-bold">1. Aceitação dos Termos</h3>
                <p>Ao acessar e utilizar o Clio Archive, você concorda em cumprir estes termos de serviço. O aplicativo é voltado para uso acadêmico e investigativo, exigindo comportamento ético na manipulação de fontes históricas.</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-stone-900 text-xl font-bold">2. Responsabilidade sobre Conteúdo IA</h3>
                <p>O Clio Archive utiliza Inteligência Artificial para processar e analisar fontes. Embora busquemos a excelência acadêmica, os resultados gerados são ferramentas de apoio. O usuário é o pesquisador responsável pela verificação final e interpretação historiográfica.</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-stone-900 text-xl font-bold">3. Propriedade Intelectual</h3>
                <p>O design, algoritmos e estrutura do Clio Archive são protegidos. O conteúdo gerado (projetos de pesquisa, planos de aula) pertence ao usuário, respeitando as devidas citações das fontes originais utilizadas.</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-stone-900 text-xl font-bold">4. Planos e Assinaturas</h3>
                <p>O acesso a integrações avançadas de arquivos globais e exportações ABNT automáticas é restrito aos planos Profissional e Institucional.</p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-4">
                <h3 className="text-stone-900 text-xl font-bold">1. Coleta de Dados</h3>
                <p>Coletamos informações básicas de perfil (Google Auth) para personalizar seu acervo e monitorar limites de uso do plano escolhido.</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-stone-900 text-xl font-bold">2. Segurança do Acervo</h3>
                <p>Suas fontes e pesquisas salvas no "Acervo" são protegidas por protocolos de segurança Firebase. Ninguém além de você e administradores do sistema tem acesso a esses dados.</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-stone-900 text-xl font-bold">3. Transparência Algorítmica</h3>
                <p>Não compartilhamos seus termos de pesquisa com terceiros para fins publicitários. Os dados são utilizados exclusivamente para o aprimoramento da precisão histórica do Clio Archive.</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-stone-900 text-xl font-bold">4. Seus Direitos</h3>
                <p>Você tem total direito de exportar ou solicitar a exclusão definitiva de seu acervo e dados de perfil a qualquer momento através das configurações do aplicativo.</p>
              </section>
            </>
          )}
        </div>

        <div className="pt-8 border-t border-stone-100 flex items-center gap-3 text-stone-400 text-sm">
          <Shield size={16} />
          <p>Compromisso Clio Archive com o rigor documental e privacidade do pesquisador.</p>
        </div>
      </div>
    </motion.div>
  );
};
