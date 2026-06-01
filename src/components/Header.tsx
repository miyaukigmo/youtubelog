import { PlaySquare, User } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <PlaySquare className="h-5 w-5 text-red-500" />
            <span className="hidden font-bold sm:inline-block">
              YouTubeLog
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
