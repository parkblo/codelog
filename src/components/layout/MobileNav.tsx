"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import Navigation from "./Navigation";
import { usePathname } from "next/navigation";
import SearchInput from "../common/SearchInput";
import Link from "next/link";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  return (
    <div className="md:hidden sticky top-0 z-50 bg-transparent px-4 py-2 flex items-center justify-between">
      <Link href="/home">
        <h1 className="text-xl font-bold px-2">CodeLog</h1>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 top-[53px] z-50 bg-background animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-4">
            <SearchInput />
            <Navigation hideLogo={true} />
          </div>
        </div>
      )}
    </div>
  );
}
