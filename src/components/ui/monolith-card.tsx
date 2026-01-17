import Link from "next/link";
import { ArrowUpRight, Lock } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/src/lib/utils";

interface MonolithCardProps {
  title: string;
  description: string;
  href: string;
  image?: string;
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
  year,
  role,
  index,
  tags,
  status = "deployed",
  className,
}: MonolithCardProps) {
  // Status configuration map
  const statusConfig = {
    deployed: {
      label: "DEPLOYED",
      color: "bg-emerald-500",
      ping: "bg-emerald-400",
    },
    confidential: {
      label: "CONFIDENTIAL",
      color: "bg-amber-500",
      ping: "bg-amber-400",
    },
    internal: {
      label: "INTERNAL",
      color: "bg-blue-500",
      ping: "bg-blue-400",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <Link
      href={href}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[var(--radius)]",
        "border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900",
        "aspect-[16/10] sm:aspect-[16/9]",
        className,
      )}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {image ? (
          <div
            className="size-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-surface-200 to-surface-100 transition-transform duration-700 ease-out group-hover:scale-105 dark:from-surface-800 dark:to-surface-950" />
        )}

        {/* Contrast Overlay */}
        <div className="absolute inset-0 bg-surface-950/10 transition-colors duration-500 group-hover:bg-surface-950/20 dark:bg-surface-950/40 dark:group-hover:bg-surface-950/30" />
      </div>

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
              <span className="relative flex size-2">
                <span
                  className={cn(
                    "absolute inline-flex size-full animate-ping rounded-full opacity-75 duration-1000",
                    currentStatus.ping,
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    currentStatus.color,
                  )}
                />
              </span>
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
                  className="inline-block rounded-full border border-surface-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-surface-600 dark:border-surface-700 dark:text-surface-400"
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
