import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagListProps {
  tags: string[];
  className?: string;
  onDelete?: (tag: string) => void;
}

export function TagList({ tags, className, onDelete }: TagListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer transition-colors"
        >
          #{tag}
          {onDelete && (
            <span onClick={() => onDelete(tag)}>
              <X className="w-3 h-3" />
            </span>
          )}
        </Badge>
      ))}
    </div>
  );
}
