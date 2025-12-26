export const SOURCE_OFFSET = 1_000_000_000_000;

export enum ManhwaSource {
  AniList = 0,
  MangaUpdates = 1,
}

export function encodeId(source: ManhwaSource, id: number): number {
  return source * SOURCE_OFFSET + id;
}

export function decodeId(encodedId: number): { source: ManhwaSource; id: number } {
  const source = Math.floor(encodedId / SOURCE_OFFSET);
  const id = encodedId % SOURCE_OFFSET;
  return { source, id };
}
