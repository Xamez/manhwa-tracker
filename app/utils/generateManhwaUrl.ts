export default (homeUrl: string, currentChapter: number): string => {
  const cleanBaseUrl = homeUrl.replace(/\/$/, '');

  try {
    const url = new URL(cleanBaseUrl);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('demonicscans.org')) {
      const titleUrl = cleanBaseUrl.replace('/manga/', '/title/');
      return `${titleUrl}/chapter/${currentChapter}/1`;
    } else if (hostname.includes('manhuaus.com')) {
      return `${cleanBaseUrl}/chapter-${currentChapter}`;
    } else if (hostname.includes('manganato') || hostname.includes('mangakakalot')) {
      return `${cleanBaseUrl}/chapter-${currentChapter}`;
    }
  } catch (error) {
    console.error(`Invalid URL provided: ${cleanBaseUrl}`, error);
  }

  return homeUrl;
};
