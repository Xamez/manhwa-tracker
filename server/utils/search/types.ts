import type { ManhwaSearchResult } from '~~/shared/types/manhwa-search-result';

export interface SearchProvider {
  name: string;
  search(query: string): Promise<ManhwaSearchResult[]>;
}
