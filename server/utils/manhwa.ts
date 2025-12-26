import type { Manhwa } from '~~/shared/types/manhwa';
import { ManhwaSource, decodeId } from './id-encoding';

export async function fetchManhwaDetails(id: number): Promise<Manhwa | null> {
  const { source, id: originalId } = decodeId(id);

  if (source === ManhwaSource.MangaUpdates) {
    return await fetchMangaUpdatesDetails(originalId);
  } else {
    return await fetchAniListDetails(originalId);
  }
}
