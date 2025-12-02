import type { Db } from 'mongodb';

let db: Db | null = null;

export function setDatabase(database: Db) {
  db = database;
}

export function useDatabase() {
  if (!db) {
    throw new Error('Internal Server Error');
  }
  return db;
}
