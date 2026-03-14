import Link from "next/link";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { SignUpForm } from "@/components/features/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start building your Cliniva care experience in minutes."
      footer={
        <span className="text-[#222222]/70">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-[#FA8112]">
            Sign in
          </Link>
        </span>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
