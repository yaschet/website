import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { AvatarImage } from "../components/ui/avatar";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-zinc-50 dark:selection:bg-zinc-100 dark:selection:text-zinc-900 overflow-x-hidden">
      {/* Background Grid Pattern - Vertical Guidelines (Subtle Background) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px)] bg-[size:6rem_100%] opacity-20"></div>

      {/* Main Content Column Vertical Borders - Fixed to Content Width but tall */}
      <div className="fixed inset-0 mx-auto max-w-2xl border-x border-dashed border-zinc-200 dark:border-zinc-800 pointer-events-none z-20"></div>

      <main className="relative z-10 flex flex-col min-h-screen">
        {/* Nav Grid Row - Explicit 104px (32px padding + ~40px Nav + 32px padding) */}
        <div className="h-[104px] w-full border-b border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-[2px]"></div>

        {/* Profile Header - Below Nav Row */}
        <header className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-[2px]">
          <div className="mx-auto max-w-2xl px-6 py-8 sm:px-8 sm:py-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="relative size-12 sm:size-14 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <AvatarImage
                  src="/images/avatar.jpeg"
                  alt="Yassine Chettouch"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
                <AvatarFallback className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  YC
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                  Yassine Chettouch
                </h1>
                <p className="text-sm text-zinc-500 leading-tight mt-1">
                  Senior Product Engineer
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-zinc-400 dark:text-zinc-600">
              <Link
                href="https://x.com/yaschet"
                target="_blank"
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors flex items-center gap-2 group"
              >
                <span className="sr-only sm:not-sr-only sm:text-xs group-hover:underline decoration-zinc-400 underline-offset-4">
                  X
                </span>
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://github.com/yaschet"
                target="_blank"
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors flex items-center gap-2 group"
              >
                <span className="sr-only sm:not-sr-only sm:text-xs group-hover:underline decoration-zinc-400 underline-offset-4">
                  GitHub
                </span>
                <Github className="size-4" />
              </Link>
              <Link
                href="https://linkedin.com/in/yaschet"
                target="_blank"
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors flex items-center gap-2 group"
              >
                <span className="sr-only sm:not-sr-only sm:text-xs group-hover:underline decoration-zinc-400 underline-offset-4">
                  LinkedIn
                </span>
                <Linkedin className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Bio Section - Tighter Rhythm - Even Padding */}
        <section className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-[2px]">
          <div className="mx-auto max-w-2xl px-6 py-6 sm:px-8 sm:py-8">
            <div className="max-w-lg space-y-6">
              <h2 className="text-3xl font-medium tracking-tighter text-zinc-900 dark:text-zinc-100 sm:text-4xl leading-[0.95]">
                <span className="text-zinc-400 dark:text-zinc-600 block mb-2 font-normal tracking-normal text-xl sm:text-2xl">
                  I don't just write code.
                </span>
                I turn ambitious ideas into revenue-generating products.
              </h2>
              <p className="text-base leading-normal text-zinc-600 dark:text-zinc-400 sm:text-lg">
                Your vision needs more than just a developer—it needs a partner
                who plays to win. As a{" "}
                <span className="text-zinc-900 dark:text-zinc-200 font-medium">
                  Senior Product Engineer
                </span>
                , I build systems that scale, experiences that convert, and
                software that defines your brand.
              </p>
              <p className="text-base leading-normal text-zinc-600 dark:text-zinc-400 sm:text-lg">
                No friction. No excuses. Just high-performance execution for
                those who refuse to settle.
              </p>
            </div>
          </div>
        </section>

        {/* Spacer for remaining height */}
        <div className="flex-1 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-[2px]"></div>
      </main>
    </div>
  );
}
