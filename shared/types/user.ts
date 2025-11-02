import type { ReadingSource } from './reading-source';
import type { AuthUser } from './authUser';

export type User = AuthUser & {
  preferredReadingSource: ReadingSource;
};
