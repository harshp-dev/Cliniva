"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/button";
import { FormField } from "@/components/forms/form-field";
import { TextInput } from "@/components/forms/text-input";
import { getAuthErrorMessage } from "@/lib/auth/get-auth-error-message";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser/client";
import { getProfileRole } from "@/lib/services/profiles/get-profile-role";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";

export function SignInForm() {
  const searchParams = useSearchParams();
  const supabase = getBrowserSupabaseClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInInput) => {
    setFormError(null);

    console.log("[auth] sign-in submit", {
      email: values.email,
      hasPassword: Boolean(values.password),
      redirect: searchParams.get("redirect"),
    });

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      console.log("[auth] sign-in error", {
        message: error.message,
        status: error.status,
      });
      setFormError(getAuthErrorMessage(error.message));
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("[auth] sign-in session fetched", {
      hasSession: Boolean(session),
      userId: session?.user.id,
    });

    const user = session?.user;
    let fallbackPath = "/patient/dashboard";

    if (user) {
      const role = await getProfileRole(supabase, user.id);
      console.log("[auth] sign-in role resolved", { role });
      if (role === "provider") {
        fallbackPath = "/provider/dashboard";
      } else if (role === "admin") {
        fallbackPath = "/admin/dashboard";
      }
    }

    const redirectPath = searchParams.get("redirect") ?? fallbackPath;

    console.log("[auth] sign-in redirecting", {
      redirectPath,
      cookieEnabled: navigator.cookieEnabled,
    });

    window.location.replace(redirectPath);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
      >
        <TextInput
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          hasError={Boolean(errors.password)}
          {...register("password")}
        />
      </FormField>

      {formError ? (
        <div className="rounded-lg border border-[#B42318]/40 bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">
          {formError}
        </div>
      ) : null}

      <Button type="submit" className="w-full justify-center" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
