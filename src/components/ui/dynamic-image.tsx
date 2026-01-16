"use client";

// --------------------------------------------------------------
//
// * Note:
// This component will provide a dynamic image component that will allow us to use the next/image component with light/dark support.
//
// --------------------------------------------------------------
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import type { StaticImageData, ImageProps } from "next/image";

export function DynamicImage({
  alt,
  darkSrc,
  lightSrc,
  ...props
}: {
  lightSrc: StaticImageData | string;
  darkSrc: StaticImageData | string;
  alt: string;
} & Omit<ImageProps, "src" | "alt">) {
  const { systemTheme, theme } = useTheme();
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  const imgSrc = useMemo(() => {
    return currentTheme === "dark" ? darkSrc : lightSrc;
  }, [currentTheme, darkSrc, lightSrc]);

  if (!isMounted) {
    return <Skeleton className="size-full" {...props} />;
  }

  return <Image alt={alt} src={imgSrc} {...props} />;
}
