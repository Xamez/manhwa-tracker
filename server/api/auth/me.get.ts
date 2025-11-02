export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token');

  if (!token) {
    return null;
  }

  const user = await verifyToken(token);

  if (!user) {
    deleteCookie(event, 'auth_token');
    return null;
  }

  return user;
});
