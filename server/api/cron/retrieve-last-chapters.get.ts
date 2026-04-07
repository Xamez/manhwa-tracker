import { scrapAndUpdateLastChapter } from '~~/server/utils/scraper';

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const authHeader = getHeader(event, 'authorization');

  if (!config.cronSecret || authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized cron request',
    });
  }

  console.log('Retrieving last chapters...');

  const db = await useDatabase();
  const response = await db
    .collection('user_manhwas')
    .find({ readingUrl: { $ne: null } }, { projection: { manhwaId: 1, readingUrl: 1 } })
    .toArray();

  for (const doc of response) {
    const { manhwaId, readingUrl } = doc;
    const manhwa = await db
      .collection('manhwas')
      .findOne({ id: manhwaId }, { projection: { title: 1 } });
    await scrapAndUpdateLastChapter(db, manhwaId, readingUrl, 0, manhwa?.title);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return { result: 'Success' };
});
