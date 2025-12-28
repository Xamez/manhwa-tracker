import { ObjectId } from 'mongodb';

export default defineEventHandler(async event => {
  const user: User = event.context.user;
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Manhwa ID is required',
    });
  }

  const manhwaId = Number(id);

  try {
    const db = useDatabase();
    const userManhwasCollection = db.collection('user_manhwas');
    const manhwasCollection = db.collection('manhwas');

    const userManhwaDoc = await userManhwasCollection.findOne({
      userId: ObjectId.createFromHexString(user.id),
      manhwaId,
    });

    const manhwaDoc = (await manhwasCollection.findOne({ id: manhwaId })) as Manhwa | null;
    let manhwaData: Manhwa | null;

    if (!manhwaDoc) {
      manhwaData = await fetchManhwaDetails(manhwaId);

      if (!manhwaData) {
        throw createError({
          statusCode: 404,
          message: 'Manhwa not found',
        });
      }
    } else {
      manhwaData = manhwaDoc;
    }

    const now = new Date();
    let suggestedUrl: string | null = null;

    if (!userManhwaDoc?.readingUrl) {
      let suggestion = await suggestReadingUrl(user.preferredReadingSource, manhwaData.title);

      if (!suggestion && manhwaData.alternativeTitles?.length > 0) {
        suggestion = await suggestReadingUrl(
          user.preferredReadingSource,
          manhwaData.alternativeTitles[0],
        );
      }

      if (suggestion) {
        suggestedUrl = suggestion.url;
        if (
          suggestion.lastChapter &&
          (!manhwaData.lastAvailableChapter ||
            suggestion.lastChapter > manhwaData.lastAvailableChapter)
        ) {
          manhwaData.lastAvailableChapter = suggestion.lastChapter;
        }
      }
    }

    const response: UserManhwa = {
      id: userManhwaDoc?._id.toString() || '',
      userId: user.id,
      manhwa: {
        id: manhwaData.id,
        title: manhwaData.title,
        bannerImage: manhwaData.bannerImage,
        coverImage: manhwaData.coverImage,
        meanScore: manhwaData.meanScore,
        description: manhwaData.description,
        alternativeTitles: manhwaData.alternativeTitles,
        genres: manhwaData.genres,
        tags: manhwaData.tags,
        startDate: manhwaData.startDate,
        lastAvailableChapter: manhwaData.lastAvailableChapter,
      },
      status: userManhwaDoc?.status || 'reading',
      rating: userManhwaDoc?.rating || null,
      lastReadChapter: userManhwaDoc?.lastReadChapter ?? 1,
      readingUrl: userManhwaDoc?.readingUrl || suggestedUrl,
      isFavorite: userManhwaDoc?.isFavorite || false,
      notes: userManhwaDoc?.notes || null,
      startedAt: userManhwaDoc?.startedAt || now,
      updatedAt: userManhwaDoc?.updatedAt || now,
    };

    return response;
  } catch (error) {
    console.error('Failed to fetch or create user manhwa:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch or create user manhwa',
    });
  }
});
