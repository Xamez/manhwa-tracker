import type { Manhwa } from '~~/shared/types/manhwa';

// ID is negative to differentiate from AniList IDs
export async function fetchMangaUpdatesDetails(id: number): Promise<Manhwa | null> {
  const seriesId = Math.abs(id);

  try {
    const response = await fetch(`https://api.mangaupdates.com/v1/series/${seriesId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    let startDate: Date | null = null;
    if (data.year) {
      const year = parseInt(data.year);
      if (!isNaN(year)) {
        startDate = new Date(year, 0, 1);
      }
    }

    return {
      id: -data.series_id,
      title: data.title,
      bannerImage: null,
      coverImage: data.image?.url?.original || data.image?.url?.thumb || null,
      meanScore: data.bayesian_rating ? Math.round(data.bayesian_rating * 10) : null, // Convert 0-10 to 0-100
      description: data.description || '',
      alternativeTitles: data.associated?.map((a: any) => a.title) || [],
      genres: data.genres?.map((g: any) => g.genre) || [],
      tags: data.categories?.map((c: any) => ({ name: c.category, description: '' })) || [], // Map categories to tags
      startDate,
      lastAvailableChapter: data.latest_chapter || null,
    };
  } catch (error) {
    console.error('MangaUpdates details fetch failed:', error);
    return null;
  }
}
