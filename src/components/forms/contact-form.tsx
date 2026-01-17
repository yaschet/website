"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Spinner } from "@phosphor-icons/react";
import { contactSchema, type ContactFormValues } from "@/src/lib/schemas/contact";
import { submitContactForm } from "@/src/app/actions/contact";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";

export function ContactForm() {
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
								className="block text-xs font-bold uppercase tracking-widest text-surface-400 transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
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
								<p className="!text-[10px] font-medium uppercase tracking-wide text-destructive">
									{(field.state.meta.errors[0] as any)?.message ||
										field.state.meta.errors[0]}
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
								className="block text-xs font-bold uppercase tracking-widest text-surface-400 transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
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
								<p className="!text-[10px] font-medium uppercase tracking-wide text-destructive">
									{(field.state.meta.errors[0] as any)?.message ||
										field.state.meta.errors[0]}
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
							className="block text-xs font-bold uppercase tracking-widest text-surface-400 transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
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
							<p className="!text-[10px] font-medium uppercase tracking-wide text-destructive">
								{(field.state.meta.errors[0] as any)?.message ||
									field.state.meta.errors[0]}
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
							className="block text-xs font-bold uppercase tracking-widest text-surface-400 transition-colors group-focus-within:text-surface-900 dark:text-surface-500 dark:group-focus-within:text-surface-100"
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
							<p className="!text-[10px] font-medium uppercase tracking-wide text-destructive">
								{(field.state.meta.errors[0] as any)?.message ||
									field.state.meta.errors[0]}
							</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
				{(selectorData: any) => {
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
