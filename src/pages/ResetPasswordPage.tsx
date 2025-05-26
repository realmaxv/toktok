import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.svg";
import { LockKeyhole } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";

export default function ResetPasswordPage() {
  const { setSession } = useAuthContext();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setError("An error occurred while checking the session.");
        return;
      }
      if (!data.session) {
        setError("No active session found. Please request a new reset link.");
      } else {
        setSession(data.session);
      }
    }
    checkSession();
  }, [setSession]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-200 dark:bg-stone-950">
      <Card className="w-full max-w-md flex flex-col border-none shadow-none bg-stone-200 dark:bg-stone-950">
        <CardHeader>
          <CardTitle className="text-3xl p-4">Reset Password</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-center p-4">
          <img src={logo} alt="TokTok Logo" className="w-[25px] h-[25px]" />
        </div>
        <CardContent>
          <form onSubmit={handleReset} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockKeyhole className="w-4 h-4 text-muted-foreground" />
                </span>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pl-10 h-13"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && (
              <p className="text-sm text-green-500">
                Password updated! Redirecting to Sign In...
              </p>
            )}

            <Button
              type="submit"
              className="text-lg mt-2 h-13 w-full bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)]"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Set New Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
