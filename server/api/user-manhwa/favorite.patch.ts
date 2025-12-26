import { ObjectId } from 'mongodb';

export default defineEventHandler(async event => {
  const user: User = event.context.user;
  const body = await readBody(event);
  const { manhwaId, isFavorite } = body;

  if (!manhwaId) {
    throw createError({
      statusCode: 400,
      message: 'Manhwa ID is required',
    });
  }

  if (typeof isFavorite !== 'boolean') {
    throw createError({
      statusCode: 400,
      message: 'isFavorite must be a boolean',
    });
  }

  try {
    const db = useDatabase();
    const userManhwasCollection = db.collection('user_manhwas');

    const result = await userManhwasCollection.updateOne(
      {
        userId: ObjectId.createFromHexString(user.id),
        manhwaId: Number(manhwaId),
      },
      {
        $set: {
          isFavorite,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        message: 'User manhwa not found',
      });
    }

    return {
      success: true,
      isFavorite,
    };
  } catch (error) {
    console.error('Failed to update favorite status:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to update favorite status',
    });
  }
});
