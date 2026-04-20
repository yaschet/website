export const PORTFOLIO_VIDEO_ACTIVE_EVENT = "portfolio:mux-video-active";

export type PortfolioVideoActiveEventDetail = {
	instanceId?: number | null;
	pathname?: string | null;
	stopAll?: boolean;
};

export function announceActivePortfolioVideo(detail: PortfolioVideoActiveEventDetail) {
	if (typeof window === "undefined") return;

	window.dispatchEvent(
		new CustomEvent<PortfolioVideoActiveEventDetail>(PORTFOLIO_VIDEO_ACTIVE_EVENT, { detail }),
	);
}

export function stopAllPortfolioVideos() {
	if (typeof document !== "undefined") {
		for (const media of document.querySelectorAll("video, audio")) {
			try {
				(media as HTMLMediaElement).pause();
			} catch {}
		}
	}

	announceActivePortfolioVideo({
		instanceId: null,
		pathname: null,
		stopAll: true,
	});
}
