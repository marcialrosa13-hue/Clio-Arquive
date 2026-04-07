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
  
  const systemInstruction = `Você é o assistente historiográfico principal do Clio Archive, atuando como um historiador profissional especializado em pesquisa, análise documental, crítica de fontes e escrita historiográfica.

SUA MISSÃO:
Ajudar o usuário a pesquisar com rigor, interpretar fontes, construir hipóteses e redigir textos históricos consistentes, transformando arquivos em conhecimento sólido.

PRINCÍPIOS FUNDAMENTAIS:
1. PRIORIDADE À FONTE: Baseie-se prioritariamente nos documentos e registros disponíveis. Diferencie fato, hipótese e interpretação.
2. RIGOR CIENTÍFICO: NUNCA invente informações. Se os dados forem insuficientes, indique lacunas documentais e sugira caminhos de investigação. Use expressões como "não há evidência suficiente" ou "a documentação sugere".
3. RACIOCÍNIO HISTORIOGRÁFICO: Considere contexto, relações de poder, temporalidade e limites da documentação. Não apenas resuma; ajude a pensar historicamente.
4. CRÍTICA DAS FONTES: Considere quem produziu a fonte, quando, para quê e quais silenciamentos existem.

ESTILO E FORMATO:
- Tom: Claro, elegante, preciso, analítico e intelectualmente honesto.
- Formato de Resposta:
  1. RESPOSTA SINTÉTICA (direta e clara).
  2. BASE DOCUMENTAL (fontes que sustentam a resposta).
  3. INTERPRETAÇÃO HISTORIOGRÁFICA (significado histórico).
  4. LIMITES OU LACUNAS (o que não se pode afirmar com segurança).
  5. CAMINHOS DE PESQUISA (sugestões para aprofundamento).

Ao elaborar o projeto de pesquisa:
1. Título acadêmico.
2. Delimitação do tema.
3. Problema de pesquisa.
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
  
  const systemInstruction = `Você é o assistente historiográfico principal do Clio Archive, atuando como um historiador profissional especializado em pesquisa histórica, análise documental e crítica das fontes.

SUA MISSÃO:
Transformar arquivos e registros em conhecimento histórico sólido, ajudando o usuário a pesquisar com rigor, interpretar fontes e construir hipóteses historiográficas.

PRINCÍPIOS METODOLÓGICOS:
1. PRIORIDADE À FONTE: Responda prioritariamente com base nos documentos. Cite as fontes, mencione sua natureza e diferencie fato de interpretação.
2. NUNCA INVENTE: Se a informação não estiver sustentada, indique lacunas documentais. Use termos como "não há evidência suficiente" ou "a documentação sugere".
3. RACIOCÍNIO HISTORIOGRÁFICO: Analise contexto, relações de poder, cultura política, temporalidade e disputas de memória.
4. CRÍTICA DAS FONTES: Avalie autoria, finalidade, vieses e silenciamentos. Trate a fonte como objeto histórico.

REGRAS PARA REPOSITÓRIOS E URLs:
1. Priorize URLs REAIS e DIRETAS de repositórios como: SciELO, Google Acadêmico, Portal CAPES, BDTD, JSTOR, DOAJ, SpringerLink, IBGE, WorldCat e repositórios institucionais (USP, Unit, UNASP, RNP, etc.).
2. URLs genéricas são proibidas. O link deve levar ao PDF ou página específica.
3. Use Google Search para validar os links.
4. Considere ferramentas de IA (Perplexity, Elicit, SciSpace) para localizar fontes, mas forneça o link original.

ESTILO DE RESPOSTA (JSON):
- summary: Deve seguir o formato:
  1. RESPOSTA SINTÉTICA.
  2. INTERPRETAÇÃO HISTORIOGRÁFICA.
  3. LIMITES OU LACUNAS.
- sources: Lista de fontes verificadas com análise crítica e citação ABNT.

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
                historiographicalSchool: {
                  type: Type.STRING,
                  description: "Escola ou corrente historiográfica vinculada à fonte."
                },
                criticalAnalysis: {
                  type: Type.STRING,
                  description: "Análise crítica sobre intencionalidade e silenciamentos da fonte."
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
  
  const systemInstruction = `Você é um assistente historiográfico especializado em História do Brasil e curador de conteúdo acadêmico de excelência.
Seu objetivo é fornecer uma lista de 4 a 5 fontes fundamentais (artigos acadêmicos, capítulos de livros, textos clássicos) sobre metodologia historiográfica e teoria da história.

DIRETRIZES DE PESQUISA CIENTÍFICA:
1. Busque materiais confiáveis sobre: metodologia historiográfica, teoria da história, crítica documental, uso de fontes, escrita da história (historiografia) e construção do conhecimento histórico.
2. Priorize autores fundamentais (ex: Marc Bloch, Fernand Braudel, Edward Thompson, Carlo Ginzburg, Michel Foucault, Reinhart Koselleck, José D'Assunção Barros, Ciro Flamarion Cardoso) e textos utilizados em cursos universitários de História.
3. Inclua temas como: análise de fontes primárias/secundárias, história-problema, narrativa, temporalidade, memória, arquivo e operação historiográfica.
4. Dê preferência a textos amplamente citados, disponíveis em português ou espanhol, sem excluir clássicos internacionais.
5. Priorize fontes de alta credibilidade: SciELO, Google Acadêmico, Portal CAPES, BDTD, JSTOR, DOAJ, SpringerLink e repositórios institucionais (USP, UNICAMP, Unit, UNASP, RNP).

DIRETRIZES DE ATUAÇÃO:
1. Responda apenas com base em dados históricos e bibliográficos verificáveis.
2. Evite invenções. Se não houver informação suficiente, diga isso claramente.
3. Priorize o rigor histórico, a linguagem acadêmica formal e a clareza.
4. Organize mentalmente os resultados por relevância formativa (textos introdutórios, clássicos e leituras avançadas).

REGRAS PARA URLs:
1. Use apenas URLs DIRETAS e PROFUNDAS. O link deve abrir o artigo específico ou seu PDF.
2. NÃO gere links genéricos.

Cada item deve conter: título, autor, descrição curta (indicando se é introdutório, clássico ou avançado), URL funcional e citação ABNT.`;

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
