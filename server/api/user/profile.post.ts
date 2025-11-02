import { ObjectId } from 'mongodb';
import { READING_SOURCES } from '~~/shared/types/reading-source';

export default defineEventHandler(async event => {
  const user: AuthUser = event.context.user;

  const { preferredReadingSource } = await readBody(event);

  if (preferredReadingSource && !Object.keys(READING_SOURCES).includes(preferredReadingSource)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid reading source',
    });
  }

  const db = useDatabase();

  await db
    .collection('users')
    .updateOne(
      { _id: ObjectId.createFromHexString(user.id) },
      { $set: { preferredReadingSource } },
    );

  const updatedUser = await db
    .collection('users')
    .findOne({ _id: ObjectId.createFromHexString(user.id) });

  if (!updatedUser) {
    throw createError({
      statusCode: 500,
      statusMessage: 'User not found',
    });
  }

  return {
    id: updatedUser._id.toString(),
    username: updatedUser.username,
    email: updatedUser.email,
    preferredReadingSource: updatedUser.preferredReadingSource,
  };
});
