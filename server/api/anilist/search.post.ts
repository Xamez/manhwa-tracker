export default defineEventHandler(async event => {
  const { search } = await readBody(event);

  if (!search) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query is required',
    });
  }

  const query = `
    query ($search: String!, $type: MediaType, $sort: [MediaSort], $perPage: Int) {
      Page(perPage: $perPage) {
        media(search: $search, type: $type, sort: $sort)  {
          id
          title {
            english
            romaji
          }
          coverImage {
            medium
          }
        }
      }
    }
  `;

  // 'FAVOURITES_DESC' is used to get the most popular results first
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
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch from AniList API',
      });
    }

    const data = await response.json();

    if (data.errors) {
      throw createError({
        statusCode: 500,
        statusMessage: 'AniList API returned errors',
      });
    }

    const media = data.data.Page.media || [];
    return media
      .map(
        (item: {
          id: number;
          title?: { english?: string; romaji?: string };
          coverImage?: { medium?: string };
        }) =>
          ({
            id: item.id,
            title: item.title?.english || item.title?.romaji || null,
            coverImage: item.coverImage?.medium || null,
          }) as ManhwaSearchResult,
      )
      .filter((item: ManhwaSearchResult) => item.title);
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to search manga',
    });
  }
});
