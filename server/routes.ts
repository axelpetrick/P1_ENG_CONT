import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, isAdmin, isOwnerOrAdmin } from "./middleware/auth";
import * as authController from "./controllers/authController";
import * as courseController from "./controllers/courseController";
import * as noteController from "./controllers/noteController";
import * as reportController from "./controllers/reportController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage
  await storage.initialize();

  // API routes (prefix with /api)
  const apiRouter = express.Router();

  // Auth routes
  apiRouter.post("/auth/register", authController.register);
  apiRouter.post("/auth/login", authController.login);
  apiRouter.get("/auth/me", authenticateToken, authController.getCurrentUser);

  // Course routes
  apiRouter.get("/courses", authenticateToken, courseController.getAllCourses);
  apiRouter.get("/courses/:id", authenticateToken, courseController.getCourseById);
  apiRouter.post("/courses", authenticateToken, isAdmin, courseController.createCourse);
  apiRouter.put("/courses/:id", authenticateToken, isAdmin, courseController.updateCourse);
  apiRouter.delete("/courses/:id", authenticateToken, isAdmin, courseController.deleteCourse);

  // Enrollment routes
  apiRouter.post("/courses/:id/enroll", authenticateToken, courseController.enrollInCourse);
  apiRouter.put("/courses/:id/enrollment", authenticateToken, courseController.updateEnrollment);
  apiRouter.delete("/courses/:id/enroll", authenticateToken, courseController.unenrollFromCourse);
  apiRouter.get("/enrollments", authenticateToken, courseController.getUserEnrollments);
  apiRouter.get("/users/:userId/enrollments", authenticateToken, isOwnerOrAdmin, courseController.getUserEnrollments);

  // Note routes
  apiRouter.get("/notes", authenticateToken, noteController.getAllNotes);
  apiRouter.get("/notes/:id", authenticateToken, noteController.getNoteById);
  apiRouter.post("/notes", authenticateToken, noteController.createNote);
  apiRouter.put("/notes/:id", authenticateToken, noteController.updateNote);
  apiRouter.delete("/notes/:id", authenticateToken, noteController.deleteNote);
  apiRouter.get("/courses/:courseId/notes", authenticateToken, noteController.getCourseNotes);

  // Report routes
  apiRouter.get("/dashboard/stats", authenticateToken, reportController.getDashboardStats);
  apiRouter.get("/users/:userId/stats", authenticateToken, isOwnerOrAdmin, reportController.getUserStats);
  apiRouter.get("/courses/:courseId/stats", authenticateToken, isAdmin, reportController.getCourseStats);
  apiRouter.get("/admin/stats", authenticateToken, isAdmin, reportController.getAdminDashboardStats);

  // Register API routes
  app.use("/api", apiRouter);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
