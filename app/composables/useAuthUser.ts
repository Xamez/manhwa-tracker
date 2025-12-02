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

  const fetchCurrentUser = async () => {
    if (userChecked.value) {
      if (user.value) {
        startRefreshLoop();
      }
      return user.value;
    }

    const requestFetch = import.meta.server ? useRequestFetch() : $fetch;

    try {
      const response = await requestFetch('/api/user/me');
      user.value = response ? (response as User) : null;
      if (user.value) {
        startRefreshLoop();
      }
    } catch (error) {
      user.value = null;
      console.error('Failed to fetch current user:', error);
    } finally {
      userChecked.value = true;
    }

    return user.value;
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

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
      user.value = null;
      userChecked.value = true;
      stopRefreshLoop();
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
