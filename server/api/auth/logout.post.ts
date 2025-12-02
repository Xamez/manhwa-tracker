export default defineEventHandler(async event => {
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });
  deleteCookie(event, 'refresh_token', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });

  return { success: true };
});
