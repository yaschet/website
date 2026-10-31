"use client";

import dynamic from "next/dynamic";
import type { ReactNode, RefObject } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";

const GalleryLightbox = dynamic(
	() => import("./gallery-lightbox").then((module) => module.GalleryLightbox),
	{ ssr: false },
);

export interface GalleryOrigin {
	slide: HTMLElement | null;
}

interface RegisteredGallery {
	id: string;
	items: GalleryMediaSource[];
	root: RefObject<HTMLElement | null>;
	select: (index: number) => void;
	onOpenChange: (open: boolean) => void;
}

interface PageGalleryContextValue {
	register: (gallery: RegisteredGallery) => () => void;
	open: (id: string, index: number, instant: boolean) => void;
}

interface GallerySession {
	items: GalleryMediaSource[];
	origins: GalleryOrigin[];
	select: ((() => void) | undefined)[];
	index: number;
	instant: boolean;
	owner: RegisteredGallery;
}

const PageGalleryContext = createContext<PageGalleryContextValue | null>(null);

/** Joins the existing media blocks in reading order without changing their inline layout. */
export function PageGalleryScope({ children }: { children: ReactNode }) {
	const galleries = useRef(new Map<string, RegisteredGallery>());
	const [session, setSession] = useState<GallerySession | null>(null);
	const [open, setOpen] = useState(false);
	const register = useCallback((gallery: RegisteredGallery) => {
		galleries.current.set(gallery.id, gallery);
		return () => {
			if (galleries.current.get(gallery.id) === gallery) galleries.current.delete(gallery.id);
		};
	}, []);
	const openGallery = useCallback((id: string, localIndex: number, instant: boolean) => {
		const owner = galleries.current.get(id);
		if (!owner) return;
		const ordered = [...galleries.current.values()].sort((a, b) => {
			const first = a.root.current;
			const second = b.root.current;
			if (!first || !second) return 0;
			return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
				? -1
				: 1;
		});
		const entries = ordered.flatMap((gallery) =>
			gallery.items.map((item, index) => ({
				item,
				gallery,
				index,
				origin: {
					slide:
						gallery.root.current?.querySelector<HTMLElement>(
							`[data-gallery-slide="${index}"]`,
						) ?? null,
				},
			})),
		);
		const index = entries.findIndex(
			(entry) => entry.gallery.id === id && entry.index === localIndex,
		);
		if (index < 0) return;
		setSession({
			items: entries.map((entry) => entry.item),
			origins: entries.map((entry) => entry.origin),
			select: entries.map((entry) => () => entry.gallery.select(entry.index)),
			index,
			instant,
			owner,
		});
		owner.onOpenChange(true);
		setOpen(true);
	}, []);
	const context = useMemo(() => ({ register, open: openGallery }), [register, openGallery]);
	return (
		<PageGalleryContext.Provider value={context}>
			{children}
			{session && (
				<GalleryLightbox
					items={session.items}
					origins={session.origins}
					activeIndex={session.index}
					onIndexChange={(index) => {
						session.select[index]?.();
						setSession((current) => (current ? { ...current, index } : current));
					}}
					open={open}
					onOpenChange={(next) => {
						setOpen(next);
						session.owner.onOpenChange(next);
					}}
					instant={session.instant}
					quality={90}
					sizes="100vw"
				/>
			)}
		</PageGalleryContext.Provider>
	);
}

export function usePageGallery() {
	return useContext(PageGalleryContext);
}
