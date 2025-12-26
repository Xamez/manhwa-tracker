import { ObjectId } from 'mongodb';

const MINUTES_PER_CHAPTER = 4;

export default defineEventHandler(async event => {
  const user: User = event.context.user;

  try {
    const db = useDatabase();
    const userManhwasCollection = db.collection('user_manhwas');

    const userManhwaDocs = await userManhwasCollection
      .find({
        userId: ObjectId.createFromHexString(user.id),
      })
      .toArray();

    const totalManhwa = userManhwaDocs.length;
    const totalChaptersRead = userManhwaDocs.reduce(
      (sum, doc) => sum + (doc.lastReadChapter || 0),
      0,
    );
    const favorites = userManhwaDocs.filter(doc => doc.isFavorite).length;

    const statusCounts = userManhwaDocs.reduce(
      (acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentlyUpdated = userManhwaDocs.filter(
      doc => new Date(doc.updatedAt) >= oneMonthAgo,
    ).length;

    const chaptersReadThisMonth = userManhwaDocs
      .filter(doc => new Date(doc.updatedAt) >= oneMonthAgo)
      .reduce((sum, doc) => sum + Math.max(0, doc.lastReadChapter || 0), 0);

    const totalReadingTimeMinutes = totalChaptersRead * MINUTES_PER_CHAPTER;
    const totalReadingTimeHours = Math.round(totalReadingTimeMinutes / 60);

    return {
      totalManhwa,
      totalChaptersRead,
      favorites,
      statusCounts,
      recentlyUpdated,
      chaptersReadThisMonth,
      totalReadingTimeHours,
    };
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user stats',
    });
  }
});
