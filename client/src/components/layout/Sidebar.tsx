import React from 'react';
import { Link, useLocation } from 'wouter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/lib/auth';
import {
  Home,
  GraduationCap,
  StickyNote,
  BarChart2,
  Users,
  Edit,
  LogOut
} from "lucide-react";
import AvatarWithText from "@/components/ui/avatar-with-text";

export default function Sidebar({ 
  isMobileSidebarOpen, 
  closeMobileSidebar 
}: { 
  isMobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
}) {
  const [location] = useLocation();
  const { data: user } = useCurrentUser();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { href: '/', label: 'Painel Principal', icon: <Home className="h-5 w-5" /> },
    { href: '/courses', label: 'Meus Cursos', icon: <GraduationCap className="h-5 w-5" /> },
    { href: '/notes', label: 'Minhas Anotações', icon: <StickyNote className="h-5 w-5" /> },
    { href: '/reports', label: 'Relatórios', icon: <BarChart2 className="h-5 w-5" /> },
    ...(isAdmin ? [
      { href: '/admin/users', label: 'Gerenciar Usuários', icon: <Users className="h-5 w-5" /> },
      { href: '/admin/courses', label: 'Gerenciar Cursos', icon: <Edit className="h-5 w-5" /> }
    ] : [])
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
      isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-16 items-center justify-center border-b">
        <h1 className="text-xl font-bold text-primary">EduNotas</h1>
      </div>

      {user && (
        <div className="border-b p-4">
          <AvatarWithText name={`${user.firstName} ${user.lastName}`} description={user.role} />
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-10rem)]"> {/* Adjusted height to accommodate user section */}
        <div className="p-4">
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span
                      className={cn(
                        "flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100",
                        location === item.href ? "bg-gray-100 text-primary" : "text-gray-600"
                      )}
                      onClick={() => closeMobileSidebar()}
                    >
                      {item.icon} {/* Added icon display */}
                      <span className="ml-2">{item.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </ScrollArea>
      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <button
          className="flex w-full items-center justify-start text-gray-700 hover:text-red-500"
          onClick={() => {
            // Assuming logout function is available in context
            // Replace with actual logout logic
            console.log("Logout clicked"); 
            closeMobileSidebar();
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}