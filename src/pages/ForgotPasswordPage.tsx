import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // du kannst das später anpassen
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4 bg-stone-200 dark:bg-stone-950",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-md flex flex-col border-none shadow-none bg-stone-200 dark:bg-stone-950">
        <CardHeader>
          <CardTitle className="text-3xl p-4">Reset Your Password</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-center p-4">
          <img src={logo} alt="TokTok Logo" className="w-[25px] h-[25px]" />
        </div>
        <CardContent>
          {success ? (
            <p className="text-green-600 text-sm">
              Check your email for a password reset link.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-13"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="text-lg mt-2 h-13 w-full bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)]"
                disabled={isLoading}
              >
                {isLoading ? "Sending email..." : "Reset Password"}
              </Button>

              <div className="mt-4 text-center text-sm text-gray-500">
                Remember your password?{" "}
                <a
                  href="/signin"
                  className="underline underline-offset-4 text-[var(--color-button-pink)]"
                >
                  Sign In
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
