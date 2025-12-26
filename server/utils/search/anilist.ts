import type { SearchProvider } from './types';
import type { ManhwaSearchResult } from '~~/shared/types/manhwa-search-result';

export class AniListSearchProvider implements SearchProvider {
  name = 'AniList';

  async search(search: string): Promise<ManhwaSearchResult[]> {
    const query = `
      query ($search: String!, $type: MediaType, $sort: [MediaSort], $perPage: Int) {
        Page(perPage: $perPage) {
          media(search: $search, type: $type, sort: $sort)  {
            id
            title {
              english
              romaji
            }
            synonyms
            coverImage {
              medium
            }
          }
        }
      }
    `;

    const variables = {
      type: 'MANGA',
      search,
      sort: 'FAVOURITES_DESC',
      perPage: 10,
    };

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const mediaList = data.data.Page.media;

      return mediaList.map((media: any) => ({
        id: media.id,
        title: media.title.english || media.title.romaji || media.synonyms[0] || 'Unknown Title',
        coverImage: media.coverImage.medium,
      }));
    } catch (error) {
      console.error('AniList search failed:', error);
      return [];
    }
  }
}
