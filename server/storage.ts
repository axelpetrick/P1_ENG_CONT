import { 
  users, courses, enrollments, 
  type User, type InsertUser, 
  type Course, type InsertCourse, 
  type Enrollment, type InsertEnrollment,
  type Note, type InsertNote,
  type DashboardStats
} from "@shared/schema";
import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

// Storage interface for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  getAllCourses(): Promise<Course[]>;

  // Enrollment operations
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined>;
  deleteEnrollment(id: number): Promise<boolean>;
  getUserEnrollments(userId: number): Promise<Enrollment[]>;
  getCourseEnrollments(courseId: number): Promise<Enrollment[]>;

  // Note operations
  getNote(id: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;
  getUserNotes(userId: number): Promise<Note[]>;
  getCourseNotes(courseId: number): Promise<Note[]>;
  getUserCourseNotes(userId: number, courseId: number): Promise<Note[]>;

  // Dashboard stats
  getUserDashboardStats(userId: number): Promise<DashboardStats>;
  
  // Initialize databases
  initialize(): Promise<void>;
  close(): Promise<void>;
}

// Memory storage implementation for development/testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;
  private notes: Map<string, Note>;
  
  private userCurrentId: number;
  private courseCurrentId: number;
  private enrollmentCurrentId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.notes = new Map();

    this.userCurrentId = 1;
    this.courseCurrentId = 1;
    this.enrollmentCurrentId = 1;
  }

  async initialize(): Promise<void> {
    // Add some initial data
    const adminUser: InsertUser = {
      username: "admin",
      password: await bcrypt.hash("admin123", 10),
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    };

    const studentUser: InsertUser = {
      username: "student",
      password: await bcrypt.hash("student123", 10),
      email: "student@example.com",
      firstName: "Student",
      lastName: "User",
      role: "student"
    };

    await this.createUser(adminUser);
    await this.createUser(studentUser);

    // Create some courses
    const courses = [
      {
        title: "Full Stack Web Development",
        description: "Learn modern web development with React and Node.js",
        instructor: "Prof. Ricardo",
        duration: 12,
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
      },
      {
        title: "Data Science Fundamentals",
        description: "Master Python, statistics, and machine learning",
        instructor: "Prof. Carla",
        duration: 10,
        imageUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d"
      },
      {
        title: "Mobile App Development",
        description: "Build cross-platform mobile apps with React Native",
        instructor: "Prof. Felipe",
        duration: 8,
        imageUrl: "https://images.unsplash.com/photo-1617839615617-ad7dac7f2c29"
      }
    ];

    for (const course of courses) {
      await this.createCourse(course);
    }

    // Create enrollments
    await this.createEnrollment({
      userId: 2,
      courseId: 1,
      progress: 45,
      completed: false
    });

    await this.createEnrollment({
      userId: 2,
      courseId: 2,
      progress: 100,
      completed: true
    });

    await this.createEnrollment({
      userId: 2,
      courseId: 3,
      progress: 20,
      completed: false
    });

    // Create notes
    await this.createNote({
      userId: 2,
      courseId: 1,
      title: "JavaScript Promises and Async/Await",
      content: "Notes on handling asynchronous operations in JavaScript using Promises and the async/await syntax. Key differences between callbacks and promises...",
      tags: ["JavaScript", "Async"]
    });

    await this.createNote({
      userId: 2,
      courseId: 2,
      title: "Pandas DataFrame Operations",
      content: "Essential operations for data manipulation: filtering, grouping, and aggregating data. Examples of .loc, .iloc, and boolean indexing...",
      tags: ["Python", "Pandas"]
    });
  }

  async close(): Promise<void> {
    // Nothing to close in memory storage
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseCurrentId++;
    const course: Course = { 
      ...insertCourse, 
      id, 
      createdAt: new Date() 
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) return undefined;

    const updatedCourse = { ...existingCourse, ...course };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  // Enrollment operations
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }

  async getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      (enrollment) => enrollment.userId === userId && enrollment.courseId === courseId,
    );
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentCurrentId++;
    const enrollment: Enrollment = { 
      ...insertEnrollment, 
      id, 
      enrolledAt: new Date() 
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const existingEnrollment = this.enrollments.get(id);
    if (!existingEnrollment) return undefined;

    const updatedEnrollment = { ...existingEnrollment, ...enrollment };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  async deleteEnrollment(id: number): Promise<boolean> {
    return this.enrollments.delete(id);
  }

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.userId === userId,
    );
  }

  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.courseId === courseId,
    );
  }

  // Note operations
  async getNote(id: string): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = new ObjectId().toString();
    const note: Note = { 
      ...insertNote, 
      _id: id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: string, note: Partial<Note>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    if (!existingNote) return undefined;

    const updatedNote = { 
      ...existingNote, 
      ...note, 
      updatedAt: new Date() 
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  async getUserNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId,
    );
  }

  async getCourseNotes(courseId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.courseId === courseId,
    );
  }

  async getUserCourseNotes(userId: number, courseId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId && note.courseId === courseId,
    );
  }

  // Dashboard stats
  async getUserDashboardStats(userId: number): Promise<DashboardStats> {
    const userEnrollments = await this.getUserEnrollments(userId);
    const userNotes = await this.getUserNotes(userId);

    const enrolledCourses = userEnrollments.length;
    const completedCourses = userEnrollments.filter(e => e.completed).length;
    const totalNotes = userNotes.length;
    
    // Calculate approximate hours studied based on course durations, progress and a factor
    let hoursStudied = 0;
    for (const enrollment of userEnrollments) {
      const course = await this.getCourse(enrollment.courseId);
      if (course) {
        // Assuming 3 hours of study per week of course duration
        hoursStudied += (course.duration * 3) * (enrollment.progress / 100);
      }
    }
    
    return {
      enrolledCourses,
      totalNotes,
      completedCourses,
      hoursStudied: Math.round(hoursStudied)
    };
  }
}

