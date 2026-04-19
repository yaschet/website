const VERCEL_VIEWER_TIME_ZONE_HEADER = "x-vercel-ip-timezone";

function isValidTimeZone(timeZone: string | null): timeZone is string {
	if (!timeZone) {
		return false;
	}

	try {
		new Intl.DateTimeFormat("en-GB", { timeZone }).format(new Date());
		return true;
	} catch {
		return false;
	}
}

export function GET(request: Request) {
	const timeZoneHeader = request.headers.get(VERCEL_VIEWER_TIME_ZONE_HEADER);
	const timeZone = isValidTimeZone(timeZoneHeader) ? timeZoneHeader : null;

	return Response.json(
		{ timeZone },
		{
			headers: {
				"Cache-Control": "no-store",
			},
		},
	);
}
