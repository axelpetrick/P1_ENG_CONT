import { Request, Response } from 'express';
import { storage } from '../storage';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const stats = await storage.getUserDashboardStats(userId);

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if the requesting user is allowed to view these stats
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. You can only view your own stats.' });
    }

    const stats = await storage.getUserDashboardStats(userId);

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({ message: 'Server error while fetching user stats' });
  }
};

export const getCourseStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Only admins can view course stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if course exists
    const course = await storage.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get enrollments
    const enrollments = await storage.getCourseEnrollments(courseId);
    
    // Get notes
    const notes = await storage.getCourseNotes(courseId);

    // Calculate stats
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.completed).length;
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    const averageProgress = totalEnrollments > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments 
      : 0;
    const totalNotes = notes.length;
    const notesPerUser = totalEnrollments > 0 ? totalNotes / totalEnrollments : 0;

    return res.status(200).json({
      course,
      stats: {
        totalEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate),
        averageProgress: Math.round(averageProgress),
        totalNotes,
        notesPerUser: parseFloat(notesPerUser.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    return res.status(500).json({ message: 'Server error while fetching course stats' });
  }
};

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Only admins can view admin dashboard
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    // Get all users, courses, enrollments, and notes
    const users = await storage.getAllUsers();
    const courses = await storage.getAllCourses();
    
    // Calculate stats
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const totalCourses = courses.length;
    
    // Get enrollments and calculate total
    let totalEnrollments = 0;
    let completedEnrollments = 0;
    
    for (const course of courses) {
      const enrollments = await storage.getCourseEnrollments(course.id);
      totalEnrollments += enrollments.length;
      completedEnrollments += enrollments.filter(e => e.completed).length;
    }
    
    // Calculate average notes per user
    let totalNotes = 0;
    for (const user of users) {
      if (user.role === 'student') {
        const notes = await storage.getUserNotes(user.id);
        totalNotes += notes.length;
      }
    }
    
    const notesPerStudent = totalStudents > 0 ? totalNotes / totalStudents : 0;
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    return res.status(200).json({
      totalStudents,
      totalAdmins,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      completionRate: Math.round(completionRate),
      totalNotes,
      notesPerStudent: parseFloat(notesPerStudent.toFixed(2))
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    return res.status(500).json({ message: 'Server error while fetching admin dashboard stats' });
  }
};
