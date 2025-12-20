export function useAuthUser() {
  const user = useState<User | null>('auth:user', () => null);
  const userChecked = useState<boolean>('auth:userChecked', () => false);
  const refreshTimer = useState<any>('auth:refreshTimer', () => null);

  const refreshToken = async () => {
    try {
      await $fetch('/api/auth/refresh', { method: 'POST' });
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  const startRefreshLoop = () => {
    if (import.meta.server) return;
    if (refreshTimer.value) return;

    refreshTimer.value = setInterval(
      async () => {
        if (user.value) {
          await refreshToken();
        }
      },
      5 * 60 * 1000,
    );
  };

  const stopRefreshLoop = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value);
      refreshTimer.value = null;
    }
  };

  const setCurrentUser = (authUser: User | null) => {
    user.value = authUser;
    userChecked.value = true;
    if (user.value) {
      startRefreshLoop();
    } else {
      stopRefreshLoop();
    }
  };

  const fetchCurrentUser = async () => {
    if (userChecked.value) {
      if (user.value) startRefreshLoop();
      return user.value;
    }

    const requestFetch = import.meta.server ? useRequestFetch() : $fetch;
    let response: User | null = null;

    try {
      response = await requestFetch<User>('/api/user/me');

      if (!response) {
        await requestFetch('/api/auth/refresh', { method: 'POST' });
        response = await requestFetch<User>('/api/user/me');
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }

    setCurrentUser(response);

    return user.value;
  };

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      await navigateTo('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return {
    user,
    userChecked,
    fetchCurrentUser,
    setCurrentUser,
    logout,
  };
}
