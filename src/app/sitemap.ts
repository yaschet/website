import { allPosts, allProjects } from "contentlayer2/generated";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	// Base URL for the production site
	const baseUrl = "https://yaschet.dev";

	// 1. Core Pages (Static)
	const coreRoutes = ["", "/about", "/projects", "/blog", "/contact"].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: route === "" ? 1 : 0.8,
	}));

	// 2. Resume / CV (Static Asset)
	const resumeRoute = {
		url: `${baseUrl}/profile.pdf`,
		lastModified: new Date(),
		changeFrequency: "weekly" as const,
		priority: 1.0, // Maximum priority for "Resume" searches
	};

	// 3. Dynamic Projects (from Contentlayer)
	const projectRoutes = allProjects.map((project) => ({
		url: `${baseUrl}/projects/${project.slug}`,
		lastModified: new Date(project.date),
		changeFrequency: "monthly" as const,
		priority: 0.9, // Projects are high value
	}));

	// 4. Dynamic Blog Posts (from Contentlayer)
	const postRoutes = allPosts.map((post) => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: new Date(post.date),
		changeFrequency: "weekly" as const,
		priority: 0.7,
	}));

	return [...coreRoutes, resumeRoute, ...projectRoutes, ...postRoutes];
}
