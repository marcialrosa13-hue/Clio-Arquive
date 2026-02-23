export interface AcademicWorkType {
  title: string;
  description: string;
  link: string;
}

export const ACADEMIC_WORK_TYPES: AcademicWorkType[] = [
  {
    title: "Trabalho de Conclusão de Curso (TCC/Monografia)",
    description: "Trabalho acadêmico obrigatório para a obtenção de grau em cursos de graduação ou especialização. Consiste em uma pesquisa aprofundada sobre um tema específico, orientada por um professor, demonstrando a capacidade de síntese e aplicação de conhecimentos adquiridos.",
    link: "https://pt.wikipedia.org/wiki/Trabalho_de_conclus%C3%A3o_de_curso"
  },
  {
    title: "Artigo Científico",
    description: "Texto que apresenta e discute resultados de uma pesquisa original ou revisão de literatura. É destinado à publicação em periódicos especializados, seguindo normas rigorosas de redação e submetido à avaliação por pares.",
    link: "https://pt.wikipedia.org/wiki/Artigo_cient%C3%ADfico"
  },
  {
    title: "Resumo",
    description: "Apresentação concisa dos pontos principais de um texto, fornecendo uma visão geral do conteúdo, objetivos, métodos e conclusões. Essencial para indexação e para que leitores decidam sobre a leitura do texto completo.",
    link: "https://pt.wikipedia.org/wiki/Resumo"
  },
  {
    title: "Resenha",
    description: "Texto que combina o resumo de uma obra com uma análise crítica. O autor da resenha descreve o conteúdo e avalia a qualidade, relevância e contribuição da obra para a área do conhecimento.",
    link: "https://pt.wikipedia.org/wiki/Resenha"
  },
  {
    title: "Relatório",
    description: "Documento que descreve detalhadamente uma atividade, experimento, estágio ou pesquisa realizada. Apresenta dados, observações e resultados de forma objetiva e estruturada.",
    link: "https://pt.wikipedia.org/wiki/Relat%C3%B3rio"
  },
  {
    title: "Projeto de Pesquisa",
    description: "Documento que delineia o planejamento de uma pesquisa a ser realizada. Deve conter o problema, objetivos, justificativa, fundamentação teórica, metodologia e cronograma.",
    link: "https://pt.wikipedia.org/wiki/Projeto_de_pesquisa"
  },
  {
    title: "Pôster",
    description: "Recurso visual utilizado para apresentar resultados de pesquisas em eventos científicos. Deve ser autoexplicativo, combinando textos curtos, gráficos e imagens para facilitar a comunicação rápida.",
    link: "https://pt.wikipedia.org/wiki/P%C3%B4ster_cient%C3%ADfico"
  },
  {
    title: "Fichamento",
    description: "Técnica de estudo que consiste em registrar, de forma organizada, as informações mais relevantes de uma leitura. Pode ser de citação, de resumo ou analítico, facilitando a recuperação de dados para trabalhos futuros.",
    link: "https://pt.wikipedia.org/wiki/Fichamento"
  },
  {
    title: "Teses e Dissertações",
    description: "Trabalhos de conclusão de pós-graduação stricto sensu. A dissertação (Mestrado) demonstra domínio do tema e capacidade de pesquisa. A tese (Doutorado) deve apresentar uma contribuição original e inédita para o conhecimento científico.",
    link: "https://pt.wikipedia.org/wiki/Tese"
  }
];
