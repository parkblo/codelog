"use client";

import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { sanitizeSearchQuery } from "@/shared/lib/utils/search";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const sanitizedQuery = sanitizeSearchQuery(query);

    if (!sanitizedQuery) return;

    router.push(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500"
        aria-hidden="true"
      />
      <Input
        placeholder="검색 ..."
        className="pl-10 h-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
