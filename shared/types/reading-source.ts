export type ReadingSource = 'manhuaus' | 'demonicscans';

export const READING_SOURCES: Record<ReadingSource, { name: string; url: string }> = {
  manhuaus: {
    name: 'ManhuaUS',
    url: 'https://manhuaus.com',
  },
  demonicscans: {
    name: 'Demonic Scans',
    url: 'https://demonicscans.org',
  },
};
