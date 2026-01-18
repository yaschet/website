import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

/**
 * ## Badge - Core UI Primitive
 *
 * Used for status tags, category indicators, and meta-information labels.
 * Adheres to the "Architecture of the Blade" geometric standard with precise padding.
 */
const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "soft", "outlined", "plain"],
      description: "The visual style of the badge.",
    },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "accent",
        "success",
        "warning",
        "info",
        "destructive",
      ],
      description: "The semantic color scheme.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "The physical size.",
    },
    shape: {
      control: "select",
      options: ["default", "none", "xs", "sm", "md", "lg", "xl", "full"],
      description: "Rounding override.",
    },
  },
  args: {
    children: "Badge",
    variant: "solid",
    color: "primary",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const SolidPrimary: Story = {
  args: {
    variant: "solid",
    color: "primary",
    children: "Primary Status",
  },
};

export const SoftSuccess: Story = {
  args: {
    variant: "soft",
    color: "success",
    children: "Success Label",
  },
};

export const OutlinedWarning: Story = {
  args: {
    variant: "outlined",
    color: "warning",
    children: "Warning Required",
  },
};

export const Destructive: Story = {
  args: {
    variant: "solid",
    color: "destructive",
    children: "Critical Error",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Badge",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Compact",
  },
};
