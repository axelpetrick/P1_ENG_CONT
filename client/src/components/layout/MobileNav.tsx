import { Link, useLocation } from "wouter";
import { Home, GraduationCap, StickyNote, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="text-lg" />,
    },
    {
      name: "Courses",
      path: "/courses",
      icon: <GraduationCap className="text-lg" />,
    },
    {
      name: "Notes",
      path: "/notes",
      icon: <StickyNote className="text-lg" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="text-lg" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-gray-200 bg-white lg:hidden">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a
            className={`flex flex-col items-center justify-center ${
              location === item.path ? "text-primary" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="mt-1 text-xs">{item.name}</span>
          </a>
        </Link>
      ))}
    </div>
  );
}
