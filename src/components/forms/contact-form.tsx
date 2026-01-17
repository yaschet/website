"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { toast } from "sonner";
import { ArrowRight, Spinner } from "@phosphor-icons/react";
import {
  contactSchema,
  type ContactFormValues,
} from "@/src/lib/schemas/contact";
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
        toast.success("Message sent successfully!", {
          description: "I'll get back to you as soon as possible.",
        });
        form.reset();
      } else {
        toast.error("Error", {
          description: data.error || "Failed to send message.",
        });
      }
    },
    onError: () => {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
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
      className="space-y-8"
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => (
            <div className="space-y-3">
              <Label
                htmlFor={field.name}
                className="text-xs font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500"
              >
                Full Name
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="John Doe"
                hasError={
                  field.state.meta.isTouched && !!field.state.meta.errors.length
                }
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <p className="text-[10px] font-medium uppercase tracking-tight text-destructive">
                    {(field.state.meta.errors[0] as any)?.message ||
                      field.state.meta.errors[0]}
                  </p>
                )}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="space-y-3">
              <Label
                htmlFor={field.name}
                className="text-xs font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500"
              >
                Email Address
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="john@example.com"
                hasError={
                  field.state.meta.isTouched && !!field.state.meta.errors.length
                }
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <p className="text-[10px] font-medium uppercase tracking-tight text-destructive">
                    {(field.state.meta.errors[0] as any)?.message ||
                      field.state.meta.errors[0]}
                  </p>
                )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="subject">
        {(field) => (
          <div className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-xs font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500"
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
              hasError={
                field.state.meta.isTouched && !!field.state.meta.errors.length
              }
            />
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-[10px] font-medium uppercase tracking-tight text-destructive">
                  {(field.state.meta.errors[0] as any)?.message ||
                    field.state.meta.errors[0]}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Field name="message">
        {(field) => (
          <div className="space-y-3">
            <Label
              htmlFor={field.name}
              className="text-xs font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500"
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
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-[10px] font-medium uppercase tracking-tight text-destructive">
                  {(field.state.meta.errors[0] as any)?.message ||
                    field.state.meta.errors[0]}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {(selectorData: any) => {
          const [canSubmit, isSubmitting] = selectorData;
          return (
            <Button
              type="submit"
              size="lg"
              variant="solid"
              color="primary"
              disabled={!canSubmit || isSubmitting || mutation.isPending}
              className="w-full sm:w-auto"
            >
              {isSubmitting || mutation.isPending ? (
                <>
                  Sending...
                  <Spinner className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  Send Message
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
