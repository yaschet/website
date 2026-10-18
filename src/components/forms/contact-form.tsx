"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { type ChangeEvent, useRef } from "react";
import { toast } from "sonner";
import { submitContactForm } from "@/src/app/actions/contact";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/form/input";
import { Label } from "@/src/components/ui/form/label";
import { Textarea } from "@/src/components/ui/form/textarea";
import { type ContactFormValues, contactSchema } from "@/src/lib/schemas/contact";

interface ContactField {
	name: keyof ContactFormValues;
	state: {
		value: string;
		meta: { isTouched: boolean; errors: readonly unknown[] };
	};
	handleBlur: () => void;
	handleChange: (value: string) => void;
}

function fieldError(error: unknown): string {
	if (typeof error === "string") return error;
	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof error.message === "string"
	)
		return error.message;
	return "Please check this field.";
}

/** Only the string field contract needed by the existing presentation. */
function FormField({
	field,
	label,
	placeholder,
	type = "text",
	isTextArea = false,
}: {
	field: ContactField;
	label: string;
	placeholder: string;
	type?: "text" | "email";
	isTextArea?: boolean;
}) {
	const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
	const controlProps = {
		id: field.name,
		name: field.name,
		value: field.state.value,
		onBlur: field.handleBlur,
		onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			field.handleChange(event.target.value),
		placeholder,
		hasError,
		"aria-invalid": hasError,
		"aria-describedby": hasError ? `${field.name}-error` : undefined,
		maxLength: { name: 100, email: 254, subject: 200, message: 2000 }[field.name],
	};

	return (
		<div className="group portfolio-stack-tight">
			<Label
				htmlFor={field.name}
				className="portfolio-kicker block text-surface-400 transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
			>
				{label}
			</Label>
			{isTextArea ? (
				<Textarea {...controlProps} />
			) : (
				<Input {...controlProps} type={type} size="md" />
			)}
			{hasError && (
				<p
					id={`${field.name}-error`}
					className="portfolio-caption font-medium text-destructive"
				>
					{fieldError(field.state.meta.errors[0])}
				</p>
			)}
		</div>
	);
}

/**
 * Retains failed drafts and a stable retry identifier. No automatic write retries.
 */
export function ContactForm() {
	const website = useRef<HTMLInputElement>(null);
	const submissionId = useRef<string | null>(null);
	const submissionPending = useRef(false);
	const defaultValues: ContactFormValues = { name: "", email: "", subject: "", message: "" };
	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			try {
				submissionId.current ??= crypto.randomUUID();
				const result = await submitContactForm({
					values: value,
					website: website.current?.value ?? "",
					submissionId: submissionId.current,
				});
				if (result.success) {
					toast.success("Message Sent", {
						description: "I'll get back to you as soon as possible.",
					});
					form.reset();
					submissionId.current = null;
				} else {
					toast.error("Failed to Send", {
						description: result.error,
					});
				}
			} catch (_error) {
				toast.error("Error", {
					description: "An unexpected error occurred. Please try again.",
				});
			}
		},
		validators: {
			onChange: contactSchema,
		},
	});

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				e.stopPropagation();
				// Guard the submit event too: Enter/programmatic submits bypass the button.
				if (submissionPending.current) return;
				submissionPending.current = true;
				try {
					await form.handleSubmit();
				} finally {
					submissionPending.current = false;
				}
			}}
			className="portfolio-stack-section"
		>
			<div hidden aria-hidden="true">
				<label htmlFor="contact-website">Website</label>
				<input
					ref={website}
					id="contact-website"
					name="website"
					type="text"
					tabIndex={-1}
					autoComplete="off"
					maxLength={200}
				/>
			</div>
			<div className="grid gap-[var(--portfolio-space-section)] sm:grid-cols-2">
				<form.Field name="name">
					{(field) => <FormField field={field} label="Name" placeholder="John Doe" />}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<FormField
							field={field}
							label="Email"
							placeholder="email@domain.com"
							type="email"
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="subject">
				{(field) => (
					<FormField field={field} label="Subject" placeholder="General Inquiry" />
				)}
			</form.Field>

			<form.Field name="message">
				{(field) => (
					<FormField field={field} label="Message" placeholder="Message" isTextArea />
				)}
			</form.Field>

			<form.Subscribe
				selector={(state) => ({
					canSubmit: state.canSubmit,
					isSubmitting: state.isSubmitting,
				})}
			>
				{({ canSubmit, isSubmitting }) => (
					<Button
						type="submit"
						size="md"
						variant="solid"
						color="primary"
						disabled={!canSubmit || isSubmitting}
						loading={isSubmitting}
						className="w-full sm:w-auto"
					>
						{isSubmitting ? (
							"TRANSMITTING..."
						) : (
							<>
								SEND MESSAGE
								<ArrowRight className="size-4" weight="bold" />
							</>
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
