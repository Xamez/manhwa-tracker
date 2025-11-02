export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const { username, password } = await readBody(event);

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required',
    });
  }

  const db = useDatabase();

  const userDb = await db.collection('users').findOne({ username });
  if (!userDb) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password',
    });
  }

  const isPasswordValid = await verifyPassword(password, userDb.password);
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password',
    });
  }

  const authUser: AuthUser = {
    id: userDb._id.toString(),
    email: userDb.email,
    username: userDb.username,
  };
  const token = await createToken(authUser);

  setCookie(event, 'auth_token', token, {
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
