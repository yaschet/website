import { Button } from "@components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="flex w-full max-w-2xl flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Yaschet <span className="text-zinc-400">— blending design</span>
          <br />
          <span className="text-zinc-400">
            and code into world-class products
          </span>
        </h1>

        <div className="mt-8 flex gap-4">
          <Button variant="solid" color="default" className="rounded-full px-6">
            View work
          </Button>
          <Button variant="outlined" className="rounded-full px-6">
            About me
          </Button>
        </div>
      </main>
    </div>
  );
}
