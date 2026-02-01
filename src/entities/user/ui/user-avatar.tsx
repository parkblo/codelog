import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
} as const;

interface UserAvatarProps {
  user: {
    avatar?: string | null;
    nickname: string;
  };
  size?: keyof typeof sizeClasses;
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({
  user,
  size = "md",
  className,
  onClick,
}: UserAvatarProps) {
  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        "border border-border",
        onClick && "hover:cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <AvatarImage src={user.avatar || ""} alt={user.nickname} />
      <AvatarFallback>
        {user.nickname?.charAt(0)?.toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  );
}
