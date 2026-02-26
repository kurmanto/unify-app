"use client";

import { cn } from "@/lib/utils";

interface ClientAvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ClientAvatar({ firstName, lastName, size = "md", className }: ClientAvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
