import type { Meta, StoryObj } from "@storybook/react-vite";
import { SwissGridProvider, useSwissGrid } from "./swiss-grid-canvas";
import React, { useEffect, useRef } from "react";

/**
 * ## Swiss Grid Canvas
 *
 * A mathematically perfect, canvas-based crosshair grid overlay.
 * Features:
 * - **Pixel Perfection**: Calculates exact intersection points to avoid sub-pixel blurring.
 * - **Dynamic Registration**: Sections register their boundaries to receive corner reinforcements.
 * - **Coordinated Entry**: Animated procedural drawing on page reveal.
 */
const meta: Meta<typeof SwissGridProvider> = {
  title: "UI/SwissGrid",
  component: SwissGridProvider,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

const GridSection = ({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const { registerSection, unregisterSection } = useSwissGrid();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerSection(id, ref.current);
    return () => unregisterSection(id);
  }, [id, registerSection, unregisterSection]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export const Default: StoryObj = {
  render: () => (
    <SwissGridProvider>
      <div className="relative min-h-screen bg-surface-50 dark:bg-surface-950 p-10 flex flex-col gap-20">
        <GridSection
          id="hero"
          className="h-64 flex items-center justify-center border-b border-transparent"
        >
          <h1 className="text-4xl font-bold">Hero Section</h1>
        </GridSection>
        <GridSection
          id="content"
          className="h-96 flex items-center justify-center border-b border-transparent"
        >
          <p className="text-xl">Content Section with Grid Intersections</p>
        </GridSection>
        <GridSection
          id="footer"
          className="h-40 flex items-center justify-center"
        >
          <p>Footer Section</p>
        </GridSection>
      </div>
    </SwissGridProvider>
  ),
};
