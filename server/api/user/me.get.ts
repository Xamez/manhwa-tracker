import { ObjectId } from 'mongodb';

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token');
  if (!token) {
    return null;
  }

  const authUser = await verifyAccessToken(token);

  if (!authUser) {
    return null;
  }

  const db = useDatabase();
  const userDb = await db.collection('users').findOne({ _id: new ObjectId(authUser.id) });

  if (!userDb) {
    return null;
  }

  const user: User = {
    id: userDb._id.toString(),
    email: userDb.email,
    username: userDb.username,
    preferredReadingSource: userDb.preferredReadingSource,
  };

  return user;
});