// Production storage implementation using SQLite and MongoDB
export class ProdStorage implements IStorage {
  private sqliteDb: Database | null = null;
  private mongoClient: MongoClient | null = null;
  private mongoDB: any = null;

  constructor() {}

  async initialize(): Promise<void> {
    // Initialize SQLite
    this.sqliteDb = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        instructor TEXT NOT NULL,
        duration INTEGER NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        completed BOOLEAN NOT NULL DEFAULT 0,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (course_id) REFERENCES courses (id)
      );
    `);

    // Initialize MongoDB (using in-memory for simplicity)
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/edunotes";
    this.mongoClient = new MongoClient(mongoUri);
    await this.mongoClient.connect();
    this.mongoDB = this.mongoClient.db();

    // Check if collections exist, if not create them
    const collections = await this.mongoDB.listCollections().toArray();
    if (!collections.find((c: any) => c.name === 'notes')) {
      await this.mongoDB.createCollection('notes');
    }
  }

  async close(): Promise<void> {
    if (this.sqliteDb) await this.sqliteDb.close();
    if (this.mongoClient) await this.mongoClient.close();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const user = await this.sqliteDb.get(
      `SELECT id, username, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt 
       FROM users WHERE id = ?`,
      id
    );
    
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const user = await this.sqliteDb.get(
      `SELECT id, username, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt 
       FROM users WHERE username = ?`,
      username
    );
    
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const user = await this.sqliteDb.get(
      `SELECT id, username, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt 
       FROM users WHERE email = ?`,
      email
    );
    
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const result = await this.sqliteDb.run(
      `INSERT INTO users (username, password, email, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      insertUser.username,
      insertUser.password,
      insertUser.email,
      insertUser.firstName,
      insertUser.lastName,
      insertUser.role
    );
    
    return this.getUser(result.lastID!) as Promise<User>;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const fields = [];
    const values = [];
    
    if (user.username) {
      fields.push("username = ?");
      values.push(user.username);
    }
    
    if (user.password) {
      fields.push("password = ?");
      values.push(user.password);
    }
    
    if (user.email) {
      fields.push("email = ?");
      values.push(user.email);
    }
    
    if (user.firstName) {
      fields.push("first_name = ?");
      values.push(user.firstName);
    }
    
