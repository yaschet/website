"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";
import {
  SwissGridProvider,
  SwissGridSection,
} from "@/src/components/ui/swiss-grid-canvas";

export default function BlogPage() {
  return (
    <SwissGridProvider>
      <div className="min-h-screen text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
          <SwissGridSection id="blog-coming-soon" className="w-full">
            <Reveal phase={1} className="w-full">
              <section className="mx-auto max-w-xl text-center">
                <p className="mb-4 font-mono text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                  Coming Soon
                </p>
                <h1 className="mb-6 text-heading-xl text-surface-900 dark:text-surface-100">
                  Blog
                </h1>
                <p className="mb-10 text-body-lg text-surface-600 dark:text-surface-400">
                  Technical deep-dives, architecture decisions, and lessons
                  learned from shipping products. Currently in the works.
                </p>
                <Button asChild variant="outlined" size="lg" color="primary">
                  <Link href="/">
                    <ArrowLeft className="size-4" weight="bold" />
                    Back to Home
                  </Link>
                </Button>
              </section>
            </Reveal>
          </SwissGridSection>
        </main>
      </div>
    </SwissGridProvider>
  );
}
