export default defineNuxtRouteMiddleware(async to => {
  const { user, userChecked, fetchCurrentUser } = useAuthUser();

  if (!userChecked.value) {
    await fetchCurrentUser();
  }

  const isAuthPage = ['/login', '/register'].includes(to.path);

  if (isAuthPage && user.value) {
    return navigateTo('/');
  }

  if (!isAuthPage && !user.value) {
    return navigateTo('/login');
  }
});
