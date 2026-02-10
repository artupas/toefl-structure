import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use /tmp for serverless environments (Vercel), otherwise use project directory
const DB_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'toefl.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDb() {
  const database = getDb();
  
  // Create questions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create test_sessions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS test_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      score INTEGER,
      total_questions INTEGER,
      correct_answers INTEGER
    )
  `);

  // Create answers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      question_id INTEGER,
      selected_answer TEXT,
      is_correct BOOLEAN,
      FOREIGN KEY (session_id) REFERENCES test_sessions(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `);

  return database;
}

export interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  category: string | null;
  created_at: string;
}

export interface TestSession {
  id: number;
  user_name: string | null;
  started_at: string;
  ended_at: string | null;
  score: number | null;
  total_questions: number | null;
  correct_answers: number | null;
}

export interface Answer {
  id: number;
  session_id: number;
  question_id: number;
  selected_answer: string;
  is_correct: boolean;
}
