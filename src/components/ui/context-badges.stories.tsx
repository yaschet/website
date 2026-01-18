import type { Meta, StoryObj } from "@storybook/react-vite";
import { LocationBadge, TimeBadge } from "./context-badges";
import React from "react";

/**
 * ## Context Badges
 *
 * Premium, state-aware badges used in the header and navigation.
 * Featuring:
 * - **Insignia zone**: Edge-mounted flag/icon (no padding)
 * - **Content zone**: Balanced padding (X = Y)
 * - **Reveal integration**: Coordinated entrance phases
 */
const meta: Meta = {
  title: "UI/ContextBadges",
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Location: StoryObj = {
  render: () => <LocationBadge />,
};

export const Time: StoryObj = {
  render: () => <TimeBadge />,
};

/**
 * Demonstrates the Swiss-balanced alignment when multiple badges are used together.
 */
export const Group: StoryObj = {
  render: () => (
    <div className="flex items-center gap-3">
      <LocationBadge />
      <TimeBadge />
    </div>
  ),
};
