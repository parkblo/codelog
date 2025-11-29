import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagListProps {
  tags: string[];
  className?: string;
}

export function TagList({ tags, className }: TagListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer transition-colors"
        >
          #{tag}
        </Badge>
      ))}
    </div>
  );
}
