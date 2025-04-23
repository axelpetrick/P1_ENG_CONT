import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertCourseSchema, insertEnrollmentSchema } from '@shared/schema';

// Course CRUD operations
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await storage.getAllCourses();
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Get all courses error:', error);
    return res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await storage.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error('Get course by ID error:', error);
    return res.status(500).json({ message: 'Server error while fetching course' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = insertCourseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    const newCourse = await storage.createCourse(result.data);
    return res.status(201).json(newCourse);
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({ message: 'Server error while creating course' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if course exists
    const existingCourse = await storage.getCourse(courseId);
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate request body
    const result = insertCourseSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    const updatedCourse = await storage.updateCourse(courseId, result.data);
    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    return res.status(500).json({ message: 'Server error while updating course' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if course exists
    const existingCourse = await storage.getCourse(courseId);
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const deleted = await storage.deleteCourse(courseId);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete course' });
    }

    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({ message: 'Server error while deleting course' });
  }
};

// Enrollment operations
export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if course exists
    const course = await storage.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, courseId);
    if (existingEnrollment) {
      return res.status(400).json({ message: 'User already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await storage.createEnrollment({
      userId: req.user.id,
      courseId,
      progress: 0,
      completed: false
    });

    return res.status(201).json(enrollment);
  } catch (error) {
    console.error('Enroll in course error:', error);
    return res.status(500).json({ message: 'Server error while enrolling in course' });
  }
};

export const updateEnrollment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Validate request body
    const result = insertEnrollmentSchema.partial().omit({ userId: true, courseId: true }).safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    // Check if enrollment exists
    const existingEnrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, courseId);
    if (!existingEnrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Update enrollment
    const updatedEnrollment = await storage.updateEnrollment(existingEnrollment.id, result.data);
    return res.status(200).json(updatedEnrollment);
  } catch (error) {
    console.error('Update enrollment error:', error);
    return res.status(500).json({ message: 'Server error while updating enrollment' });
  }
};

export const unenrollFromCourse = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if enrollment exists
    const existingEnrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, courseId);
    if (!existingEnrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Delete enrollment
    const deleted = await storage.deleteEnrollment(existingEnrollment.id);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to unenroll from course' });
    }

    return res.status(200).json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenroll from course error:', error);
    return res.status(500).json({ message: 'Server error while unenrolling from course' });
  }
};

export const getUserEnrollments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
    
    // Check if requesting user is authorized to view this user's enrollments
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const enrollments = await storage.getUserEnrollments(userId);
    
    // Fetch course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await storage.getCourse(enrollment.courseId);
        return {
          ...enrollment,
          course
        };
      })
    );

    return res.status(200).json(enrollmentsWithCourses);
  } catch (error) {
    console.error('Get user enrollments error:', error);
    return res.status(500).json({ message: 'Server error while fetching enrollments' });
  }
};
