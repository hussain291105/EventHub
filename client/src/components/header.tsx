import { Link, useLocation } from "wouter";
import { Search, Calendar, Ticket, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";

export function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 transition-colors" data-testid="link-home">
              <Ticket className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold font-[family-name:var(--font-sans)]">EventHub</span>
            </a>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <a className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 ${location === "/" ? "bg-secondary text-secondary-foreground" : "text-foreground"}`} data-testid="link-events">
                Events
              </a>
            </Link>
            <Link href="/organizer">
              <a className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 ${location === "/organizer" ? "bg-secondary text-secondary-foreground" : "text-foreground"}`} data-testid="link-organizer">
                Become an Organizer
              </a>
            </Link>
          </nav>
        </div>

        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Link href="/my-tickets">
            <a>
              <Button variant="ghost" size="icon" data-testid="button-my-tickets">
                <Calendar className="h-5 w-5" />
                <span className="sr-only">My Tickets</span>
              </Button>
            </a>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
