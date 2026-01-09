"use client";

import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    // 1. Sanitize input
    const trimmedQuery = query.trim();

    // Empty query check
    if (!trimmedQuery) return;

    // Length limit (e.g., 100 characters)
    const sanitizedQuery = trimmedQuery.slice(0, 100);

    // 2. Redirect with encoded query
    router.push(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
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
