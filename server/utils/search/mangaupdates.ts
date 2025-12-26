import type { SearchProvider } from './types';
import type { ManhwaSearchResult } from '~~/shared/types/manhwa-search-result';

export class MangaUpdatesSearchProvider implements SearchProvider {
  name = 'MangaUpdates';

  async search(search: string): Promise<ManhwaSearchResult[]> {
    try {
      const response = await fetch('https://api.mangaupdates.com/v1/series/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          search,
          perpage: 10,
          orderby: 'score',
        }),
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      if (!data.results) {
        return [];
      }

      return data.results.map((item: any) => {
        const record = item.record;
        return {
          id: -record.series_id,
          title: record.title,
          coverImage: record.image?.url?.thumb || record.image?.url?.original || null,
        };
      });
    } catch (error) {
      console.error('MangaUpdates search failed:', error);
      return [];
    }
  }
}
