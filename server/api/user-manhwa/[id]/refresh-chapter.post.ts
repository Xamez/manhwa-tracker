import { ObjectId } from 'mongodb';

export default defineEventHandler(async event => {
  const user = event.context.user;
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User Manhwa ID is required',
    });
  }

  try {
    const db = useDatabase();
    const userManhwasCollection = db.collection('user_manhwas');
    const manhwasCollection = db.collection('manhwas');

    const userManhwaDoc = await userManhwasCollection.findOne({
      _id: new ObjectId(id),
      userId: ObjectId.createFromHexString(user.id),
    });

    if (!userManhwaDoc) {
      throw createError({
        statusCode: 404,
        message: 'User Manhwa not found',
      });
    }

    if (!userManhwaDoc.readingUrl) {
      throw createError({
        statusCode: 400,
        message: 'No reading URL configured for this manhwa',
      });
    }

    const manhwaDoc = await manhwasCollection.findOne({
      id: userManhwaDoc.manhwaId,
    });

    if (!manhwaDoc) {
      throw createError({
        statusCode: 404,
        message: 'Manhwa not found',
      });
    }

    await scrapAndUpdateLastChapter(
      db,
      userManhwaDoc.manhwaId,
      userManhwaDoc.readingUrl,
      manhwaDoc.lastAvailableChapter || 0,
      manhwaDoc.title,
    );

    const updatedManhwaDoc = await manhwasCollection.findOne({
      id: userManhwaDoc.manhwaId,
    });

    return {
      lastAvailableChapter: updatedManhwaDoc?.lastAvailableChapter,
    };
  } catch (error) {
    console.error('Failed to refresh chapter:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to refresh chapter',
    });
  }
});
