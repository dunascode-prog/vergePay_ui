import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { avatarColorFor } from "@/lib/avatar-color";
import { cn } from "@/lib/utils";

interface PayeeAvatarProps {
  name: string;
  initials: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function PayeeAvatar({ name, initials, size = "md" }: PayeeAvatarProps) {
  const color = avatarColorFor(name);
  return (
    <Avatar className={SIZE_CLASSES[size]}>
      <AvatarFallback className={cn("font-medium", color.bg, color.text)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