    if (user.lastName) {
      fields.push("last_name = ?");
      values.push(user.lastName);
    }
    
    if (user.role) {
      fields.push("role = ?");
      values.push(user.role);
    }
    
    if (fields.length === 0) return existingUser;
    
    await this.sqliteDb.run(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      ...values,
      id
    );
    
    return this.getUser(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const result = await this.sqliteDb.run(
      `DELETE FROM users WHERE id = ?`,
      id
    );
    
    return result.changes !== 0;
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const users = await this.sqliteDb.all(
      `SELECT id, username, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt 
       FROM users`
    );
    
    return users;
  }

  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const course = await this.sqliteDb.get(
      `SELECT id, title, description, instructor, duration, image_url as imageUrl, created_at as createdAt 
       FROM courses WHERE id = ?`,
      id
    );
    
    return course || undefined;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const result = await this.sqliteDb.run(
      `INSERT INTO courses (title, description, instructor, duration, image_url) 
       VALUES (?, ?, ?, ?, ?)`,
      insertCourse.title,
      insertCourse.description,
      insertCourse.instructor,
      insertCourse.duration,
      insertCourse.imageUrl
    );
    
    return this.getCourse(result.lastID!) as Promise<Course>;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const existingCourse = await this.getCourse(id);
    if (!existingCourse) return undefined;
    
    const fields = [];
    const values = [];
    
    if (course.title) {
      fields.push("title = ?");
      values.push(course.title);
    }
    
    if (course.description) {
      fields.push("description = ?");
      values.push(course.description);
    }
    
    if (course.instructor) {
      fields.push("instructor = ?");
      values.push(course.instructor);
    }
    
    if (course.duration !== undefined) {
      fields.push("duration = ?");
      values.push(course.duration);
    }
    
    if (course.imageUrl) {
      fields.push("image_url = ?");
      values.push(course.imageUrl);
    }
    
    if (fields.length === 0) return existingCourse;
    
    await this.sqliteDb.run(
      `UPDATE courses SET ${fields.join(", ")} WHERE id = ?`,
      ...values,
      id
    );
    
