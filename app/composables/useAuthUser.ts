export function useAuthUser() {
  const user = useState<User | null>('auth:user', () => null);
  const userChecked = useState<boolean>('auth:userChecked', () => false);

  const fetchCurrentUser = async () => {
    if (userChecked.value) {
      return user.value;
    }

    const requestFetch = import.meta.server ? useRequestFetch() : $fetch;

    try {
      const response = await requestFetch('/api/user/me');
      user.value = response ? (response as User) : null;
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
  };

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
      user.value = null;
      userChecked.value = true;
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
