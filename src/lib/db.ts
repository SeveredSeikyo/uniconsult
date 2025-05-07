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
  
  // Seed initial data if no users exist
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count === 0) {
    // Seed Admin
    await db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      "Admin User", "admin@uniconsult.com", "adminpassword", "admin" // In a real app, hash the password
    );
    console.log("Seeded admin user: admin@uniconsult.com / adminpassword");

    // Seed Faculty
    const faculty1Result = await db.run(
      "INSERT INTO users (name, email, password, role, faculty_id, department) VALUES (?, ?, ?, ?, ?, ?)",
      "Dr. Ada Lovelace", "faculty@example.com", "password", "faculty", "F001", "Computer Science"
    );
    if (faculty1Result.lastID) {
      await db.run(
        "INSERT INTO faculty_status (faculty_id, status, last_updated) VALUES (?, ?, ?)",
        faculty1Result.lastID, "Available", new Date().toISOString()
      );
    }
    console.log("Seeded faculty: Dr. Ada Lovelace (faculty@example.com / password)");

    const faculty2Result = await db.run(
      "INSERT INTO users (name, email, password, role, faculty_id, department) VALUES (?, ?, ?, ?, ?, ?)",
      "Prof. Charles Babbage", "faculty2@example.com", "password", "faculty", "F002", "Mathematics"
    );
    if (faculty2Result.lastID) {
      await db.run(
        "INSERT INTO faculty_status (faculty_id, status, last_updated) VALUES (?, ?, ?)",
        faculty2Result.lastID, "In Class", new Date().toISOString()
      );
    }
    console.log("Seeded faculty: Prof. Charles Babbage (faculty2@example.com / password)");

    // Seed Students
    const student1Result = await db.run(
      "INSERT INTO users (name, email, password, role, student_id) VALUES (?, ?, ?, ?, ?)",
      "Alice Wonderland", "student@example.com", "password", "student", "S001"
    );
    console.log("Seeded student: Alice Wonderland (student@example.com / password)");

    const student2Result = await db.run(
      "INSERT INTO users (name, email, password, role, student_id) VALUES (?, ?, ?, ?, ?)",
      "Bob The Builder", "student2@example.com", "password", "student", "S002"
    );
    console.log("Seeded student: Bob The Builder (student2@example.com / password)");

    // Seed Consultations
    const faculty1Id = faculty1Result.lastID;
    const faculty2Id = faculty2Result.lastID;
    const student1Id = student1Result.lastID;
    const student2Id = student2Result.lastID;

    if (student1Id && faculty1Id && faculty2Id && student2Id) {
        // Consultation 1: Alice + Ada, Scheduled, tomorrow 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        await db.run(
          "INSERT INTO consultations (student_id, faculty_id, datetime, status) VALUES (?, ?, ?, ?)",
          student1Id, faculty1Id, tomorrow.toISOString(), "Scheduled"
        );

        // Consultation 2: Alice + Charles, Completed, yesterday 02:00 PM
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(14, 0, 0, 0);
        await db.run(
          "INSERT INTO consultations (student_id, faculty_id, datetime, status) VALUES (?, ?, ?, ?)",
          student1Id, faculty2Id, yesterday.toISOString(), "Completed"
        );

        // Consultation 3: Bob + Ada, Cancelled, day after tomorrow 09:00 AM
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        dayAfterTomorrow.setHours(9, 0, 0, 0);
        await db.run(
          "INSERT INTO consultations (student_id, faculty_id, datetime, status, reason) VALUES (?, ?, ?, ?, ?)",
          student2Id, faculty1Id, dayAfterTomorrow.toISOString(), "Cancelled", "Student request: schedule conflict"
        );
        console.log("Seeded initial consultations.");
    }
  }
  return db;
}
