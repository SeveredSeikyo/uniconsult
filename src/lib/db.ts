import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import path from 'path';

//Ensure the database directory exists in Vercel's writable /tmp directory
const DB_PATH = process.env.VERCEL ? '/tmp/uniconsult.db' : path.join(process.cwd(), 'uniconsult.db');

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) {
    return db;
  }

  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA journal_mode = WAL;'); // Recommended for performance and concurrency
  await db.exec('PRAGMA foreign_keys = ON;'); // Enforce foreign key constraints

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL, -- Store hashed passwords in a real app
      role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'admin')),
      student_id TEXT,
      faculty_id TEXT,
      department TEXT
    );

    CREATE TABLE IF NOT EXISTS faculty_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      faculty_id INTEGER NOT NULL UNIQUE,
      status TEXT NOT NULL CHECK(status IN ('Available', 'In Class', 'Offline')),
      last_updated TEXT NOT NULL,
      FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      faculty_id INTEGER NOT NULL,
      datetime TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Scheduled', 'Cancelled', 'Completed')),
      reason TEXT,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  // Seed initial admin user if no users exist
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count === 0) {
    await db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      "Admin User", "admin@uniconsult.com", "adminpassword", "admin" // In a real app, hash the password
    );
    console.log("Seeded admin user: admin@uniconsult.com / adminpassword");
  }


  return db;
}

// Example of seeding a faculty member and their status (for testing)
export async function seedInitialFaculty() {
  const dbInstance = await getDb();
  const facultyCount = await dbInstance.get('SELECT COUNT(*) as count FROM users WHERE role = "faculty"');
  if (facultyCount && facultyCount.count === 0) {
    const result = await dbInstance.run(
      "INSERT INTO users (name, email, password, role, faculty_id, department) VALUES (?, ?, ?, ?, ?, ?)",
      "Dr. Ada Lovelace", "ada@uniconsult.com", "password123", "faculty", "F001", "Computer Science"
    );
    if (result.lastID) {
      await dbInstance.run(
        "INSERT INTO faculty_status (faculty_id, status, last_updated) VALUES (?, ?, ?)",
        result.lastID, "Available", new Date().toISOString()
      );
      console.log("Seeded faculty: Dr. Ada Lovelace");
    }

     const result2 = await dbInstance.run(
      "INSERT INTO users (name, email, password, role, faculty_id, department) VALUES (?, ?, ?, ?, ?, ?)",
      "Prof. Charles Babbage", "charles@uniconsult.com", "password123", "faculty", "F002", "Mathematics"
    );
    if (result2.lastID) {
      await dbInstance.run(
        "INSERT INTO faculty_status (faculty_id, status, last_updated) VALUES (?, ?, ?)",
        result2.lastID, "In Class", new Date().toISOString()
      );
      console.log("Seeded faculty: Prof. Charles Babbage");
    }
  }
}

// Call seed functions (optional, good for dev)
// seedInitialFaculty().catch(console.error);
