import { Database } from 'sqlite';
import { type Course, type InsertCourse } from '@shared/schema';

export async function createCourseTable(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      instructor TEXT NOT NULL,
      duration INTEGER NOT NULL,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Check if courses table is empty, add sample courses if needed
  const courseCount = await db.get('SELECT COUNT(*) as count FROM courses');
  
  if (courseCount.count === 0) {
    const sampleCourses = [
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
    
    for (const course of sampleCourses) {
      await db.run(
        `INSERT INTO courses (title, description, instructor, duration, image_url) 
         VALUES (?, ?, ?, ?, ?)`,
        course.title,
        course.description,
        course.instructor,
        course.duration,
        course.imageUrl
      );
    }
  }
}

export async function getCourseById(db: Database, id: number): Promise<Course | undefined> {
  const course = await db.get(
    `SELECT id, title, description, instructor, duration, image_url as imageUrl, created_at as createdAt 
     FROM courses WHERE id = ?`,
    id
  );
  
  return course || undefined;
}

export async function createCourse(db: Database, course: InsertCourse): Promise<Course> {
  const result = await db.run(
    `INSERT INTO courses (title, description, instructor, duration, image_url) 
     VALUES (?, ?, ?, ?, ?)`,
    course.title,
    course.description,
    course.instructor,
    course.duration,
    course.imageUrl
  );
  
  const createdCourse = await getCourseById(db, result.lastID!);
  return createdCourse as Course;
}

export async function updateCourse(db: Database, id: number, course: Partial<Course>): Promise<Course | undefined> {
  const existingCourse = await getCourseById(db, id);
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
  
  if (course.imageUrl !== undefined) {
    fields.push("image_url = ?");
    values.push(course.imageUrl);
  }
  
  if (fields.length === 0) return existingCourse;
  
  await db.run(
    `UPDATE courses SET ${fields.join(", ")} WHERE id = ?`,
    ...values,
    id
  );
  
  return getCourseById(db, id);
}

export async function deleteCourse(db: Database, id: number): Promise<boolean> {
  const result = await db.run('DELETE FROM courses WHERE id = ?', id);
  return result.changes !== 0;
}

export async function getAllCourses(db: Database): Promise<Course[]> {
  const courses = await db.all(
    `SELECT id, title, description, instructor, duration, image_url as imageUrl, created_at as createdAt 
     FROM courses`
  );
  
  return courses;
}
