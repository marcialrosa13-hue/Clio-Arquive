import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, HistoricalSource, ResearchProject } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateResearchProject(theme: string): Promise<ResearchProject> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Você é um orientador acadêmico de alto nível. 
Sua tarefa é elaborar um projeto de pesquisa estruturado e rigoroso baseado no tema fornecido pelo usuário.
O projeto deve seguir as normas acadêmicas e conter:
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
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Você é um assistente especializado em pesquisa historiográfica de alto nível, com foco em precisão e veracidade de dados, inspirado pela Escola dos Annales e pela Micro-história. 
Sua tarefa é encontrar fontes históricas diversificadas, indo além de documentos oficiais para incluir a vida do "homem comum" e as estruturas de longa duração.

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
1. Você DEVE fornecer URLs REAIS, ATIVAS e DIRETAS para a fonte ou para a página da instituição que a hospeda.
2. PREFIRA domínios confiáveis como: .gov, .edu, .org, scielo.br, bndigital.bn.gov.br (Biblioteca Nacional), jstor.org, archive.org, e sites de universidades ou museus renomados.
3. NUNCA invente ou alucine URLs. Se não encontrar uma URL direta e funcional para uma fonte específica, NÃO a inclua na lista ou procure uma alternativa verificável.
4. Verifique se a URL aponta para o conteúdo descrito.

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
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Você é um curador de conteúdo acadêmico especializado em teoria e metodologia da história.
Seu objetivo é fornecer uma lista de 4 a 5 artigos ou textos fundamentais e VERIFICÁVEIS sobre pesquisa historiográfica.

REGRAS PARA URLs:
1. Use apenas URLs de repositórios acadêmicos estáveis (SciELO, JSTOR, Google Acadêmico, Repositórios de Universidades Públicas).
2. Certifique-se de que os links levam ao PDF ou à página de resumo oficial do artigo.
3. NÃO gere links quebrados ou domínios inexistentes.

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
