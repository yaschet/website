import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { ArrowRight, Github, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import avatarImage from "../../public/images/avatar.jpeg";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-zinc-50 dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
      <main className="relative flex flex-col min-h-screen">
        {/* Nav Spacer */}
        <div className="h-28" />

        {/* Hero Section */}
        <section className="w-full">
          <div className="mx-auto max-w-2xl px-6 sm:px-8 py-16 sm:py-20">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-12">
              <Avatar className="relative size-14 sm:size-16 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={avatarImage}
                  alt="Yassine Chettouch"
                  className="grayscale hover:grayscale-0 transition-all duration-500 object-cover"
                  placeholder="blur"
                  fill
                  sizes="64px"
                />
                <AvatarFallback className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  YC
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Yassine Chettouch
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Senior Product Engineer
                </p>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-6 mb-12">
              <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1]">
                I turn ambitious ideas into{" "}
                <span className="text-zinc-500 dark:text-zinc-400">
                  revenue-generating products.
                </span>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
                Your vision needs more than just a developer—it needs a partner
                who plays to win. I build systems that scale, experiences that
                convert, and software that defines your brand.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4 mb-16">
              <Link
                href="mailto:hello@yaschet.dev"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Let's build something
                <ArrowRight className="size-4" />
              </Link>
              <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
                <Link
                  href="https://x.com/yaschet"
                  target="_blank"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-5"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
                <Link
                  href="https://github.com/yaschet"
                  target="_blank"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="size-5" />
                </Link>
                <Link
                  href="https://linkedin.com/in/yaschet"
                  target="_blank"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="size-5" />
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-zinc-200 dark:bg-zinc-800 mb-16" />

            {/* Projects Preview */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Selected Work
              </p>
              <div className="space-y-6">
                {/* Project 1 */}
                <Link
                  href="/projects/protranslate"
                  className="group block p-6 -mx-6 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        Protranslate
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        AI-powered document translation SaaS
                      </p>
                    </div>
                    <ArrowRight className="size-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </Link>

                {/* Project 2 */}
                <Link
                  href="/projects/student-portal"
                  className="group block p-6 -mx-6 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        Student Onboarding Portal
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Enterprise internal tool for education company
                      </p>
                    </div>
                    <ArrowRight className="size-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </Link>

                {/* Project 3 */}
                <Link
                  href="/projects/automation-suite"
                  className="group block p-6 -mx-6 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        AI Automation Suite
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Data cleansing & intelligent program search engines
                      </p>
                    </div>
                    <ArrowRight className="size-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto py-8">
          <div className="mx-auto max-w-2xl px-6 sm:px-8">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              © 2025 Yassine Chettouch. Available for new projects.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
