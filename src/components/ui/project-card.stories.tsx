import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectCard } from "./project-card";
import React from "react";

/**
 * ## ProjectCard
 *
 * High-fidelity card for project showcases.
 * Features:
 * - **Geometric Precision**: Double-border structure (2px + 1px) following Swiss rules.
 * - **Tech Stack Pills**: Minimalist mono-font badges.
 * - **Interactive Reveal**: Group-hover transitions for borders and text colors.
 */
const meta: Meta<typeof ProjectCard> = {
  title: "UI/ProjectCard",
  component: ProjectCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md p-6 bg-surface-50 dark:bg-surface-950">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

const mockProject = {
  title: "Verto — Financial OS",
  description:
    "A high-performance trading platform built for institutional grade execution. Focusing on latency reduction and geometric clarity.",
  date: "2024-05-15",
  url_path: "/projects/verto",
  tech: ["Next.js", "TypeScript", "Tailwind v4", "Framer Motion", "Rust"],
  featured: true,
  _id: "verto",
  _type: "Project",
  body: { code: "" },
} as any;

export const Featured: Story = {
  args: {
    project: mockProject,
  },
};

export const Standard: Story = {
  args: {
    project: {
      ...mockProject,
      featured: false,
      title: "Swiss Grid System",
      tech: ["Canvas API", "Physics", "React"],
    },
  },
};
