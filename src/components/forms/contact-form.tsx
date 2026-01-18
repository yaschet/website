"use client";

import { ArrowRight, Spinner } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitContactForm } from "@/src/app/actions/contact";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { type ContactFormValues, contactSchema } from "@/src/lib/schemas/contact";

/**
 * Interactive contact form with TanStack Form integration.
 *
 * @remarks
 * Features real-time validation, server action integration, and
 * optimistic UI updates. Uses standard form field components.
 *
 * @public
 */
export function ContactForm() {
	const getErrorMessage = (error: unknown): string => {
		if (typeof error === "string") return error;
		if (error && typeof error === "object" && "message" in error) {
			return String((error as { message: unknown }).message);
		}
		return "Invalid input";
	};

	const mutation = useMutation({
		mutationFn: submitContactForm,
		onSuccess: (data: { success: boolean; error?: string }) => {
			if (data.success) {
				toast.success("Message Transmitted", {
					description: "Systems confirmed receipt. Awaiting engineering response.",
				});
				form.reset();
			} else {
				toast.error("Transmission Failed", {
					description: data.error || "Uplink interrupted. Please retry.",
				});
			}
		},
		onError: () => {
			toast.error("System Error", {
				description: "An unexpected exception occurred in the communication stack.",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			subject: "",
			message: "",
		} as ContactFormValues,
		onSubmit: async ({ value }) => {
			mutation.mutate(value);
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
			<div className="grid gap-8 sm:grid-cols-2">
				{/* Name Field */}
				<form.Field name="name">
					{(field) => (
						<div className="group space-y-2.5">
							<Label
								htmlFor={field.name}
								className="block font-bold text-surface-400 text-xs uppercase tracking-widest transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
							>
								Name
							</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="John Doe"
								size="lg"
								hasError={
									field.state.meta.isTouched && !!field.state.meta.errors.length
								}
							/>
							{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
								<p className="!text-[10px] font-medium text-destructive uppercase tracking-wide">
									{getErrorMessage(field.state.meta.errors[0])}
								</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Email Field */}
				<form.Field name="email">
					{(field) => (
						<div className="group space-y-2.5">
							<Label
								htmlFor={field.name}
								className="block font-bold text-surface-400 text-xs uppercase tracking-widest transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
							>
								Email
							</Label>
							<Input
								id={field.name}
								name={field.name}
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="email@domain.com"
								size="lg"
								hasError={
									field.state.meta.isTouched && !!field.state.meta.errors.length
								}
							/>
							{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
								<p className="!text-[10px] font-medium text-destructive uppercase tracking-wide">
									{getErrorMessage(field.state.meta.errors[0])}
								</p>
							)}
						</div>
					)}
				</form.Field>
			</div>

			{/* Subject Field */}
			<form.Field name="subject">
				{(field) => (
					<div className="group space-y-2.5">
						<Label
							htmlFor={field.name}
							className="block font-bold text-surface-400 text-xs uppercase tracking-widest transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
						>
							Subject
						</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Project Inquiry"
							size="lg"
							hasError={
								field.state.meta.isTouched && !!field.state.meta.errors.length
							}
						/>
						{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
							<p className="!text-[10px] font-medium text-destructive uppercase tracking-wide">
								{getErrorMessage(field.state.meta.errors[0])}
							</p>
						)}
					</div>
				)}
			</form.Field>

			{/* Message Field */}
			<form.Field name="message">
				{(field) => (
					<div className="group space-y-2.5">
						<Label
							htmlFor={field.name}
							className="block font-bold text-surface-400 text-xs uppercase tracking-widest transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
						>
							Message
						</Label>
						<Textarea
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Tell me about your project..."
							hasError={
								field.state.meta.isTouched && !!field.state.meta.errors.length
							}
						/>
						{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
							<p className="!text-[10px] font-medium text-destructive uppercase tracking-wide">
								{getErrorMessage(field.state.meta.errors[0])}
							</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Subscribe
				// biome-ignore lint/suspicious/noExplicitAny: library type mismatch
				selector={(state: any) =>
					[state.canSubmit, state.isSubmitting] as [boolean, boolean]
				}
			>
				{(selectorData: [boolean, boolean]) => {
					const [canSubmit, isSubmitting] = selectorData;
					return (
						<Button
							type="submit"
							size="xl"
							variant="solid"
							color="primary"
							disabled={!canSubmit || isSubmitting || mutation.isPending}
							className="w-full sm:w-auto"
						>
							{isSubmitting || mutation.isPending ? (
								<>
									TRANSMITTING...
									<Spinner className="size-4 animate-spin" />
								</>
							) : (
								<>
									SEND MESSAGE
									<ArrowRight className="size-4" weight="bold" />
								</>
							)}
						</Button>
					);
				}}
			</form.Subscribe>
		</form>
	);
}
