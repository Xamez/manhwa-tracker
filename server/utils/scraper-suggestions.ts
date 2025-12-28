import * as cheerio from 'cheerio';
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
const MANGAKAKALOT_URL = READING_SOURCES.mangakakalot.url;

export interface SuggestionResult {
  url: string;
  lastChapter?: number;
}

export async function suggestReadingUrlDemonicScans(
  manhwaTitle: string,
): Promise<SuggestionResult | null> {
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
      return { url: `${DEMONIC_SCANS_URL}${href}` };
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

export async function suggestReadingUrlManhuaUS(
  manhwaTitle: string,
): Promise<SuggestionResult | null> {
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
      return { url: json.data[0].url };
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

export async function suggestReadingUrlMangakakalot(
  manhwaTitle: string,
): Promise<SuggestionResult | null> {
  try {
    const formattedTitle = manhwaTitle
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const searchUrl = `${MANGAKAKALOT_URL}/home/search/json?searchword=${formattedTitle}`;
    const response = await fetch(searchUrl, {
      headers: { ...headers, Referer: MANGAKAKALOT_URL },
    });

    const text = await response.text();
    let json: any;

    try {
      json = JSON.parse(text);

      if (json && Array.isArray(json)) {
        const firstResult = json[0];
        const result: SuggestionResult = { url: firstResult.url };

        if (firstResult.chapterLatest) {
          // Extract number from "Chapter X"
          const match = firstResult.chapterLatest.match(/Chapter\s+(\d+)/i);
          if (match) {
            result.lastChapter = parseInt(match[1], 10);
          }
        }
        return result;
      }
    } catch {
      const $ = cheerio.load(text);
      const firstItem = $('.panel_story_list .story_item').first();

      if (firstItem.length > 0) {
        const url = firstItem.find('.story_name a').attr('href');
        return url ? { url } : null;
      }
      return null;
    }

    return null;
  } catch (error) {
    console.warn(
      `Failed to suggest reading URL for '${manhwaTitle}' from ${READING_SOURCES.mangakakalot.name}:`,
      error,
    );
    return null;
  }
}

export const SUGGESTION_STRATEGIES: Record<
  ReadingSource,
  (title: string) => Promise<SuggestionResult | null>
> = {
  manhuaus: suggestReadingUrlManhuaUS,
  demonicscans: suggestReadingUrlDemonicScans,
  mangakakalot: suggestReadingUrlMangakakalot,
};

export async function suggestReadingUrl(
  readingSource: ReadingSource,
  manhwaTitle: string,
): Promise<SuggestionResult | null> {
  const preferredStrategy = SUGGESTION_STRATEGIES[readingSource];
  const preferredResult = await preferredStrategy(manhwaTitle);
  if (preferredResult) return preferredResult;

  const otherSources = (Object.keys(SUGGESTION_STRATEGIES) as ReadingSource[]).filter(
    key => key !== readingSource,
  );

  for (const sourceKey of otherSources) {
    const result = await SUGGESTION_STRATEGIES[sourceKey](manhwaTitle);
    if (result) return result;
  }

  return null;
}
