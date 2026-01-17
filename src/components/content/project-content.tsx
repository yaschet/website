"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { useMDXComponent } from "next-contentlayer/hooks";
import type { Project } from "contentlayer/generated";
import { Button } from "@/src/components/ui/button";
import { ScrollReveal } from "@/src/components/ui/reveal";
import {
  SwissGridProvider,
  SwissGridSection,
} from "@/src/components/ui/swiss-grid-canvas";
import { mdxComponents } from "@/src/components/mdx/mdx-components";

interface ProjectContentProps {
  project: Project;
}

export function ProjectContent({ project }: ProjectContentProps) {
  const MDXContent = useMDXComponent(project.body.code);

  return (
    <SwissGridProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <main className="relative z-10 flex min-h-screen flex-col pt-32">
          {/* Header */}
          <SwissGridSection id="project-header" className="w-full">
            <ScrollReveal phase={1} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 sm:px-8">
                  {/* Back Link */}
                  <Link
                    href="/projects"
                    className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft size={14} weight="bold" />
                    <span>Back to Projects</span>
                  </Link>

                  {/* Project Meta */}
                  <div className="mb-6 flex items-center gap-4">
                    <time className="font-mono text-xs tabular-nums text-muted-foreground">
                      {new Date(project.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </time>
                    {project.featured && (
                      <span className="border border-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="mb-4 text-heading-xl text-foreground">
                    {project.title}
                  </h1>

                  {/* Description */}
                  <p className="mb-8 max-w-xl text-body-lg text-muted-foreground">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  {project.tech && project.tech.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2">
                      {project.tech.map((tech: string) => (
                        <span
                          key={tech}
                          className="border border-surface-950 dark:border-surface-100 bg-transparent px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-surface-950 dark:text-surface-100"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  {(project.url || project.github) && (
                    <div className="flex gap-4">
                      {project.url && (
                        <Button
                          asChild
                          size="md"
                          variant="outlined"
                          color="default"
                        >
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Site
                          </a>
                        </Button>
                      )}
                      {project.github && (
                        <Button
                          asChild
                          size="md"
                          variant="outlined"
                          color="default"
                        >
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Code
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Content */}
          <SwissGridSection id="project-content" className="w-full">
            <ScrollReveal phase={2} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
                  <article>
                    <MDXContent components={mdxComponents} />
                  </article>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Footer */}
          <footer className="mt-auto w-full">
            <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
              <p className="text-body-sm text-muted-foreground">
                © {new Date().getFullYear()} Yassine Chettouch. Rabat, Morocco.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </SwissGridProvider>
  );
}
