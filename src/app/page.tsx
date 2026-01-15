import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { ArrowRight, Github, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import avatarImage from "../../public/images/avatar.jpeg";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-zinc-50 dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
      {/* Vertical Column Borders */}
      <div className="fixed inset-0 mx-auto max-w-3xl border-x border-dashed border-zinc-200/60 dark:border-zinc-800/60 pointer-events-none z-0" />

      <main className="relative z-10 flex flex-col min-h-screen">
        {/* Nav Spacer (Banner 32px + Nav offset) */}
        <div className="h-32 border-b border-dashed border-zinc-200 dark:border-zinc-800" />

        {/* Header Section */}
        <header className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="relative size-14 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={avatarImage}
                  alt="Yassine Chettouch"
                  className="grayscale hover:grayscale-0 transition-all duration-500 object-cover"
                  placeholder="blur"
                  fill
                  sizes="56px"
                />
                <AvatarFallback className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  YC
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Yassine Chettouch
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Senior Product Engineer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-500">
              <Link
                href="https://x.com/yaschet"
                target="_blank"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                aria-label="X"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="size-5">
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
        </header>

        {/* Hero Section */}
        <section className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-16 sm:py-20">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1] mb-6">
              I turn ambitious ideas into{" "}
              <span className="text-zinc-400 dark:text-zinc-500">
                revenue-generating products.
              </span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl mb-10">
              Your vision needs more than just a developer—it needs a partner
              who plays to win. I build systems that scale, experiences that
              convert, and software that defines your brand.
            </p>
            <Link
              href="mailto:hello@yaschet.dev"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Let's build something
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* Featured Project */}
        <section className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-16">
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
              Featured Work
            </p>
            <Link href="/projects/protranslate" className="group block">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 mb-6">
                {/* Replace with actual screenshot */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <div className="text-center px-6">
                    <p className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                      Protranslate
                    </p>
                    <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                      AI-powered document translation SaaS with real-time
                      collaboration and enterprise-grade security.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                View case study
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* More Projects */}
        <section className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-16">
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
              More Work
            </p>
            <div className="space-y-8">
              <Link href="/projects/student-portal" className="group block">
                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  Student Onboarding Portal
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  Enterprise internal tool for streamlining student enrollment
                  and documentation workflows.
                </p>
                <div className="flex items-center gap-1 text-sm text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  View project
                  <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link href="/projects/automation-suite" className="group block">
                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  AI Automation Suite
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  Data cleansing pipelines and intelligent program search
                  engines for complex enterprise data.
                </p>
                <div className="flex items-center gap-1 text-sm text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  View project
                  <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-10 flex items-center justify-between text-sm text-zinc-400 dark:text-zinc-500">
            <p>© 2025 Yassine Chettouch</p>
            <p>Available for new projects</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
