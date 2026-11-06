import type { Metadata } from "next";
import { ContactPage } from "@/src/components/pages/contact-page";

export const metadata: Metadata = {
	title: "Contact",
	description:
		"Have a product to build or software to improve? Talk to Yassine Chettouch about a project or ongoing development and support.",
	alternates: {
		canonical: "/contact",
	},
};

export default function ContactRoute() {
	return <ContactPage formEnabled />;
}
