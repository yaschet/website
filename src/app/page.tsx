import { HomePageContent } from "@/src/components/pages/home-page";
import { getListedPublicProjectSummaries } from "@/src/content/project-summaries";

export default async function Home() {
	"use cache";
	const projects = await getListedPublicProjectSummaries();
	return <HomePageContent projects={projects} />;
}
