import * as cheerio from 'cheerio';
import type { Db } from 'mongodb';
import { READING_SOURCES, type ReadingSource } from '../../shared/types/reading-source';

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
};

const DEMONIC_SCANS_URL = READING_SOURCES.demonicscans.url;
const MANHUA_US_URL = READING_SOURCES.manhuaus.url;

async function scrapLastChapterDemonicScans(
  url: string,
  manhwaTitle?: string,
): Promise<number | null> {
  try {
    const response = await fetch(url, { headers: { ...headers, Referer: DEMONIC_SCANS_URL } });
    const html = await response.text();
    return parseDemonicScans(html);
  } catch (error) {
    const titleMsg = manhwaTitle ? ` for '${manhwaTitle}'` : '';
    console.warn(
      `Failed to scrape last chapter from ${READING_SOURCES.demonicscans.name}${titleMsg}:`,
      error,
    );
    return null;
  }
}

async function scrapLastChapterManhuaUS(url: string, manhwaTitle?: string): Promise<number | null> {
  try {
    const response = await fetch(url, { headers: { ...headers, Referer: MANHUA_US_URL } });
    const html = await response.text();
    return parseManhuaUS(html);
  } catch (error) {
    const titleMsg = manhwaTitle ? ` for '${manhwaTitle}'` : '';
    console.warn(
      `Failed to scrape last chapter from ${READING_SOURCES.manhuaus.name}${titleMsg}:`,
      error,
    );
    return null;
  }
}

async function scrapLastChapterWithFlareSolverr(
  url: string,
  manhwaTitle?: string,
): Promise<number | null> {
  try {
    const html = await fetchWithFlareSolverr(url);
    if (url.includes(MANHUA_US_URL)) {
      return parseManhuaUS(html);
    } else if (url.includes(DEMONIC_SCANS_URL)) {
      return parseDemonicScans(html);
    }
    return null;
  } catch (error) {
    const titleMsg = manhwaTitle ? ` for '${manhwaTitle}'` : '';
    console.warn(`Failed to scrape with FlareSolverr${titleMsg}:`, error);
    return null;
  }
}

export async function scrapLastChapter(url: string, manhwaTitle?: string): Promise<number | null> {
  if (url.includes(MANHUA_US_URL)) {
    return scrapLastChapterManhuaUS(url, manhwaTitle);
  } else if (url.includes(DEMONIC_SCANS_URL)) {
    return scrapLastChapterDemonicScans(url, manhwaTitle);
  }
  return null;
}

export async function suggestReadingUrlDemonicScans(manhwaTitle: string): Promise<string | null> {
  try {
    const searchUrl = `${DEMONIC_SCANS_URL}/search.php?manga=${manhwaTitle}`;
    const response = await fetch(searchUrl, {
      headers: { ...headers, Referer: DEMONIC_SCANS_URL },
    });
    const html = await response.text();

    if (html.includes('Just a moment...')) {
      console.warn(
        `Access forbidden when suggesting reading URL for '${manhwaTitle}' from ${READING_SOURCES.demonicscans.name}`,
      );
      return null;
    }

    const $ = cheerio.load(html);
    const firstResult = $('a[href^="/manga/"]').first();
    const href = firstResult.attr('href');

    if (href) {
      return `${DEMONIC_SCANS_URL}${href}`;
    }

    console.warn(
      `No reading URL found for '${manhwaTitle}' on ${READING_SOURCES.demonicscans.name}`,
    );

    return null;
  } catch (error) {
    console.warn(
      `Unable to suggest a reading URL for '${manhwaTitle}' from ${READING_SOURCES.demonicscans.name}:`,
      error,
    );
    return null;
  }
}

export async function suggestReadingUrlManhuaUS(manhwaTitle: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('action', 'wp-manga-search-manga');
    formData.append('title', manhwaTitle);

    const response = await fetch(`${MANHUA_US_URL}/wp-admin/admin-ajax.php`, {
      method: 'POST',
      headers: {
        'User-Agent': headers['User-Agent'],
        Referer: MANHUA_US_URL,
        Origin: MANHUA_US_URL,
      },
      body: formData,
    });

    if (response.status === 403) {
      console.warn(
        `Access forbidden when suggesting reading URL for '${manhwaTitle}' from ${READING_SOURCES.manhuaus.name}`,
      );
      return null;
    }

    const json = await response.json();

    if (json.success && json.data && json.data.length > 0) {
      return json.data[0].url;
    }

    return null;
  } catch (error) {
    console.warn(
      `Failed to suggest reading URL for '${manhwaTitle}' from ${READING_SOURCES.manhuaus.name}:`,
      error,
    );
    return null;
  }
}

export async function suggestReadingUrl(
  readingSource: ReadingSource,
  manhwaTitle: string,
): Promise<string | null> {
  const sourceMap: Record<ReadingSource, (title: string) => Promise<string | null>> = {
    manhuaus: suggestReadingUrlManhuaUS,
    demonicscans: suggestReadingUrlDemonicScans,
  };
  const sources = [
    sourceMap[readingSource],
    ...Object.entries(sourceMap)
      .filter(([key]) => key !== readingSource)
      .map(([, func]) => func),
  ];

  for (const getUrl of sources) {
    const url = await getUrl(manhwaTitle);
    if (url) return url;
  }

  return null;
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
): Promise<void> {
  console.log(`Processing manhwaId: ${manhwaId} from URL: ${readingUrl}`);
  const lastChapter = await scrapLastChapter(readingUrl, manhwaTitle);

  if (lastChapter && lastChapter > lastAvailableChapter) {
    await updateManhwaChapter(db, manhwaId, lastChapter);
  } else if (!lastChapter) {
    console.log(`Fast scrape failed for ${readingUrl}, trying FlareSolverr in background...`);
    scrapLastChapterWithFlareSolverr(readingUrl, manhwaTitle)
      .then(async chapter => {
        if (chapter && chapter > lastAvailableChapter) {
          await updateManhwaChapter(db, manhwaId, chapter);
        } else {
          console.log(
            `Background FlareSolverr finished for manhwaId ${manhwaId}. Found chapter: ${chapter}. Last available: ${lastAvailableChapter}. No update needed.`,
          );
        }
      })
      .catch(err => {
        const titleMsg = manhwaTitle ? ` for '${manhwaTitle}'` : '';
        console.warn(`Background FlareSolverr failed${titleMsg}:`, err);
      });
  } else {
    console.log(
      `No update needed for manhwaId ${manhwaId} (lastChapter: ${lastChapter}, found: ${lastAvailableChapter}).`,
    );
  }
}
