import type { Manhwa } from '~~/shared/types/manhwa';
import { ManhwaSource, decodeId } from './id-encoding';

export async function fetchManhwaDetails(id: number): Promise<Manhwa | null> {
  const { source, id: originalId } = decodeId(id);

  let manhwa: Manhwa | null = null;

  if (source === ManhwaSource.MangaUpdates) {
    manhwa = await fetchMangaUpdatesDetails(originalId);
  } else {
    manhwa = await fetchAniListDetails(originalId);
  }

  if (manhwa) {
    manhwa.title = getBestTitle(manhwa.title, manhwa.alternativeTitles);
  }

  return manhwa;
}

function getBestTitle(currentTitle: string, alternatives: string[]): string {
  const cjkRegex =
    /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\uac00-\ud7a3]/;

  if (!cjkRegex.test(currentTitle)) {
    return currentTitle;
  }

  const bestAlt = alternatives.find(alt => !cjkRegex.test(alt));
  return bestAlt || currentTitle;
}
