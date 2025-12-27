import * as cheerio from 'cheerio';
import type { Db } from 'mongodb';
import { READING_SOURCES, type ReadingSource } from '../../shared/types/reading-source';
import { h } from 'vue';

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
};

const DEMONIC_SCANS_URL = READING_SOURCES.demonicscans.url;
const MANHUA_US_URL = READING_SOURCES.manhuaus.url;

async function scrapLastChapterDemonicScans(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { headers: { ...headers, Referer: DEMONIC_SCANS_URL } });
    const html = await response.text();

    const $ = cheerio.load(html);
    console.log($.html());

    const firstLi = $('#chapters-list li').first();
    const link = firstLi.find('a');

    link.find('span').remove();
    const chapterText = link.text().trim();
    const chapterNumber = chapterText.replace('Chapter ', '').trim();

    return parseInt(chapterNumber, 10);
  } catch (error) {
    console.error(`Error scraping last chapter from ${READING_SOURCES.demonicscans.name}:`, error);
    return null;
  }
}

async function scrapLastChapterManhuaUS(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { headers: { ...headers, Referer: MANHUA_US_URL } });
    const html = await response.text();

    const $ = cheerio.load(html);

    const firstLi = $('ul.main.version-chap li.wp-manga-chapter').first();
    const link = firstLi.find('a');

    const chapterText = link.text().trim();
    const chapterNumber = chapterText.replace('Chapter ', '').trim();

    return parseInt(chapterNumber, 10);
  } catch (error) {
    console.error(`Error scraping last chapter from ${READING_SOURCES.manhuaus.name}:`, error);
    return null;
  }
}

export async function scrapLastChapter(url: string): Promise<number | null> {
  if (url.includes(MANHUA_US_URL)) {
    return scrapLastChapterManhuaUS(url);
  } else if (url.includes(DEMONIC_SCANS_URL)) {
    return scrapLastChapterDemonicScans(url);
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
      console.error(
        `Access forbidden when suggesting reading URL from ${READING_SOURCES.demonicscans.name}`,
      );
      return null;
    }

    const $ = cheerio.load(html);
    const firstResult = $('a[href^="/manga/"]').first();
    const href = firstResult.attr('href');

    if (href) {
      return `${DEMONIC_SCANS_URL}${href}`;
    }

    return null;
  } catch (error) {
    console.error(`Error suggesting reading URL from ${READING_SOURCES.demonicscans.name}:`, error);
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
      console.error(
        `Access forbidden when suggesting reading URL from ${READING_SOURCES.manhuaus.name}`,
      );
      return null;
    }

    const json = await response.json();

    if (json.success && json.data && json.data.length > 0) {
      return json.data[0].url;
    }

    return null;
  } catch (error) {
    console.error(`Error suggesting reading URL from ${READING_SOURCES.manhuaus.name}:`, error);
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
    ...Object.values(sourceMap).filter(fn => fn !== sourceMap[readingSource]),
  ];

  for (const getUrl of sources) {
    const url = await getUrl(manhwaTitle);
    if (url) return url;
  }

  return null;
}

export async function scrapAndUpdateLastChapter(
  db: Db,
  manhwaId: number,
  readingUrl: string,
  lastAvailableChapter: number,
): Promise<void> {
  console.log(`Processing manhwaId: ${manhwaId} from URL: ${readingUrl}`);
  const lastChapter = await scrapLastChapter(readingUrl);
  if (lastChapter && lastChapter > lastAvailableChapter) {
    await db
      .collection('manhwas')
      .updateOne({ id: manhwaId }, { $set: { lastAvailableChapter: lastChapter } });
    console.log(`Updated manhwaId ${manhwaId} to chapter ${lastChapter}`);
  } else {
    console.log(
      `No update needed for manhwaId ${manhwaId} (lastChapter: ${lastChapter}, found: ${lastAvailableChapter}).`,
    );
  }
}
