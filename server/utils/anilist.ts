import type { Manhwa } from '~~/shared/types/manhwa';

export async function fetchAniListDetails(id: number): Promise<Manhwa | null> {
  const graphqlQuery = `
    query($id: Int)  {
      Media(id: $id)  {
        id
        title {
          english
          romaji
        }
        bannerImage
        description
        coverImage {
          large
        }
        synonyms
        genres
        meanScore
        tags {
          name
          description
        }
        startDate {
          year
          month
          day
        }
      }
    }
  `;

  const variables = {
    id,
  };

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      return null;
    }

    const media = data.data.Media;

    let startDate: Date | null = null;
    if (media.startDate?.year) {
      const year = media.startDate.year;
      const month = media.startDate.month || 1;
      const day = media.startDate.day || 1;
      startDate = new Date(year, month - 1, day);
    }

    return {
      id: media.id,
      title: media.title?.english || media.synonyms?.[0] || media.title?.romaji || 'Unknown Title',
      bannerImage: media.bannerImage,
      coverImage: media.coverImage?.large,
      meanScore: media.meanScore,
      description: media.description || '',
      alternativeTitles: media.synonyms || [],
      genres: media.genres || [],
      tags: media.tags || [],
      startDate,
      lastAvailableChapter: null,
    };
  } catch {
    return null;
  }
}
