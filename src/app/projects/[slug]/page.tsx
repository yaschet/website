import { permanentRedirect } from "next/navigation";

interface ProjectPageProps {
	params: Promise<{
		slug: string;
	}>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
	const { slug } = await params;
	permanentRedirect(`/case-studies/${slug}`);
}
