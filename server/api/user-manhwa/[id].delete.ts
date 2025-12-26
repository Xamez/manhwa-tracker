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

    const userManhwaDoc = await userManhwasCollection.findOne({
      userId: ObjectId.createFromHexString(user.id),
      manhwaId,
    });

    if (!userManhwaDoc) {
      throw createError({
        statusCode: 404,
        message: 'User manhwa not found',
      });
    }

    await userManhwasCollection.deleteOne({
      _id: userManhwaDoc._id,
    });
    return { message: 'User manhwa deleted successfully' };
  } catch (error) {
    console.error('Failed to fetch or delete user manhwa:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch or delete user manhwa',
    });
  }
});
