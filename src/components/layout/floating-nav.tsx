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
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

const springConfig = {
  type: "spring" as const,
  mass: 0.6,
  stiffness: 500,
  damping: 30,
};

const hoverSpring = {
  type: "spring" as const,
  mass: 0.4,
  stiffness: 600,
  damping: 35,
};

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

const BUTTON_SIZE = 40;
const ICON_SIZE = 18;

export function FloatingNav() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find active item based on pathname
  // We use the item link as the ID
  const activeItem = navItems.find((item) =>
    item.link === "/" ? pathname === "/" : pathname.startsWith(item.link)
  );
  const activeTab = activeItem?.link || "";

  // The slot target is either the hovered tab or the active tab
  // If we are hovering the theme button, the target is "theme-toggle"
  const currentTab = hoveredTab ?? activeTab;

  const toggleTheme = async () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("transition-bg-dark");
    } else {
      document.documentElement.classList.add("transition-bg-light");
    }

    if (
      !themeButtonRef.current ||
      !(document as any).startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(newTheme);
      document.documentElement.classList.remove(
        "transition-bg-light",
        "transition-bg-dark"
      );
      return;
    }

    await (document as any).startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    }).ready;

    const { top, left, width, height } =
      themeButtonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 600,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    ).onfinish = () => {
      document.documentElement.classList.remove(
        "transition-bg-light",
        "transition-bg-dark"
      );
    };
  };

  if (!mounted) return null;

  return (
    <div className="fixed top-8 left-0 right-0 mx-auto w-fit z-50">
      <motion.nav
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springConfig}
        className="relative flex items-center gap-1 p-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-lg shadow-zinc-900/5 dark:shadow-zinc-950/50"
        role="navigation"
        aria-label="Main navigation"
        onMouseLeave={() => setHoveredTab(null)}
      >
        <ul className="relative flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.link === activeTab;
            const isHovered = item.link === hoveredTab;
            const Icon = item.icon;

            return (
              <li key={item.link} className="relative">
                <Link
                  href={item.link}
                  onMouseEnter={() => setHoveredTab(item.link)}
                  className={cn(
                    "relative flex items-center justify-center rounded-full outline-none select-none z-10",
                    "transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                    isActive || isHovered
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 dark:text-zinc-400"
                  )}
                  style={{
                    width: BUTTON_SIZE,
                    height: BUTTON_SIZE,
                  }}
                  aria-label={item.name}
                  aria-current={isActive ? "page" : undefined}
                >
                  {currentTab === item.link && (
                    <motion.div
                      layoutId="hover-slot"
                      className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-full -z-10"
                      transition={hoverSpring}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={hoverSpring}
                  >
                    <Icon
                      className="shrink-0"
                      style={{ width: ICON_SIZE, height: ICON_SIZE }}
                      strokeWidth={1.75}
                    />
                  </motion.div>
                </Link>

                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm whitespace-nowrap pointer-events-none z-20"
                    >
                      {item.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <div
          className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-0.5"
          aria-hidden="true"
        />

        <motion.button
          ref={themeButtonRef}
          onMouseEnter={() => setHoveredTab("theme-toggle")}
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={hoverSpring}
          className={cn(
            "relative flex items-center justify-center rounded-full z-10",
            "text-zinc-500 dark:text-zinc-400",
            "hover:text-zinc-900 dark:hover:text-zinc-50",
            // Remove discrete hover bg since we have the shared one
            // "hover:bg-zinc-100 dark:hover:bg-zinc-800",
            "transition-colors duration-200",
            "outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950"
          )}
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
          }}
          aria-label={`Switch to ${
            resolvedTheme === "dark" ? "light" : "dark"
          } mode`}
        >
          {currentTab === "theme-toggle" && (
            <motion.div
              layoutId="hover-slot"
              className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-full -z-10"
              transition={hoverSpring}
            />
          )}
          <Sun
            className="rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
            strokeWidth={1.75}
          />
          <Moon
            className="absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
            strokeWidth={1.75}
          />
        </motion.button>
      </motion.nav>
    </div>
  );
}
