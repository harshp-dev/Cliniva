import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { SignInForm } from "@/components/features/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage appointments and patient care."
      footer={
        <span className="text-[#222222]/70">
          New to Cliniva?{" "}
          <Link href="/sign-up" className="font-medium text-[#FA8112]">
            Create an account
          </Link>
        </span>
      }
    >
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
