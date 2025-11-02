export default defineEventHandler(async event => {
  const path = event.path || '';

  if (path.startsWith('/api/auth/')) {
    return;
  }

  if (!path.startsWith('/api/')) {
    return;
  }

  const token = getCookie(event, 'auth_token');

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const user = await verifyToken(token);
  if (!user) {
    deleteCookie(event, 'auth_token');
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  event.context.user = user;
});
