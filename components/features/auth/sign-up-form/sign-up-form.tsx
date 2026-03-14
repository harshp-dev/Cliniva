"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/button";
import { FormField } from "@/components/forms/form-field";
import { TextInput } from "@/components/forms/text-input";
import { SelectField } from "@/components/forms/select-field";
import { getAuthErrorMessage } from "@/lib/auth/get-auth-error-message";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser/client";
import { createProfile } from "@/lib/services/profiles/create-profile";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

export function SignUpForm() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "patient",
    },
  });

  const onSubmit = async (values: SignUpInput) => {
    const redirectPath =
      values.role === "provider" ? "/provider/dashboard" : "/patient/dashboard";
    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`
        : undefined;

    setFormError(null);
    setInfoMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: values.role,
          phone: values.phone || null,
        },
        emailRedirectTo,
      },
    });

    if (error) {
      setFormError(getAuthErrorMessage(error.message));
      return;
    }

    if (data.user && data.session) {
      try {
        await createProfile(supabase, {
          id: data.user.id,
          role: values.role,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone || null,
        });
      } catch {
        setFormError("Account created, but profile setup failed. Please contact support.");
        return;
      }

      router.replace(redirectPath);
      return;
    }

    setInfoMessage(
      "Account created. Please check your email to confirm your address before signing in."
    );
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Full name"
        htmlFor="fullName"
        error={errors.fullName?.message}
      >
        <TextInput
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Full name"
          hasError={Boolean(errors.fullName)}
          {...register("fullName")}
        />
      </FormField>

      <FormField
        label="Email"
        htmlFor="email"
        error={errors.email?.message}
      >
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@cliniva.com"
          hasError={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <FormField
        label="Phone (optional)"
        htmlFor="phone"
        error={errors.phone?.message}
      >
        <TextInput
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          hasError={Boolean(errors.phone)}
          {...register("phone")}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
        hint="Use at least 8 characters."
      >
        <TextInput
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          hasError={Boolean(errors.password)}
          {...register("password")}
        />
      </FormField>

      <FormField label="Role" htmlFor="role" error={errors.role?.message}>
        <SelectField id="role" hasError={Boolean(errors.role)} {...register("role")}>
          <option value="patient">Patient</option>
          <option value="provider">Provider</option>
        </SelectField>
      </FormField>

      {formError ? (
        <div className="rounded-lg border border-[#B42318]/40 bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">
          {formError}
        </div>
      ) : null}

      {infoMessage ? (
        <div className="rounded-lg border border-[#FA8112]/30 bg-[#FAF3E1] px-3 py-2 text-sm text-[#222222]">
          {infoMessage}
        </div>
      ) : null}

      <Button type="submit" className="w-full justify-center" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
