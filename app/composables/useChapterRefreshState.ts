export const useChapterRefreshState = () => {
  const refreshingManhwaIds = useState<string[]>('refreshingManhwaIds', () => []);

  function isRefreshing(manhwaId: string): boolean {
    return refreshingManhwaIds.value.includes(manhwaId);
  }

  function setRefreshing(manhwaId: string, isRefreshing: boolean) {
    if (isRefreshing) {
      if (!refreshingManhwaIds.value.includes(manhwaId)) {
        refreshingManhwaIds.value.push(manhwaId);
      }
    } else {
      refreshingManhwaIds.value = refreshingManhwaIds.value.filter(id => id !== manhwaId);
    }
  }

  return {
    isRefreshing,
    setRefreshing,
  };
};
