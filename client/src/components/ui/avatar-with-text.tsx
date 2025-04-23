import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AvatarWithTextProps {
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function AvatarWithText({ name, description, imageUrl }: AvatarWithTextProps) {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex items-center">
      <Avatar className="h-10 w-10">
        {imageUrl && <img src={imageUrl} alt={name} />}
        <AvatarFallback className="bg-primary text-white">{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="ml-3">
        <p className="text-sm font-medium">{name}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );
}
