"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { submitContactForm } from "@/src/app/actions/contact";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/form/input";
import { Label } from "@/src/components/ui/form/label";
import { Textarea } from "@/src/components/ui/form/textarea";
import { type ContactFormValues, contactSchema } from "@/src/lib/schemas/contact";

/**
 * A reusable field component to reduce JSX repetition in the contact form.
 */
function FormField({
	field,
	label,
	placeholder,
	type = "text",
	isTextArea = false,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: Tanstack Form's FieldApi has high type overhead (23+ generics).
	field: any;
	label: string;
	placeholder: string;
	type?: string;
	isTextArea?: boolean;
}) {
	const Comp = isTextArea ? Textarea : Input;

	return (
		<div className="group space-y-2.5">
			<Label
				htmlFor={field.name}
				className="portfolio-kicker block text-surface-400 transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
			>
				{label}
			</Label>
			<Comp
				id={field.name}
				name={field.name}
				// biome-ignore lint/suspicious/noExplicitAny: Input type alignment
				type={type as any}
				value={field.state.value}
				onBlur={field.handleBlur}
				// biome-ignore lint/suspicious/noExplicitAny: Event type alignment
				onChange={(e: any) => field.handleChange(e.target.value)}
				placeholder={placeholder}
				size={isTextArea ? undefined : "lg"}
				hasError={field.state.meta.isTouched && !!field.state.meta.errors.length}
			/>
			{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
				<p className="portfolio-caption font-medium text-destructive">
					{field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
				</p>
			)}
		</div>
	);
}

/**
 * Interactive contact form with TanStack Form integration.
 * Optimized for architectural simplicity and minimal JSX repetition.
 */
export function ContactForm() {
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			subject: "",
			message: "",
		} as ContactFormValues,
		onSubmit: async ({ value }) => {
			try {
				const result = await submitContactForm(value);
				if (result.success) {
					toast.success("Message Sent", {
						description: "I'll get back to you as soon as possible.",
					});
					form.reset();
				} else {
					toast.error("Failed to Send", {
						description: result.error || "Please try again later.",
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
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-10"
		>
			<div className="grid gap-10 sm:grid-cols-2">
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
				selector={(state) => [state.canSubmit, state.isSubmitting] as [boolean, boolean]}
			>
				{([canSubmit, isSubmitting]) => (
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
