"use client";

import { useState } from "react";
import { Button } from "@/components/common/button";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser/client";

export function SignOutButton() {
  const supabase = getBrowserSupabaseClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError(null);

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      setIsSigningOut(false);
      return;
    }

    window.location.replace("/sign-in");
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="w-full justify-center rounded-2xl"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Button>
      {error ? (
        <p className="text-sm text-[#F8B4A8]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
