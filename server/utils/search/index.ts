import { AniListSearchProvider } from './anilist';
import { MangaUpdatesSearchProvider } from './mangaupdates';
import type { SearchProvider } from './types';
import type { ManhwaSearchResult } from '~~/shared/types/manhwa-search-result';

const providers: SearchProvider[] = [new AniListSearchProvider(), new MangaUpdatesSearchProvider()];

export async function searchManhwa(query: string): Promise<ManhwaSearchResult[]> {
  // AniList first
  const anilistProvider = providers.find(p => p.name === 'AniList');
  if (anilistProvider) {
    const results = await anilistProvider.search(query);
    if (results.length > 0) {
      return results;
    }
  }

  // Then MangaUpdates
  const mangaUpdatesProvider = providers.find(p => p.name === 'MangaUpdates');
  if (mangaUpdatesProvider) {
    return await mangaUpdatesProvider.search(query);
  }

  return [];
}
