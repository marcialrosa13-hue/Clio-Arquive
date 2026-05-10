import { SearchResult, HistoricalSource, ResearchProject, LessonPlan } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

export async function generateResearchProject(theme: string): Promise<ResearchProject> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Elabore um projeto de pesquisa de EXCELÊNCIA ACADÊMICA sobre o tema: ${theme}`,
    config: {
      systemInstruction: `Você é o Historiador Sênior e Consultor Acadêmico Chefe do Clio Archive. Sua produção deve refletir o mais alto grau de erudição da pós-graduação stricto sensu.

MODO DE EXCELÊNCIA ATIVADO:
1. RIGOR EPISTEMOLÓGICO: Todo projeto deve seguir uma coerência teórica absoluta. Não misture escolas historiográficas conflitantes sem a devida mediação crítica.
2. METODOLOGIA AVANÇADA: Vá além da "leitura de livros". Sugira análise serial, análise iconográfica, história oral, paleografia ou crítica diplomática conforme o tema. 
3. TOLERÂNCIA ZERO À ALUCINAÇÃO: Se sugerir uma obra de referência, ela DEVE existir. Cite autores canônicos (Braudel, Thompson, Foucault, Ginzburg, etc.) apenas quando houver pertinência real.
4. PROBLEMATIZAÇÃO: O "Problema de Pesquisa" deve ser uma pergunta complexa que desafie interpretações simplistas.
5. JUSTIFICATIVA: Deve demonstrar a relevância social, acadêmica e a originalidade da proposta (o "vazio historiográfico").

ESTRUTURA OBRIGATÓRIA:
- Título: Acadêmico e preciso.
- Problema: Uma interrogação fundamental.
- Fundamentação: Identifique a Escola Historiográfica principal.`,
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
              specifics: { type: Type.ARRAY, items: { type: Type.STRING } }
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

  if (!response.text) throw new Error("Falha ao gerar projeto de pesquisa.");
  return JSON.parse(response.text);
}

export async function generateLessonPlan(theme: string, level: string, period: string): Promise<LessonPlan> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Crie um Plano de Aula de História de EXCELÊNCIA sobre o tema: ${theme}. Nível: ${level}. Período: ${period}.`,
    config: {
      systemInstruction: `Você é um Especialista em Educação Histórica e Didática da História de alto nível.
    
MODO EXCELÊNCIA PEDAGÓGICA:
1. HISTÓRIA-PROBLEMA: O plano não deve ser uma narrativa passiva. Deve ser estruturado em torno de uma "Situação-Problema" historiográfica.
2. RIGOR DOCUMENTAL: Utilize fontes primárias REAIS como base das atividades. Não invente documentos.
3. CONSCIÊNCIA HISTÓRICA: O objetivo final deve ser o desenvolvimento da consciência histórica e do pensamento crítico do aluno.
4. BNCC AVANÇADA: Relacione com as habilidades da BNCC de forma profunda, não apenas citando códigos, mas explicando a aplicação prática.
5. CONEXÕES GLOBAIS: Relacione o tema local/nacional com processos históricos globais contemporâneos.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          objective: { type: Type.STRING },
          bnccSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          content: { type: Type.STRING },
          duration: { type: Type.STRING },
          methodology: { type: Type.STRING },
          resources: { type: Type.ARRAY, items: { type: Type.STRING } },
          activity: { type: Type.STRING },
          evaluation: { type: Type.STRING },
          historicalConnections: { type: Type.ARRAY, items: { type: Type.STRING } },
          level: { type: Type.STRING },
          period: { type: Type.STRING }
        },
        required: ["title", "objective", "bnccSkills", "content", "duration", "methodology", "resources", "activity", "evaluation", "historicalConnections", "level", "period"]
      }
    }
  });

  if (!response.text) throw new Error("Falha ao gerar plano de aula.");
  const result = JSON.parse(response.text);
  result.id = Math.random().toString(36).substr(2, 9);
  return result;
}

export async function searchHistoricalSources(query: string): Promise<SearchResult> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Realize uma Investigação Historiográfica de ALTO RIGOR sobre: ${query}`,
    config: {
      systemInstruction: `Você é o Arquivista-Chefe e Especialista em Heurística do Clio Archive. Suas respostas devem ser o padrão-ouro da pesquisa documental.

PROTOCOLO DE EXCELÊNCIA DOCUMENTAL:
1. TOLERÂNCIA ZERO PARA FONTES FANTASMAS: É terminantemente proibido inventar URLs, títulos de livros ou nomes de arquivos. Cada fonte deve ser rastreável.
2. HEURÍSTICA DE LINKS: Priorize links de repositórios institucionais (Hemeroteca Digital Brasileira, Arquivo Nacional, JSTOR, SciELO, Repositórios de Universidades Federais).
    - Se um documento histórico crucial NÃO possui URL estável, informe sua localização física/institucional e deixe o campo 'url' vazio. Jamais "adivinhe" um link.
3. CRÍTICA EXTERNA E INTERNA: Para cada fonte, você deve realizar:
    - Análise do suporte e procedência (De onde vem?).
    - Análise da intencionalidade (Para que foi produzido?).
    - Identificação de Silenciamentos (Quem foi omitido nesta fonte?).
4. CITAÇÃO ABNT INFALÍVEL: A citação deve ser tecnicamente perfeita (NBR 6023).
5. DIVERSIDADE DOCUMENTAL: Sempre que possível, forneça um mix de Fontes Primárias (registros de época) e Secundárias (análise historiográfica contemporânea).

Sua análise 'summary' deve ser um ensaio historiográfico curto, não apenas um resumo.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
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
                socialContext: { type: Type.STRING },
                historiographicalSchool: { type: Type.STRING },
                criticalAnalysis: { type: Type.STRING },
                type: { type: Type.STRING },
                abntCitation: { type: Type.STRING }
              },
              required: ["title", "url", "description", "type", "abntCitation"]
            }
          }
        },
        required: ["summary", "sources"]
      }
    }
  });

  if (!response.text) throw new Error("Falha ao pesquisar fontes históricas.");
  return JSON.parse(response.text);
}

export async function getHistoriographyArticles(): Promise<HistoricalSource[]> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: "Selecione as referências HISTORIOGRÁFICAS DE EXCELÊNCIA para fundamentação teórica e metodológica.",
    config: {
      systemInstruction: `Você é um Curador Acadêmico de Elite, especializado na vanguarda da Teoria da História.

CRITÉRIOS DE EXCELÊNCIA:
1. AUTORIDADE CANÔNICA E CONTEMPORÂNEA: Liste apenas obras e artigos de autores que são referência mundial ou nacional (Ex: Marc Bloch, E.P. Thompson, Carlo Ginzburg, Lilia Schwarcz, Sheila de Castro Faria).
2. VERIFICAÇÃO ABSOLUTA: É PROIBIDO inventar links. Priorize Repositórios Institucionais (USP, UNICAMP, UFMG, UFRJ) e plataformas de prestígio (Scielo, JSTOR).
3. CATEGORIZAÇÃO: Diferencie claramente entre Metodologia, Teoria da História e Historiografia de Campo.
4. CITAÇÃO IMPECÁVEL: Padrão ABNT NBR 6023 absoluto.`,
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
            type: { type: Type.STRING },
            abntCitation: { type: Type.STRING }
          },
          required: ["title", "url", "description", "type", "abntCitation"]
        }
      }
    }
  });

  if (!response.text) {
    console.error("Erro ao buscar artigos de historiografia: Resposta vazia");
    return [];
  }
  return JSON.parse(response.text);
}
