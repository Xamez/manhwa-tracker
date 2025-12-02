export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const refreshToken = getCookie(event, 'refresh_token');

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token is required',
    });
  }

  const user = await verifyRefreshToken(refreshToken);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid refresh token',
    });
  }

  const accessToken = await createAccessToken(user);

  setCookie(event, 'auth_token', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.public.env === 'production',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });

  return { message: 'Token refreshed' };
});
