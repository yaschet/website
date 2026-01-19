/**
 * Architectural image container with automatic theme-switching capabilities.
 *
 * @remarks
 * Renders different images based on the current theme (light/dark).
 * system or user theme. Provides a Skeleton placeholder during hydration to
 * prevent layout shifts in thematic transitions.
 *
 * @example
 * ```tsx
 * <DynamicImage
 *   lightSrc="/img-light.png"
 *   darkSrc="/img-dark.png"
 *   alt="Thematic Illustration"
 * />
 * ```
 *
 * @public
 */

"use client";

import type { ImageProps, StaticImageData } from "next/image";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/src/components/ui/skeleton";

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
