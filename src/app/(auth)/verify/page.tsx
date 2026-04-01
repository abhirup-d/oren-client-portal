"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Verifying...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
