import type { Manhwa } from '~~/shared/types/manhwa';

// NOTE: Later add a prefix for each source to avoid ID conflicts
export async function fetchManhwaDetails(id: number): Promise<Manhwa | null> {
  if (id < 0) {
    return await fetchMangaUpdatesDetails(id);
  } else {
    return await fetchAniListDetails(id);
  }
}
