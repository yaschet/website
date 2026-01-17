"use client";

/**
 * ArticleTOC - Table of Contents with Reading Progress
 *
 * @module article-toc
 * @description
 * A floating Table of Contents that tracks reading progress and highlights
 * the currently visible section. Designed for long-form technical content.
 *
 * Architecture:
 * 1. Extracts headings from the DOM (h2, h3)
 * 2. Uses IntersectionObserver for efficient scroll tracking
 * 3. Reading progress as a vertical fill line (Swiss aesthetic)
 * 4. Physics-based springs for all animations
 *
 * @example
 * <ArticleTOC contentSelector="article" />
 */

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { List } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ArticleTOCProps {
  /** CSS selector for the content container (default: "article") */
  contentSelector?: string;
  /** Optional class name for the container */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ArticleTOC({
  contentSelector = "article",
  className,
}: ArticleTOCProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headingElementsRef = useRef<Map<string, IntersectionObserverEntry>>(
    new Map(),
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Client-side mount guard (prevents SSR issues)
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Reading Progress
  // ─────────────────────────────────────────────────────────────────────────

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });
  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // ─────────────────────────────────────────────────────────────────────────
  // Extract Headings from DOM
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mounted) return;

    const content = document.querySelector(contentSelector);
    if (!content) return;

    const headingElements = content.querySelectorAll("h2, h3");
    const extractedHeadings: Heading[] = [];

    headingElements.forEach((heading) => {
      const id = heading.id;
      const text = heading.textContent || "";
      const level = parseInt(heading.tagName.charAt(1), 10);

      if (id && text) {
        extractedHeadings.push({ id, text, level });
      }
    });

    setHeadings(extractedHeadings);
  }, [contentSelector, mounted]);

  // ─────────────────────────────────────────────────────────────────────────
  // Intersection Observer for Active Section
  // ─────────────────────────────────────────────────────────────────────────

  const getActiveHeading = useCallback(() => {
    const sortedEntries = Array.from(headingElementsRef.current.entries()).sort(
      ([, a], [, b]) => {
        const aTop = a.boundingClientRect.top;
        const bTop = b.boundingClientRect.top;
        return aTop - bTop;
      },
    );

    // Find the first heading that's in or above the viewport
    for (const [id, entry] of sortedEntries) {
      if (entry.boundingClientRect.top <= 120) {
        return id;
      }
    }

    // If no heading is above viewport, return the first one
    return sortedEntries[0]?.[0] || "";
  }, []);

  useEffect(() => {
    if (!mounted || headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          headingElementsRef.current.set(entry.target.id, entry);
        });

        const activeHeading = getActiveHeading();
        if (activeHeading) {
          setActiveId(activeHeading);
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: [0, 0.5, 1],
      },
    );

    // Observe all headings
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings, getActiveHeading, mounted]);

  // ─────────────────────────────────────────────────────────────────────────
  // Visibility on Scroll
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show after scrolling past the header (~300px)
      setIsVisible(scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation Handler
  // ─────────────────────────────────────────────────────────────────────────

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  // Don't render until mounted (SSR guard) or if no headings
  if (!mounted || headings.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={springs.responsive}
      className={cn(
        "fixed top-1/2 left-6 z-40 hidden -translate-y-1/2 xl:block",
        className,
      )}
      aria-label="Table of contents"
    >
      <div className="relative flex">
        {/* Progress Track */}
        <div className="relative mr-4 w-px">
          {/* Background Track */}
          <div className="absolute inset-0 bg-surface-200 dark:bg-surface-800" />
          {/* Progress Fill */}
          <motion.div
            className="absolute top-0 left-0 w-full bg-surface-950 dark:bg-surface-50"
            style={{ height: progressHeight }}
          />
        </div>

        {/* TOC Items */}
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2 text-surface-400 dark:text-surface-500">
            <List size={14} weight="bold" />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              Contents
            </span>
          </div>

          {/* Links */}
          {headings.map(({ id, text, level }) => {
            const isActive = id === activeId;

            return (
              <button
                type="button"
                key={id}
                onClick={() => scrollToHeading(id)}
                className={cn(
                  "group relative text-left transition-colors duration-200",
                  "max-w-[180px] truncate font-mono text-xs",
                  level === 3 && "pl-3",
                  isActive
                    ? "text-surface-950 dark:text-surface-50"
                    : "text-surface-400 hover:text-surface-700 dark:text-surface-500 dark:hover:text-surface-300",
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="toc-indicator"
                    className="absolute -left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 bg-surface-950 dark:bg-surface-50"
                    transition={springs.layout}
                  />
                )}
                {text}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
