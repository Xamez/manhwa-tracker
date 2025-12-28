export type ReadingSource = 'manhuaus' | 'demonicscans' | 'mangakakalot';

export const READING_SOURCES: Record<ReadingSource, { name: string; url: string }> = {
  manhuaus: {
    name: 'ManhuaUS',
    url: 'https://manhuaus.com',
  },
  demonicscans: {
    name: 'Demonic Scans',
    url: 'https://demonicscans.org',
  },
  mangakakalot: {
    name: 'Mangakakalot',
    url: 'https://www.mangakakalot.gg',
  },
};
