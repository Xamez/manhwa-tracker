export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const { username, email, password } = await readBody(event);

  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username, email and password are required',
    });
  }

  const db = useDatabase();

  const existingUserByEmail = await db
    .collection('users')
    .findOne({ email }, { collation: { locale: 'en', strength: 2 } });
  if (existingUserByEmail) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User with this email already exists',
    });
  }

  const existingUserByUsername = await db
    .collection('users')
    .findOne({ username }, { collation: { locale: 'en', strength: 2 } });
  if (existingUserByUsername) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User with this username already exists',
    });
  }

  const hashedPassword = await hashPassword(password);

  const result = await db.collection('users').insertOne({
    username,
    email,
    password: hashedPassword,
    preferredReadingSource: 'manhuaus' as ReadingSource,
    createdAt: new Date(),
  });

  const userDb = await db.collection('users').findOne({
    _id: result.insertedId,
  });
  if (!userDb) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create user',
    });
  }

  const authUser: AuthUser = {
    id: userDb._id.toString(),
    email: userDb.email,
    username: userDb.username,
  };
  const accessToken = await createAccessToken(authUser);
  const refreshToken = await createRefreshToken(authUser);

  setCookie(event, 'auth_token', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.public.env === 'production',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });

  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.public.env === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  const user: User = {
    ...authUser,
    preferredReadingSource: userDb.preferredReadingSource,
  };

  return { user };
});
