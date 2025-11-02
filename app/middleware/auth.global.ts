export default defineNuxtRouteMiddleware(async to => {
  const { user, userChecked, fetchCurrentUser } = useAuthUser();

  if (!userChecked.value) {
    await fetchCurrentUser();
  }

  if (to.path === '/login' || to.path === '/register') {
    if (user.value) {
      return navigateTo('/');
    }
    return;
  }

  if (!user.value) {
    return navigateTo('/login');
  }
});
