import React from "react";

import { LucideIcon } from "lucide-react";

import { BackButton } from "@/shared/ui/back-button";

interface PageHeaderProps {
  title: React.ReactNode;
  icon?: LucideIcon;
  description?: string;
  showBackButton?: boolean;
}

export function PageHeader({
  title,
  icon: Icon,
  description,
  showBackButton = false,
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {showBackButton && (
        <div className="sticky flex gap-2 items-center w-full z-10 py-1">
          <BackButton />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold px-2 flex gap-2 items-center">
          {Icon && <Icon className="w-6 h-6" />}
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground text-left sm:text-right px-2 sm:px-0 sm:truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
