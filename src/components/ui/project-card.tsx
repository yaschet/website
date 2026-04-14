import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "contentlayer2/generated";
import Link from "next/link";
import { cn } from "@/src/lib/index";

/**
 * Project showcase card for portfolio display.
 *
 * @remarks
 * Renders a linked card with project metadata including title, description,
 * date, tech stack, and featured status. Uses group-hover interactions
 * for border and text color transitions.
 *
 * @example
 * ```tsx
 * <ProjectCard project={project} className="max-w-md" />
 * ```
 *
 * @param props - Component properties.
 * @param props.project - Contentlayer Project document.
 * @param props.className - Optional additional CSS classes.
 * @returns A linked card element with project information.
 *
 * @public
 */
interface ProjectCardProps {
	project: Project;
	className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
	return (
		<Link
			href={project.url_path}
			className={cn(
				"group relative block border-2 border-surface-200 bg-surface-100 transition-all duration-200 hover:border-surface-900 dark:border-surface-800 dark:bg-surface-950 dark:hover:border-surface-100",
				className,
			)}
		>
			{/* Content */}
			<div className="p-6">
				{/* Date & Tags */}
				<div className="mb-4 flex items-center gap-4">
					<time className="font-mono text-surface-400 text-xs tabular-nums dark:text-surface-500">
						{new Date(project.date).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
						})}
					</time>
					{project.featured && (
						<span className="border border-primary-500 px-2 py-0.5 font-mono text-[10px] text-primary-500 uppercase tracking-wider">
							Featured
						</span>
					)}
				</div>

				{/* Title */}
				<h3 className="mb-3 font-bold text-surface-900 text-xl transition-colors group-hover:text-surface-900 dark:text-surface-100 dark:group-hover:text-surface-50">
					{project.title}
				</h3>

				{/* Description */}
				<p className="mb-6 text-sm text-surface-600 leading-relaxed dark:text-surface-400">
					{project.description}
				</p>

				{/* Tech Stack */}
				{project.tech && project.tech.length > 0 && (
					<div className="mb-4 flex flex-wrap gap-2">
						{project.tech.slice(0, 4).map((tech: string) => (
							<span
								key={tech}
								className="border border-surface-300 bg-surface-50 px-2 py-1 font-mono text-[10px] text-surface-800 uppercase tracking-wide dark:border-surface-800 dark:bg-surface-900 dark:text-surface-200"
							>
								{tech}
							</span>
						))}
						{project.tech.length > 4 && (
							<span className="flex items-center px-2 py-1 font-mono text-[10px] text-surface-400">
								+{project.tech.length - 4} more
							</span>
						)}
					</div>
				)}

				{/* Read More Link */}
				<div className="flex items-center gap-2 font-mono text-surface-500 text-xs uppercase tracking-wider transition-colors group-hover:text-surface-900 dark:text-surface-400 dark:group-hover:text-surface-100">
					<span>View Case Study</span>
					<ArrowRight
						className="transition-transform group-hover:translate-x-1"
						weight="bold"
						size={14}
					/>
				</div>
			</div>
		</Link>
	);
}
