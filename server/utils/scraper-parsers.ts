import * as cheerio from 'cheerio';

export function parseDemonicScans(html: string): number | null {
  const $ = cheerio.load(html);
  const firstLi = $('#chapters-list li').first();
  const link = firstLi.find('a');

  link.find('span').remove();
  const chapterText = link.text().trim();
  const chapterNumber = chapterText.replace('Chapter ', '').trim();

  return parseInt(chapterNumber, 10);
}

export function parseManhuaUS(html: string): number | null {
  const $ = cheerio.load(html);
  const firstLi = $('ul.main.version-chap li.wp-manga-chapter').first();
  const link = firstLi.find('a');

  const chapterText = link.text().trim();
  const chapterNumber = chapterText.replace('Chapter ', '').trim();

  return parseInt(chapterNumber, 10);
}
