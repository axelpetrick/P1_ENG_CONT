import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AvatarWithText from "@/components/ui/avatar-with-text";
import { useCurrentUser, useLogout, useIsAdmin } from "@/lib/auth";
import {
  Home,
  GraduationCap,
  StickyNote,
  BarChart2,
  Users,
  Edit,
  LogOut
} from "lucide-react";

type SidebarProps = {
  isMobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
};

export default function Sidebar({ isMobileSidebarOpen, closeMobileSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { data: user } = useCurrentUser();
  const isAdmin = useIsAdmin();
  const logout = useLogout();

  // Handle sidebar item click (for mobile)
  const handleSidebarItemClick = () => {
    if (isMobileSidebarOpen) {
      closeMobileSidebar();
    }
  };

  const sidebarItems = [
    {
      name: "Painel Principal",
      path: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Meus Cursos",
      path: "/courses",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      name: "Minhas Anotações",
      path: "/notes",
      icon: <StickyNote className="h-5 w-5" />,
    },
    {
      name: "Relatórios",
      path: "/reports",
      icon: <BarChart2 className="h-5 w-5" />,
    },
  ];

  const adminItems = [
    {
      name: "Gerenciar Usuários",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Gerenciar Cursos",
      path: "/admin/courses",
      icon: <Edit className="h-5 w-5" />,
    },
  ];

  // Handle logout
  const handleLogout = () => {
    logout();
    closeMobileSidebar();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <div className="mr-2 text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.75 10.75V16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.25 10.75V16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.75 9V14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.25 9V14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 13.25V19.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          EduNotas
        </h1>
      </div>

      {user && (
        <div className="border-b p-4">
          <AvatarWithText name={`${user.firstName} ${user.lastName}`} description={user.role} />
        </div>
      )}

      <ScrollArea className="flex-grow pb-16">
        <nav className="py-4">
          <ul className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a
                    onClick={handleSidebarItemClick}
                    className={`flex items-center rounded-md px-4 py-3 text-sm font-medium ${
                      location === item.path
                        ? "bg-indigo-50 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-2 w-5">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}

            {isAdmin && (
              <>
                <li className="mt-6 px-4 py-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Admin</p>
                </li>
                {adminItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <a
                        onClick={handleSidebarItemClick}
                        className={`flex items-center rounded-md px-4 py-3 text-sm font-medium ${
                          location === item.path
                            ? "bg-indigo-50 text-primary"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="mr-2 w-5">{item.icon}</span>
                        <span>{item.name}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start text-gray-700 hover:text-red-500"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  );
}
