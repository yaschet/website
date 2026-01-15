"use client";

import { cn } from "@/src/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Home,
  Images,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  name: string;
  link: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { name: "Home", link: "/", icon: Home },
  { name: "About", link: "/about", icon: User },
  { name: "Work", link: "/projects", icon: Briefcase },
  { name: "Blog", link: "/blog", icon: FileText },
  { name: "Gallery", link: "/gallery", icon: Images },
];

export function FloatingNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-8 left-0 right-0 mx-auto w-fit z-50">
      <nav
        className="flex items-center gap-2 px-2 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <ul className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.link === "/"
                ? pathname === "/"
                : pathname.startsWith(item.link);

            return (
              <li key={item.link}>
                <Link
                  href={item.link}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-full outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 select-none",
                    isActive
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-full -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  {item.name === "Home" ? (
                    <item.icon className="size-4" />
                  ) : (
                    <>
                      {item.icon && (
                        <item.icon className="size-4 sm:hidden md:hidden lg:hidden" />
                      )}
                      <span className="hidden sm:inline">{item.name}</span>
                      <span className="sm:hidden">
                        {item.icon && <item.icon className="size-4" />}
                      </span>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex items-center justify-center p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 bg-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          aria-label="Toggle theme"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </nav>
    </div>
  );
}