    return this.getCourse(id);
  }

  async deleteCourse(id: number): Promise<boolean> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const result = await this.sqliteDb.run(
      `DELETE FROM courses WHERE id = ?`,
      id
    );
    
    return result.changes !== 0;
  }

  async getAllCourses(): Promise<Course[]> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const courses = await this.sqliteDb.all(
      `SELECT id, title, description, instructor, duration, image_url as imageUrl, created_at as createdAt 
       FROM courses`
    );
    
    return courses;
  }

  // Enrollment operations
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const enrollment = await this.sqliteDb.get(
      `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
       FROM enrollments WHERE id = ?`,
      id
    );
    
    return enrollment || undefined;
  }

  async getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const enrollment = await this.sqliteDb.get(
      `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
       FROM enrollments WHERE user_id = ? AND course_id = ?`,
      userId,
      courseId
    );
    
    return enrollment || undefined;
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const result = await this.sqliteDb.run(
      `INSERT INTO enrollments (user_id, course_id, progress, completed) 
       VALUES (?, ?, ?, ?)`,
      insertEnrollment.userId,
      insertEnrollment.courseId,
      insertEnrollment.progress || 0,
      insertEnrollment.completed || false
    );
    
    return this.getEnrollment(result.lastID!) as Promise<Enrollment>;
  }

  async updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const existingEnrollment = await this.getEnrollment(id);
    if (!existingEnrollment) return undefined;
    
    const fields = [];
    const values = [];
    
    if (enrollment.progress !== undefined) {
      fields.push("progress = ?");
      values.push(enrollment.progress);
    }
    
    if (enrollment.completed !== undefined) {
      fields.push("completed = ?");
      values.push(enrollment.completed);
    }
    
    if (fields.length === 0) return existingEnrollment;
    
    await this.sqliteDb.run(
      `UPDATE enrollments SET ${fields.join(", ")} WHERE id = ?`,
      ...values,
      id
    );
    
    return this.getEnrollment(id);
  }

  async deleteEnrollment(id: number): Promise<boolean> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const result = await this.sqliteDb.run(
      `DELETE FROM enrollments WHERE id = ?`,
      id
    );
    
    return result.changes !== 0;
  }

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const enrollments = await this.sqliteDb.all(
      `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
       FROM enrollments WHERE user_id = ?`,
      userId
    );
    
    return enrollments;
  }

  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    if (!this.sqliteDb) throw new Error("Database not initialized");
    
    const enrollments = await this.sqliteDb.all(
      `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
       FROM enrollments WHERE course_id = ?`,
      courseId
    );
    
    return enrollments;
  }

  // Note operations
  async getNote(id: string): Promise<Note | undefined> {
    if (!this.mongoDB) throw new Error("MongoDB not initialized");
    
    const note = await this.mongoDB.collection('notes').findOne({
      _id: new ObjectId(id)
    });
    
    return note ? {
      ...note,
      _id: note._id.toString()
    } : undefined;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    if (!this.mongoDB) throw new Error("MongoDB not initialized");
    
    const now = new Date();
    const noteToInsert = {
      ...insertNote,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await this.mongoDB.collection('notes').insertOne(noteToInsert);
    
    return {
      ...noteToInsert,
      _id: result.insertedId.toString()
    };
  }

  async updateNote(id: string, note: Partial<Note>): Promise<Note | undefined> {
    if (!this.mongoDB) throw new Error("MongoDB not initialized");
    
    const updateData = {
      ...note,
      updatedAt: new Date()
    };
    
    delete updateData._id; // Cannot update _id
    
    const result = await this.mongoDB.collection('notes').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result.value ? {
      ...result.value,
      _id: result.value._id.toString()
    } : undefined;
  }

  async deleteNote(id: string): Promise<boolean> {
    if (!this.mongoDB) throw new Error("MongoDB not initialized");
    
    const result = await this.mongoDB.collection('notes').deleteOne({
      _id: new ObjectId(id)
    });
    
    return result.deletedCount === 1;
  }

  async getUserNotes(userId: number): Promise<Note[]> {
    if (!this.mongoDB) throw new Error("MongoDB not initialized");
    
    const notes = await this.mongoDB.collection('notes')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return notes.map((note: any) => ({
      ...note,
      _id: note._id.toString()
    }));
  }

  async getCourseNotes(courseId: number): Promise<Note[]> {
    if (!this.mongoDB) throw new Error("MongoDB not initialized");
    
    const notes = await this.mongoDB.collection('notes')
      .find({ courseId })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return notes.map((note: any) => ({
      ...note,
      _id: note._id.toString()
    }));
  }

  async getUserCourseNotes(userId: number, courseId: number): Promise<Note[]> {
    if (!this.mongoDB) throw new Error("MongoDB not initialized");
    
    const notes = await this.mongoDB.collection('notes')
      .find({ userId, courseId })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return notes.map((note: any) => ({
      ...note,
      _id: note._id.toString()
    }));
  }

  // Dashboard stats
  async getUserDashboardStats(userId: number): Promise<DashboardStats> {
    if (!this.sqliteDb || !this.mongoDB) throw new Error("Databases not initialized");
    
    // Get user enrollments
    const userEnrollments = await this.getUserEnrollments(userId);
    
    // Count notes
    const notesCount = await this.mongoDB.collection('notes').countDocuments({ userId });
    
    // Count enrolled and completed courses
    const enrolledCourses = userEnrollments.length;
    const completedCourses = userEnrollments.filter(e => e.completed).length;
    
    // Calculate approximate hours studied
    let hoursStudied = 0;
    for (const enrollment of userEnrollments) {
      const course = await this.getCourse(enrollment.courseId);
      if (course) {
        hoursStudied += (course.duration * 3) * (enrollment.progress / 100);
      }
    }
    
    return {
      enrolledCourses,
      totalNotes: notesCount,
      completedCourses,
      hoursStudied: Math.round(hoursStudied)
    };
  }
}

// Use MemStorage for development, ProdStorage for production
export const storage = new MemStorage();
//export const storage = new ProdStorage();
