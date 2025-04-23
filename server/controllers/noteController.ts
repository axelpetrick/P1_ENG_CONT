import { Request, Response } from 'express';
import { storage } from '../storage';
import { noteSchema } from '@shared/schema';

// Note CRUD operations
export const getAllNotes = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const notes = await storage.getUserNotes(req.user.id);
    
    // Fetch course details for each note
    const notesWithCourses = await Promise.all(
      notes.map(async (note) => {
        const course = await storage.getCourse(note.courseId);
        return {
          ...note,
          course: course || { title: 'Unknown Course' }
        };
      })
    );

    return res.status(200).json(notesWithCourses);
  } catch (error) {
    console.error('Get all notes error:', error);
    return res.status(500).json({ message: 'Server error while fetching notes' });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const noteId = req.params.id;
    
    const note = await storage.getNote(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the note belongs to the requesting user, or the user is an admin
    if (note.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. You can only access your own notes.' });
    }

    // Get course details
    const course = await storage.getCourse(note.courseId);

    return res.status(200).json({
      ...note,
      course: course || { title: 'Unknown Course' }
    });
  } catch (error) {
    console.error('Get note by ID error:', error);
    return res.status(500).json({ message: 'Server error while fetching note' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Validate request body
    const result = noteSchema.omit({ _id: true, createdAt: true, updatedAt: true }).safeParse({
      ...req.body,
      userId: req.user.id
    });
    
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    // Check if course exists
    const course = await storage.getCourse(result.data.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, result.data.courseId);
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in the course to add notes' });
    }

    const newNote = await storage.createNote(result.data);
    
    return res.status(201).json({
      ...newNote,
      course
    });
  } catch (error) {
    console.error('Create note error:', error);
    return res.status(500).json({ message: 'Server error while creating note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const noteId = req.params.id;
    
    // Check if note exists
    const existingNote = await storage.getNote(noteId);
    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the note belongs to the requesting user
    if (existingNote.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You can only update your own notes.' });
    }

    // Validate request body
    const result = noteSchema.omit({ _id: true, userId: true, createdAt: true, updatedAt: true }).partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    // If courseId is being updated, check if the new course exists and user is enrolled
    if (result.data.courseId && result.data.courseId !== existingNote.courseId) {
      const course = await storage.getCourse(result.data.courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const enrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, result.data.courseId);
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in the course to add notes to it' });
      }
    }

    const updatedNote = await storage.updateNote(noteId, result.data);
    
    // Get course details
    const course = await storage.getCourse(updatedNote!.courseId);

    return res.status(200).json({
      ...updatedNote,
      course: course || { title: 'Unknown Course' }
    });
  } catch (error) {
    console.error('Update note error:', error);
    return res.status(500).json({ message: 'Server error while updating note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const noteId = req.params.id;
    
    // Check if note exists
    const existingNote = await storage.getNote(noteId);
    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the note belongs to the requesting user
    if (existingNote.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. You can only delete your own notes.' });
    }

    const deleted = await storage.deleteNote(noteId);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete note' });
    }

    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    return res.status(500).json({ message: 'Server error while deleting note' });
  }
};

export const getCourseNotes = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
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

    // Check if user is enrolled in the course or is an admin
    if (req.user.role !== 'admin') {
      const enrollment = await storage.getEnrollmentByUserAndCourse(req.user.id, courseId);
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in the course to view its notes' });
      }
    }

    // Get course notes for the user
    const notes = await storage.getUserCourseNotes(req.user.id, courseId);

    return res.status(200).json(notes.map(note => ({
      ...note,
      course
    })));
  } catch (error) {
    console.error('Get course notes error:', error);
    return res.status(500).json({ message: 'Server error while fetching course notes' });
  }
};
