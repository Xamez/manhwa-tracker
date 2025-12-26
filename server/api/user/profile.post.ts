import { ObjectId } from 'mongodb';
import { READING_SOURCES } from '~~/shared/types/reading-source';

export default defineEventHandler(async event => {
  const user: User = event.context.user;

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

  return {
    ...user,
    preferredReadingSource,
  };
});
