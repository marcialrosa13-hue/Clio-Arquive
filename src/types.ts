export interface HistoricalSource {
  title: string;
  author?: string;
  date?: string;
  institution?: string;
  url: string;
  description: string;
  socialContext?: string;
  historiographicalSchool?: string;
  criticalAnalysis?: string;
  type: 'document' | 'image' | 'book' | 'article' | 'archive' | 'newspaper' | 'literature' | 'letter' | 'oral_history';
  abntCitation?: string;
  relevance?: number;
  tags?: string[];
}

export interface SearchResult {
  sources: HistoricalSource[];
  summary: string;
}

export interface SavedSearch {
  id: string;
  query: string;
  date: string;
  result: SearchResult;
}

export interface ResearchProject {
  title: string;
  theme: string;
  problem: string;
  objectives: {
    general: string;
    specifics: string[];
  };
  justification: string;
  methodology: string;
  theoreticalFramework: string;
  expectedResults: string;
}
