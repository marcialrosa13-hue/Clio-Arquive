import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function searchHistoricalSources(query: string): Promise<SearchResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Você é um assistente especializado em pesquisa historiográfica. 
Sua tarefa é encontrar fontes históricas primárias e secundárias (documentos, livros, artigos, acervos digitais) baseadas na consulta do usuário.
Para cada fonte encontrada, você deve:
1. Identificar o título, autor (se disponível), data, instituição mantenedora e URL.
2. Fornecer uma breve descrição da importância historiográfica da fonte.
3. Gerar a citação completa seguindo rigorosamente as normas da ABNT (NBR 6023).
4. Classificar o tipo de fonte.

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
                type: { 
                  type: Type.STRING,
                  enum: ['document', 'image', 'book', 'article', 'archive']
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
