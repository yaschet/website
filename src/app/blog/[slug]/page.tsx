import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { PostContentRSC } from "@/src/components/content/post-content-rsc";
import { getAllPosts, getPostBySlug } from "@/src/content/registry";

interface PostPageProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateStaticParams() {
	const posts = await getAllPosts();

	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata(
	{ params }: PostPageProps,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		return {
			title: "Post Not Found",
		};
	}

	// Resolve the primary image for OG
	const ogImage = "/images/og-image.png";

	// Await parent metadata to safely merge defaults
	const parentMetadata = await parent;
	const parentOpenGraph = parentMetadata.openGraph || {};

	return {
		title: post.title,
		description: post.description,
		alternates: {
			canonical: `/blog/${slug}`,
		},
		openGraph: {
			...parentOpenGraph,
			title: `${post.title} | Yassine Chettouch`,
			description: post.description,
			type: "article",
			url: `https://yaschet.dev/blog/${post.slug}`,
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: post.title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${post.title} | Yassine Chettouch`,
			description: post.description,
			images: [ogImage],
		},
	};
}

export default async function PostPage({ params }: PostPageProps) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	// Construct JSON-LD for BlogPosting
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.description,
		image: "https://yaschet.dev/images/og-image.png",
		datePublished: post.date,
		dateModified: post.date,
		author: {
			"@type": "Person",
			name: "Yassine Chettouch",
			url: "https://yaschet.dev",
		},
		publisher: {
			"@type": "Person",
			name: "Yassine Chettouch",
			url: "https://yaschet.dev",
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is trusted
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<PostContentRSC post={post} />
		</>
	);
}
