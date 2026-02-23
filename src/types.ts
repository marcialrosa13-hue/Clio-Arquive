export interface HistoricalSource {
  title: string;
  author?: string;
  date?: string;
  institution?: string;
  url: string;
  description: string;
  type: 'document' | 'image' | 'book' | 'article' | 'archive';
  abntCitation?: string;
}

export interface SearchResult {
  sources: HistoricalSource[];
  summary: string;
}
