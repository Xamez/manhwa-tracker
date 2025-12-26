import { ObjectId } from 'mongodb';
import { READING_STATUS, type ReadingStatus } from '~~/shared/types/reading-status';

export default defineEventHandler(async event => {
  const user: User = event.context.user;

  try {
    const db = useDatabase();
    const userManhwasCollection = db.collection('user_manhwas');
    const manhwasCollection = db.collection('manhwas');

    const userManhwaDocs = await userManhwasCollection
      .find({
        userId: ObjectId.createFromHexString(user.id),
      })
      .toArray();

    const manhwaIds = userManhwaDocs.map(doc => doc.manhwaId);
    const manhwaDocs = await manhwasCollection
      .find({
        id: { $in: manhwaIds },
      })
      .toArray();

    const manhwaMap = new Map(manhwaDocs.map(doc => [doc.id, doc]));

    const groupedManhwa: Record<string, Array<{ title: string; chapter: number }>> = {};

    for (const doc of userManhwaDocs) {
      const manhwaDoc = manhwaMap.get(doc.manhwaId);
      if (!manhwaDoc) continue;

      const statusLabel = READING_STATUS[doc.status as ReadingStatus];
      if (!groupedManhwa[statusLabel]) {
        groupedManhwa[statusLabel] = [];
      }

      groupedManhwa[statusLabel].push({
        title: manhwaDoc.title,
        chapter: doc.lastReadChapter || 1,
      });
    }

    let exportText = '';

    for (const [status, manhwaList] of Object.entries(groupedManhwa)) {
      if (manhwaList.length === 0) continue;

      exportText += `[${status}]\n`;
      for (const manhwa of manhwaList) {
        exportText += `${manhwa.title}: ${manhwa.chapter}\n`;
      }
      exportText += '\n';
    }

    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
    setHeader(event, 'Content-Disposition', 'attachment; filename="manhwa-export.txt"');

    return exportText.trim();
  } catch (error) {
    console.error('Failed to export manhwa list:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to export manhwa list',
    });
  }
});
