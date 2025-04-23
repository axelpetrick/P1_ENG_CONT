import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth";

type HeaderProps = {
  onToggleSidebar: () => void;
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
      <div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      
      <div className="lg:hidden font-semibold text-primary">EduNotes</div>
      
      <div className="flex items-center">
        {user && (
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-gray-600" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
