import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, HistoricalSource, ResearchProject } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("A chave da API Gemini não foi configurada. Verifique as variáveis de ambiente.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export async function generateResearchProject(theme: string): Promise<ResearchProject> {
  const ai = getAi();
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `Você é um orientador acadêmico de alto nível com rigor científico absoluto. 
Sua tarefa é elaborar um projeto de pesquisa estruturado e rigoroso baseado no tema fornecido pelo usuário.

REGRAS DE RIGOR:
1. NÃO INVENTE informações. Siga fielmente o conhecimento historiográfico estabelecido.
2. Se o tema for obscuro ou não houver informações suficientes para um projeto coerente, informe isso claramente no campo de justificativa ou metodologia, indicando que a pesquisa precisa ser confirmada por outras fontes.
3. Utilize terminologia acadêmica precisa.

O projeto deve conter:
1. Título sugestivo e acadêmico.
2. Delimitação do tema.
3. Problema de pesquisa (pergunta norteadora).
4. Objetivos (Geral e Específicos).
5. Justificativa (relevância social e acadêmica).
6. Metodologia (procedimentos técnicos e teóricos).
7. Fundamentação Teórica (principais conceitos e autores).
8. Resultados Esperados.

Retorne os dados em formato JSON estruturado.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Elabore um projeto de pesquisa completo sobre o tema: ${theme}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          theme: { type: Type.STRING },
          problem: { type: Type.STRING },
          objectives: {
            type: Type.OBJECT,
            properties: {
              general: { type: Type.STRING },
              specifics: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["general", "specifics"]
          },
          justification: { type: Type.STRING },
          methodology: { type: Type.STRING },
          theoreticalFramework: { type: Type.STRING },
          expectedResults: { type: Type.STRING }
        },
        required: ["title", "theme", "problem", "objectives", "justification", "methodology", "theoreticalFramework", "expectedResults"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as ResearchProject;
  } catch (e) {
    console.error("Erro ao gerar projeto de pesquisa:", e);
    throw new Error("Falha ao gerar projeto de pesquisa.");
  }
}

export async function searchHistoricalSources(query: string): Promise<SearchResult> {
  const ai = getAi();
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `Você é um assistente especializado em pesquisa historiográfica de alto nível, com rigor científico absoluto e foco total na veracidade dos dados.
Sua tarefa é encontrar fontes históricas diversificadas, seguindo fielmente as evidências documentais.

REGRAS DE RIGOR E VERACIDADE:
1. NÃO INVENTE OU ALUCINE informações. Se uma data, autor ou instituição não for confirmada pelas fontes, não a forneça ou indique a incerteza.
2. SIGA FIELMENTE AS FONTES. A precisão é mais importante do que a quantidade.
3. Se não houver informação coerente ou suficiente sobre a pesquisa solicitada, você DEVE informar no campo "summary" que não há dados suficientes e que a pesquisa precisa ser confirmada por outras fontes externas.
4. NUNCA invente URLs. Forneça apenas links reais e verificáveis.

TIPOS DE FONTES ESPERADOS:
- Documentos oficiais (document)
- Imagens e fotografias (image)
- Livros (book)
- Artigos acadêmicos (article)
- Acervos e arquivos (archive)
- Periódicos e jornais (newspaper)
- Literatura como fonte (literature)
- Cartas e correspondências (letter)
- Relatos e História Oral (oral_history)

REGRAS CRÍTICAS PARA URLs:
1. Você DEVE fornecer URLs REAIS, ATIVAS e DIRETAS para a fonte específica (o documento, o PDF ou a página exata do artigo). URLs genéricas que apontam apenas para a página inicial da instituição (ex: apenas "scielo.br" ou "bn.gov.br") são TERMINANTEMENTE PROIBIDAS.
2. A URL deve levar o usuário diretamente ao conteúdo. Se a fonte for um artigo no SciELO, o link deve conter o ID do artigo (ex: scielo.br/j/abc/a/123...).
3. Use a ferramenta Google Search para VALIDAR se o link que você está fornecendo realmente abre o conteúdo descrito.
4. Se não encontrar uma URL profunda e funcional para a fonte específica, NÃO a inclua na lista. É melhor ter menos fontes do que fontes com links genéricos ou quebrados.
5. PREFIRA domínios confiáveis como: .gov, .edu, .org, scielo.br, bndigital.bn.gov.br, jstor.org, archive.org.

Para cada fonte encontrada:
1. Identificar o título, autor, data, instituição e URL verificada.
2. Fornecer uma descrição detalhada da importância historiográfica.
3. Fornecer um "Contexto Social/Mentalidades" (socialContext) explicando como a fonte revela a vida cotidiana, sensibilidades ou estruturas de longa duração da época.
4. Gerar a citação ABNT (NBR 6023) perfeita.
5. Classificar o tipo de fonte corretamente.

Retorne os dados em formato JSON estruturado.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Pesquise fontes históricas sobre: ${query}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "Um resumo geral sobre a disponibilidade e contexto das fontes encontradas.",
          },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                author: { type: Type.STRING },
                date: { type: Type.STRING },
                institution: { type: Type.STRING },
                url: { type: Type.STRING },
                description: { type: Type.STRING },
                socialContext: { 
                  type: Type.STRING,
                  description: "Análise da fonte sob a perspectiva das mentalidades, cotidiano ou longa duração."
                },
                type: { 
                  type: Type.STRING,
                  enum: ['document', 'image', 'book', 'article', 'archive', 'newspaper', 'literature', 'letter', 'oral_history']
                },
                abntCitation: { 
                  type: Type.STRING,
                  description: "Citação completa em formato ABNT."
                }
              },
              required: ["title", "url", "description", "type", "abntCitation"]
            }
          }
        },
        required: ["summary", "sources"]
      },
      tools: [{ googleSearch: {} }]
    }
  });

  try {
    return JSON.parse(response.text || "{}") as SearchResult;
  } catch (e) {
    console.error("Erro ao processar resposta do Gemini:", e);
    throw new Error("Falha ao processar resultados da pesquisa.");
  }
}

export async function getHistoriographyArticles(): Promise<HistoricalSource[]> {
  const ai = getAi();
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `Você é um curador de conteúdo acadêmico especializado em teoria e metodologia da história.
Seu objetivo é fornecer uma lista de 4 a 5 artigos ou textos fundamentais e VERIFICÁVEIS sobre pesquisa historiográfica, obrigatoriamente incluindo fontes do SciELO e referências encontradas via Google Acadêmico.

REGRAS PARA URLs:
1. Use apenas URLs DIRETAS e PROFUNDAS de repositórios acadêmicos (SciELO, JSTOR, Google Acadêmico, Repositórios de Universidades). O link deve abrir o artigo específico ou seu PDF, nunca apenas a página inicial do repositório.
2. Certifique-se de que os links levam ao PDF ou à página de resumo oficial do artigo específico.
3. NÃO gere links genéricos. Se o artigo é "X", o link deve conter o identificador de "X".

Cada item deve conter: título, autor, descrição curta, URL funcional e citação ABNT.`;

  const response = await ai.models.generateContent({
    model,
    contents: "Forneça artigos fundamentais sobre metodologia e teoria da pesquisa historiográfica.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            url: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['article', 'book'] },
            abntCitation: { type: Type.STRING }
          },
          required: ["title", "url", "description", "type", "abntCitation"]
        }
      },
      tools: [{ googleSearch: {} }]
    }
  });

  try {
    return JSON.parse(response.text || "[]") as HistoricalSource[];
  } catch (e) {
    console.error("Erro ao buscar artigos de historiografia:", e);
    return [];
  }
}
