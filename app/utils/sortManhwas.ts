import { READING_STATUS_ORDER } from '~~/shared/types/reading-status';
import type { SortOption, SortOrder } from '~~/shared/types/sort';
import type { UserManhwa } from '~~/shared/types/user-manhwa';

export function sortManhwas(
  manhwas: UserManhwa[],
  sortBy: SortOption,
  sortOrder: SortOrder,
): UserManhwa[] {
  return [...manhwas].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'startedAt':
        comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
        break;
      case 'rating':
        comparison = (a.rating ?? 0) - (b.rating ?? 0);
        break;
      case 'title':
        comparison = a.manhwa.title.localeCompare(b.manhwa.title);
        break;
      case 'meanScore':
        comparison = (a.manhwa.meanScore ?? 0) - (b.manhwa.meanScore ?? 0);
        break;
      case 'status':
        comparison = READING_STATUS_ORDER[a.status] - READING_STATUS_ORDER[b.status];
        break;
      case 'unreadChapters': {
        const lastAvailableChapterA = a.manhwa.lastAvailableChapter ?? 0;
        const lastAvailableChapterB = b.manhwa.lastAvailableChapter ?? 0;
        comparison =
          lastAvailableChapterA - a.lastReadChapter - (lastAvailableChapterB - b.lastReadChapter);
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}
