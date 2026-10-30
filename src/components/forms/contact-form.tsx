"use client";

import { RiArrowRightLine as ArrowRight } from "@remixicon/react";
import { useForm } from "@tanstack/react-form";
import { type ChangeEvent, useId, useRef } from "react";
import { submitContactForm } from "@/src/app/actions/contact";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/form/input";
import { Label } from "@/src/components/ui/form/label";
import { Textarea } from "@/src/components/ui/form/textarea";
import { toast } from "@/src/components/ui/sonner";
import { StateSwap } from "@/src/components/ui/state-swap";
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

const submitLabels = { idle: "Send message", pending: "Sending message" };

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
	id,
}: {
	id: string;
	field: ContactField;
	label: string;
	placeholder: string;
	type?: "text" | "email";
	isTextArea?: boolean;
}) {
	const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
	const controlProps = {
		id,
		name: field.name,
		value: field.state.value,
		onBlur: field.handleBlur,
		onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			field.handleChange(event.target.value),
		placeholder,
		hasError,
		"aria-invalid": hasError,
		"aria-describedby": hasError ? `${id}-error` : undefined,
		"aria-required": true,
		required: true,
		minLength: { name: 2, email: 1, subject: 5, message: 10 }[field.name],
		spellCheck: field.name === "subject" || field.name === "message",
		autoCapitalize: field.name === "email" ? "none" : undefined,
		autoComplete: field.name === "name" || field.name === "email" ? field.name : undefined,
		maxLength: { name: 100, email: 254, subject: 200, message: 2000 }[field.name],
	};

	return (
		<div className="portfolio-form-field group">
			<Label
				htmlFor={id}
				className="text-muted-foreground group-focus-within:text-foreground"
			>
				{label}
			</Label>
			{isTextArea ? (
				<Textarea {...controlProps} className="min-h-40" />
			) : (
				<Input {...controlProps} type={type} size="md" />
			)}
			{hasError && (
				<p id={`${id}-error`} className="font-sans text-destructive-ink text-xs leading-4">
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
	const instanceId = useId();
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
					toast.add({
						type: "success",
						title: "Message sent",
						description: "I'll get back to you as soon as possible.",
					});
					form.reset();
					submissionId.current = null;
				} else {
					toast.add({
						type: "error",
						title: "Failed to send",
						description: result.error,
					});
				}
			} catch (_error) {
				toast.add({
					type: "error",
					title: "Error",
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
			aria-label="Send a message"
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
			className="portfolio-contact-form"
		>
			<div hidden aria-hidden="true">
				<label htmlFor={`${instanceId}-website`}>Website</label>
				<input
					ref={website}
					id={`${instanceId}-website`}
					name="website"
					type="text"
					tabIndex={-1}
					autoComplete="off"
					maxLength={200}
				/>
			</div>
			<div className="portfolio-contact-identity">
				<form.Field name="name">
					{(field) => (
						<FormField
							id={`${instanceId}-name`}
							field={field}
							label="Name"
							placeholder="Your name"
						/>
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<FormField
							id={`${instanceId}-email`}
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
					<FormField
						id={`${instanceId}-subject`}
						field={field}
						label="Subject"
						placeholder="What would you like to discuss?"
					/>
				)}
			</form.Field>

			<form.Field name="message">
				{(field) => (
					<FormField
						id={`${instanceId}-message`}
						field={field}
						label="Message"
						placeholder="Tell me a little about your project or question."
						isTextArea
					/>
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
						icon={<ArrowRight aria-hidden="true" />}
						iconPosition="end"
						aria-label={isSubmitting ? submitLabels.pending : submitLabels.idle}
						className="w-full justify-self-start sm:w-auto"
					>
						<StateSwap
							kind="text"
							sizing="content"
							value={isSubmitting ? "pending" : "idle"}
							items={submitLabels}
						/>
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
