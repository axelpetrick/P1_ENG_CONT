import { Database } from 'sqlite';
import { type Enrollment, type InsertEnrollment } from '@shared/schema';

export async function createEnrollmentTable(db: Database): Promise<void> {
  await db.exec(`
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
  
  // Check if enrollments table is empty, add sample enrollments if needed
  const enrollmentCount = await db.get('SELECT COUNT(*) as count FROM enrollments');
  
  if (enrollmentCount.count === 0) {
    // Get the student user ID
    const student = await db.get('SELECT id FROM users WHERE role = "student" LIMIT 1');
    
    if (student) {
      const studentId = student.id;
      
      // Get all course IDs
      const courses = await db.all('SELECT id FROM courses');
      
      if (courses && courses.length > 0) {
        // Create enrollments for the student
        await db.run(
          `INSERT INTO enrollments (user_id, course_id, progress, completed) 
           VALUES (?, ?, ?, ?)`,
          studentId,
          courses[0].id,
          45,
          0
        );
        
        if (courses.length > 1) {
          await db.run(
            `INSERT INTO enrollments (user_id, course_id, progress, completed) 
             VALUES (?, ?, ?, ?)`,
            studentId,
            courses[1].id,
            100,
            1
          );
        }
        
        if (courses.length > 2) {
          await db.run(
            `INSERT INTO enrollments (user_id, course_id, progress, completed) 
             VALUES (?, ?, ?, ?)`,
            studentId,
            courses[2].id,
            20,
            0
          );
        }
      }
    }
  }
}

export async function getEnrollmentById(db: Database, id: number): Promise<Enrollment | undefined> {
  const enrollment = await db.get(
    `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
     FROM enrollments WHERE id = ?`,
    id
  );
  
  return enrollment || undefined;
}

export async function getEnrollmentByUserAndCourse(db: Database, userId: number, courseId: number): Promise<Enrollment | undefined> {
  const enrollment = await db.get(
    `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
     FROM enrollments WHERE user_id = ? AND course_id = ?`,
    userId,
    courseId
  );
  
  return enrollment || undefined;
}

export async function createEnrollment(db: Database, enrollment: InsertEnrollment): Promise<Enrollment> {
  const result = await db.run(
    `INSERT INTO enrollments (user_id, course_id, progress, completed) 
     VALUES (?, ?, ?, ?)`,
    enrollment.userId,
    enrollment.courseId,
    enrollment.progress || 0,
    enrollment.completed || 0
  );
  
  const createdEnrollment = await getEnrollmentById(db, result.lastID!);
  return createdEnrollment as Enrollment;
}

export async function updateEnrollment(db: Database, id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined> {
  const existingEnrollment = await getEnrollmentById(db, id);
  if (!existingEnrollment) return undefined;
  
  const fields = [];
  const values = [];
  
  if (enrollment.progress !== undefined) {
    fields.push("progress = ?");
    values.push(enrollment.progress);
  }
  
  if (enrollment.completed !== undefined) {
    fields.push("completed = ?");
    values.push(enrollment.completed ? 1 : 0);
  }
  
  if (fields.length === 0) return existingEnrollment;
  
  await db.run(
    `UPDATE enrollments SET ${fields.join(", ")} WHERE id = ?`,
    ...values,
    id
  );
  
  return getEnrollmentById(db, id);
}

export async function deleteEnrollment(db: Database, id: number): Promise<boolean> {
  const result = await db.run('DELETE FROM enrollments WHERE id = ?', id);
  return result.changes !== 0;
}

export async function getUserEnrollments(db: Database, userId: number): Promise<Enrollment[]> {
  const enrollments = await db.all(
    `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
     FROM enrollments WHERE user_id = ?`,
    userId
  );
  
  return enrollments;
}

export async function getCourseEnrollments(db: Database, courseId: number): Promise<Enrollment[]> {
  const enrollments = await db.all(
    `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
     FROM enrollments WHERE course_id = ?`,
    courseId
  );
  
  return enrollments;
}

export async function getAllEnrollments(db: Database): Promise<Enrollment[]> {
  const enrollments = await db.all(
    `SELECT id, user_id as userId, course_id as courseId, progress, completed, enrolled_at as enrolledAt 
     FROM enrollments`
  );
  
  return enrollments;
}
