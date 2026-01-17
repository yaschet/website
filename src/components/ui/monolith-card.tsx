import Image, { type StaticImageData } from "next/image";
import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Lock } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/src/lib/utils";

interface MonolithCardProps {
  title: string;
  description: string;
  href: string;
  image?: string | StaticImageData;
  images?: (string | StaticImageData)[]; // Gallery Mode
  year: string;
  role: string;
  index: string;
  tags: string[];
  status?: "deployed" | "confidential" | "internal";
  className?: string;
}

export function MonolithCard({
  title,
  description,
  href,
  image,
  images,
  year,
  role,
  index,
  tags,
  status = "deployed",
  className,
}: MonolithCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Status configuration map
  const statusConfig = {
    deployed: {
      label: "DEPLOYED",
      color: "bg-emerald-500",
    },
    confidential: {
      label: "CONFIDENTIAL",
      color: "bg-amber-500",
    },
    internal: {
      label: "INTERNAL",
      color: "bg-blue-500",
    },
  };

  const currentStatus = statusConfig[status];

  // Resolve content sources
  // If images[] is provided, use it. Otherwise fallback to single image or placeholder.
  const galleryImages =
    images && images.length > 0 ? images : image ? [image] : [];
  const hasGallery = galleryImages.length > 1;

  // Mechanical Scrub Logic
  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    if (!hasGallery) return;

    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;

    // Calculate discrete index based on mouse position
    // Physics: Direct mapping (1:1 control)
    const newIndex = Math.floor((x / width) * galleryImages.length);

    // Clamp index
    const clampedIndex = Math.max(
      0,
      Math.min(newIndex, galleryImages.length - 1),
    );

    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  }

  function handleMouseLeave() {
    // "Reset" feels cleaner/Swiss. The tool resets when let go.
    setActiveIndex(0);
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[var(--radius)]",
        "border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900",
        "aspect-[16/10] sm:aspect-[16/9]",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Layer (Gallery or Single) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {galleryImages.length > 0 ? (
          // Gallery Strip (Horizontal Slide)
          <div
            className="flex h-full transition-transform duration-300 will-change-transform ease-out"
            style={{
              width: `${galleryImages.length * 100}%`,
              transform: `translateX(-${
                (activeIndex * 100) / galleryImages.length
              }%)`,
            }}
          >
            {galleryImages.map((src, i) => (
              <div key={i} className="relative h-full w-full flex-1">
                <Image
                  src={src}
                  alt={`${title} - View ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  placeholder={typeof src !== "string" ? "blur" : undefined}
                  quality={90}
                />
              </div>
            ))}
          </div>
        ) : (
          // Placeholder Gradient
          <div className="size-full bg-gradient-to-br from-surface-200 to-surface-100 transition-transform duration-700 ease-out group-hover:scale-105 dark:from-surface-800 dark:to-surface-950" />
        )}

        {/* Contrast Overlay */}
        <div className="absolute inset-0 bg-surface-950/10 transition-colors duration-500 group-hover:bg-surface-950/20 dark:bg-surface-950/40 dark:group-hover:bg-surface-950/30" />
      </div>

      {/* Swiss Ticks (Pagination Indicators) */}
      {hasGallery && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex gap-1 px-1 pb-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {galleryImages.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i === activeIndex
                  ? "bg-surface-900 dark:bg-surface-100"
                  : "bg-surface-900/20 dark:bg-surface-100/20",
              )}
            />
          ))}
        </div>
      )}

      {/* Data Layer */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-8">
        {/* Header: Metadata */}
        <div className="flex items-start justify-between text-xs font-mono uppercase tracking-wider text-surface-500 dark:text-surface-400">
          <div className="flex gap-4">
            <span className="font-bold text-surface-900 dark:text-surface-100">
              [{index}]
            </span>
            <span>{year}</span>
          </div>

          <div className="flex gap-4 text-right">
            <span>{role}</span>
            {/* Status Beacon */}
            <div className="flex items-center gap-2">
              <span
                className={cn("size-1.5 rounded-full", currentStatus.color)}
              />
              <span className="hidden sm:inline">{currentStatus.label}</span>
            </div>
          </div>
        </div>

        {/* Footer: Content & Action */}
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <h3 className="text-heading-md font-medium text-surface-900 dark:text-surface-50 sm:text-heading-lg">
              {title}
            </h3>
            <p className="line-clamp-2 max-w-sm text-body-sm text-surface-600 dark:text-surface-300">
              {description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-sm border border-surface-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-surface-600 dark:border-surface-700 dark:text-surface-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-surface-900 group-hover:bg-surface-900 dark:border-surface-700 dark:group-hover:border-surface-50 dark:group-hover:bg-surface-50">
            {status === "confidential" ? (
              <Lock
                weight="bold"
                className="size-5 text-surface-900 transition-all duration-300 group-hover:scale-110 group-hover:text-surface-50 dark:text-surface-100 dark:group-hover:text-surface-900"
              />
            ) : (
              <ArrowUpRight
                weight="bold"
                className="size-5 text-surface-900 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-surface-50 dark:text-surface-100 dark:group-hover:text-surface-900"
              />
            )}
          </div>
        </div>
      </div>

      {/* Interaction Border */}
      <div className="pointer-events-none absolute inset-0 z-20 rounded-[var(--radius)] border border-transparent transition-colors duration-300 group-hover:border-surface-400/50 dark:group-hover:border-surface-600/50" />
    </Link>
  );
}
