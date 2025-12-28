import type { Db } from 'mongodb';
import { READING_SOURCES, type ReadingSource } from '../../shared/types/reading-source';
import { parseDemonicScans, parseManhuaUS, parseMangakakalot } from './scraper-parsers';

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
};

const PARSERS: Record<ReadingSource, (html: string) => number | null> = {
  manhuaus: parseManhuaUS,
  demonicscans: parseDemonicScans,
  mangakakalot: parseMangakakalot,
};

// --- Generic Functions ---

async function scrapLastChapterFromSource(
  url: string,
  sourceKey: ReadingSource,
  manhwaTitle?: string,
): Promise<number | null> {
  const sourceConfig = READING_SOURCES[sourceKey];
  const parser = PARSERS[sourceKey];
  try {
    const response = await fetch(url, { headers: { ...headers, Referer: sourceConfig.url } });
    const html = await response.text();
    return parser(html);
  } catch (error) {
    const titleMsg = manhwaTitle ? ` for '${manhwaTitle}'` : '';
    console.warn(`Failed to scrape last chapter from ${sourceConfig.name}${titleMsg}:`, error);
    return null;
  }
}

export async function scrapLastChapter(url: string, manhwaTitle?: string): Promise<number | null> {
  for (const [key, config] of Object.entries(READING_SOURCES)) {
    if (url.includes(config.url)) {
      return scrapLastChapterFromSource(url, key as ReadingSource, manhwaTitle);
    }
  }
  return null;
}

async function scrapLastChapterWithFlareSolverr(
  url: string,
  manhwaTitle?: string,
): Promise<number | null> {
  try {
    const html = await fetchWithFlareSolverr(url);
    for (const [key, config] of Object.entries(READING_SOURCES)) {
      if (url.includes(config.url)) {
        return PARSERS[key as ReadingSource](html);
      }
    }
    return null;
  } catch (error) {
    const titleMsg = manhwaTitle ? ` for '${manhwaTitle}'` : '';
    console.warn(`Failed to scrape with FlareSolverr${titleMsg}:`, error);
    return null;
  }
}

async function updateManhwaChapter(db: Db, manhwaId: number, chapter: number) {
  await db
    .collection('manhwas')
    .updateOne({ id: manhwaId }, { $set: { lastAvailableChapter: chapter } });
  console.log(`Updated manhwaId ${manhwaId} to chapter ${chapter}`);
}

export async function scrapAndUpdateLastChapter(
  db: Db,
  manhwaId: number,
  readingUrl: string,
  lastAvailableChapter: number,
  manhwaTitle?: string,
  runInBackground: boolean = false,
): Promise<void> {
  if (readingUrl.endsWith('/')) {
    readingUrl = readingUrl.slice(0, -1);
  }
  console.log(`Processing manhwaId: ${manhwaId} from URL: ${readingUrl}`);
  const lastChapter = await scrapLastChapter(readingUrl, manhwaTitle);

  if (lastChapter && lastChapter > lastAvailableChapter) {
    await updateManhwaChapter(db, manhwaId, lastChapter);
  } else if (!lastChapter) {
    console.log(`Fast scrape failed for ${readingUrl}, trying FlareSolverr...`);

    const flareSolverrTask = async () => {
      try {
        const chapter = await scrapLastChapterWithFlareSolverr(readingUrl, manhwaTitle);
        if (chapter && chapter > lastAvailableChapter) {
          await updateManhwaChapter(db, manhwaId, chapter);
        } else {
          console.log(
            `FlareSolverr finished for manhwaId ${manhwaId}. Found chapter: ${chapter}. Last available: ${lastAvailableChapter}. No update needed.`,
          );
        }
      } catch (err) {
        const titleMsg = manhwaTitle ? ` for '${manhwaTitle}'` : '';
        console.warn(`FlareSolverr failed${titleMsg}:`, err);
      }
    };

    if (runInBackground) {
      flareSolverrTask();
    } else {
      await flareSolverrTask();
    }
  } else {
    console.log(
      `No update needed for manhwaId ${manhwaId} (lastChapter: ${lastChapter}, found: ${lastAvailableChapter}).`,
    );
  }
}
