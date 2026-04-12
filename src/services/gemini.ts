import { SearchResult, HistoricalSource, ResearchProject } from "../types";

export async function generateResearchProject(theme: string): Promise<ResearchProject> {
  const response = await fetch("/api/gemini/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Falha ao gerar projeto de pesquisa.");
  }
  return response.json();
}

export async function searchHistoricalSources(query: string): Promise<SearchResult> {
  const response = await fetch("/api/gemini/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Falha ao pesquisar fontes históricas.");
  }
  return response.json();
}

export async function getHistoriographyArticles(): Promise<HistoricalSource[]> {
  const response = await fetch("/api/gemini/articles");
  if (!response.ok) {
    const error = await response.json();
    console.error("Erro ao buscar artigos de historiografia:", error);
    return [];
  }
  return response.json();
}
