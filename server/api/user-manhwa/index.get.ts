import { ObjectId } from 'mongodb';

export default defineEventHandler(async event => {
  const user: AuthUser = event.context.user;

  try {
    const db = useDatabase();
    const userManhwasCollection = db.collection('user_manhwas');
    const manhwasCollection = db.collection('manhwas');

    const userManhwaDocs = await userManhwasCollection
      .find({
        userId: ObjectId.createFromHexString(user.id),
      })
      .toArray();

    const manhwaIds = userManhwaDocs.map(doc => doc.manhwaId);
    const manhwaDocs = await manhwasCollection
      .find({
        id: { $in: manhwaIds },
      })
      .toArray();

    const manhwaMap = new Map(manhwaDocs.map(doc => [doc.id, doc]));

    const response: UserManhwa[] = userManhwaDocs.map(doc => {
      const manhwaDoc = manhwaMap.get(doc.manhwaId);

      if (!manhwaDoc) {
        throw new Error(`Manhwa ${doc.manhwaId} not found`);
      }

      return {
        id: doc._id.toString(),
        userId: doc.userId.toString(),
        manhwa: {
          id: manhwaDoc.id,
          title: manhwaDoc.title,
          bannerImage: manhwaDoc.bannerImage,
          coverImage: manhwaDoc.coverImage,
          meanScore: manhwaDoc.meanScore,
          description: manhwaDoc.description,
          alternativeTitles: manhwaDoc.alternativeTitles,
          genres: manhwaDoc.genres,
          tags: manhwaDoc.tags,
          startDate: manhwaDoc.startDate,
          lastAvailableChapter: manhwaDoc.lastAvailableChapter,
        } as Manhwa,
        status: doc.status,
        rating: doc.rating,
        lastReadChapter: doc.lastReadChapter,
        readingUrl: doc.readingUrl,
        isFavorite: doc.isFavorite,
        startedAt: doc.startedAt,
        updatedAt: doc.updatedAt,
      };
    });

    return response;
  } catch (error) {
    console.error('Failed to fetch user manhwas:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user manhwas',
    });
  }
});
