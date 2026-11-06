import type { Metadata } from "next";
import { BlogPageContent } from "@/src/components/pages/blog-page";
import { getAllPosts } from "@/src/content/registry";

export const metadata: Metadata = {
	title: "Blog",
	description: "Technical deep-dives and lessons learned from shipping products.",
	alternates: {
		canonical: "/blog",
	},
};

export default async function BlogPage() {
	"use cache";
	const posts = await getAllPosts();
	return <BlogPageContent posts={posts.map(({ Content: _Content, ...post }) => post)} />;
}
