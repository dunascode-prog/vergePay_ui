import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { avatarColorFor } from "@/lib/avatar-color";
import { initials } from "@/lib/payroll";
import { cn } from "@/lib/utils";

interface PayeeAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function PayeeAvatar({ name, size = "md" }: PayeeAvatarProps) {
  const color = avatarColorFor(name);
  return (
    <Avatar className={cn("shrink-0", SIZE_CLASSES[size])}>
      <AvatarFallback className={cn("font-medium dark:brightness-90", color.bg, color.text)}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
