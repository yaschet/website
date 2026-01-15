export const NAVIGATION_SHORTCUTS: Record<
  "home" | "blog" | "projects" | "contact",
  { mac: string; win: string; link: string; description: string }
> = {
  home: {
    mac: "⌥⇧T",
    win: "Alt + Shift + H",
    link: "/",
    description: "Navigate to the home page.",
  },
  blog: {
    mac: "⌥⇧B",
    win: "Alt + Shift + B",
    link: "/blog",
    description: "Navigate to the blog page.",
  },
  projects: {
    mac: "⌥⇧P",
    win: "Alt + Shift + P",
    link: "/projects",
    description: "Navigate to the projects page.",
  },
  contact: {
    mac: "⌥⇧C",
    win: "Alt + Shift + C",
    link: "/contact",
    description: "Navigate to the contact page.",
  },
};
