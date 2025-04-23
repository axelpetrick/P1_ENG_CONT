import { ObjectId } from 'mongodb';
import { getMongoDB } from './index';
import { type Note, type InsertNote } from '@shared/schema';

export async function getNoteById(id: string): Promise<Note | null> {
  try {
    const db = await getMongoDB();
    const note = await db.collection('notes').findOne({
      _id: new ObjectId(id)
    });
    
    if (!note) return null;
    
    return {
      ...note,
      _id: note._id.toString()
    } as Note;
  } catch (error) {
    console.error('Error getting note by ID:', error);
    throw error;
  }
}

export async function createNote(note: InsertNote): Promise<Note> {
  try {
    const db = await getMongoDB();
    const now = new Date();
    
    const noteToInsert = {
      ...note,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection('notes').insertOne(noteToInsert);
    
    return {
      ...noteToInsert,
      _id: result.insertedId.toString()
    } as Note;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

export async function updateNote(id: string, note: Partial<Note>): Promise<Note | null> {
  try {
    const db = await getMongoDB();
    
    const updateData = {
      ...note,
      updatedAt: new Date()
    };
    
    // Cannot update _id field
    delete updateData._id;
    
    const result = await db.collection('notes').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result.value) return null;
    
    return {
      ...result.value,
      _id: result.value._id.toString()
    } as Note;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const db = await getMongoDB();
    
    const result = await db.collection('notes').deleteOne({
      _id: new ObjectId(id)
    });
    
    return result.deletedCount === 1;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

export async function getUserNotes(userId: number): Promise<Note[]> {
  try {
    const db = await getMongoDB();
    
    const notes = await db.collection('notes')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return notes.map((note) => ({
      ...note,
      _id: note._id.toString()
    })) as Note[];
  } catch (error) {
    console.error('Error getting user notes:', error);
    throw error;
  }
}

export async function getCourseNotes(courseId: number): Promise<Note[]> {
  try {
    const db = await getMongoDB();
    
    const notes = await db.collection('notes')
      .find({ courseId })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return notes.map((note) => ({
      ...note,
      _id: note._id.toString()
    })) as Note[];
  } catch (error) {
    console.error('Error getting course notes:', error);
    throw error;
  }
}

export async function getUserCourseNotes(userId: number, courseId: number): Promise<Note[]> {
  try {
    const db = await getMongoDB();
    
    const notes = await db.collection('notes')
      .find({ userId, courseId })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return notes.map((note) => ({
      ...note,
      _id: note._id.toString()
    })) as Note[];
  } catch (error) {
    console.error('Error getting user course notes:', error);
    throw error;
  }
}

export async function seedNotes(): Promise<void> {
  try {
    const db = await getMongoDB();
    
    // Check if notes collection is empty
    const count = await db.collection('notes').countDocuments();
    
    if (count === 0) {
      // Add sample notes for the student user
      // Assuming user ID 2 is the student user from SQLite
      const studentId = 2;
      
      const sampleNotes = [
        {
          userId: studentId,
          courseId: 1,
          title: "JavaScript Promises and Async/Await",
          content: "Notes on handling asynchronous operations in JavaScript using Promises and the async/await syntax. Key differences between callbacks and promises...",
          tags: ["JavaScript", "Async"],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: studentId,
          courseId: 2,
          title: "Pandas DataFrame Operations",
          content: "Essential operations for data manipulation: filtering, grouping, and aggregating data. Examples of .loc, .iloc, and boolean indexing...",
          tags: ["Python", "Pandas"],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await db.collection('notes').insertMany(sampleNotes);
      console.log('Sample notes created');
    }
  } catch (error) {
    console.error('Error seeding notes:', error);
  }
}
