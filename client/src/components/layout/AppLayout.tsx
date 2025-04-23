import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { useCurrentUser } from "@/lib/auth";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { data: user, isLoading } = useCurrentUser();
  const [location, setLocation] = useLocation();

  // Effect to close mobile sidebar when location changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Close mobile sidebar
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // If user data is still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-primary">
            <svg className="mx-auto h-12 w-12 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
          <p className="mt-1 text-sm text-gray-500">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Desktop visible, Mobile hidden by default */}
      <Sidebar 
        isMobileSidebarOpen={isMobileSidebarOpen} 
        closeMobileSidebar={closeMobileSidebar} 
      />

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Top Header */}
        <Header onToggleSidebar={toggleMobileSidebar} />

        {/* Main scrollable area */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
