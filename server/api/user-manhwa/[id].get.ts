import { ObjectId } from 'mongodb';

export default defineEventHandler(async event => {
  const user: AuthUser = event.context.user;
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

    // Fetch user's preferred reading source from database
    const userDoc = await db.collection('users').findOne({
      _id: ObjectId.createFromHexString(user.id),
    });

    if (!userDoc) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      });
    }

    const userManhwaDoc = await userManhwasCollection.findOne({
      userId: ObjectId.createFromHexString(user.id),
      manhwaId,
    });

    const manhwaDoc = (await manhwasCollection.findOne({ id: manhwaId })) as Manhwa | null;
    let manhwaData: Manhwa | null;

    if (!manhwaDoc) {
      manhwaData = await fetchAniListDetails(manhwaId);

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
      suggestedUrl = await suggestReadingUrl(userDoc.preferredReadingSource, manhwaData.title);

      if (!suggestedUrl && manhwaData.alternativeTitles.length > 0) {
        suggestedUrl = await suggestReadingUrl(
          userDoc.preferredReadingSource,
          manhwaData.alternativeTitles[0],
        );
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
