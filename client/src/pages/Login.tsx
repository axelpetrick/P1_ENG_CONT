import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AuthModal from "@/components/auth/AuthModal";
import { useCurrentUser, isAuthenticated } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  // Handle modal close
  const handleClose = () => {
    // Should not happen in this context, but just in case
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
          <svg className="mr-2 text-primary" width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.75 10.75V16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.25 10.75V16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.75 9V14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.25 9V14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 13.25V19.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          EduNotes
        </h1>
        <p className="text-gray-600">Course Management & Student Notes System</p>
      </div>

      <div className="w-full max-w-md px-4">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to EduNotes</h2>
          <p className="text-gray-600 mb-4">
            A complete solution for managing your courses and organizing your study notes.
          </p>
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Dual database integration</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Course management with SQLite</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Rich notes with MongoDB</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Insightful analytics and reports</span>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EduNotes. All rights reserved.
        </p>
      </div>

      <AuthModal isOpen={isModalOpen} onClose={handleClose} defaultMode="login" />
    </div>
  );
}
