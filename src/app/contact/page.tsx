import type { Metadata } from "next";
import { ContactPage } from "@/src/components/pages/contact-page";

export const metadata: Metadata = {
	title: "Contact",
	description:
		"Internal systems, workflow software, and customer-facing products where clear interfaces sit on top of heavy logic.",
	alternates: {
		canonical: "/contact",
	},
};

export default function ContactRoute() {
	return <ContactPage formEnabled />;
}
