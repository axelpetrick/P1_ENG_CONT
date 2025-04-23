import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { createUserTable } from './user';
import { createCourseTable } from './course';
import { createEnrollmentTable } from './enrollment';

let db: Database | null = null;

export async function initSQLiteDB(): Promise<Database> {
  if (db) return db;

  // Open SQLite database
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await createUserTable(db);
  await createCourseTable(db);
  await createEnrollmentTable(db);

  return db;
}

export async function getSQLiteDB(): Promise<Database> {
  if (!db) {
    return initSQLiteDB();
  }
  return db;
}

export async function closeSQLiteDB(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
