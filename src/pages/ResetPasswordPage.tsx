
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
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
      <Card className="w-full max-w-md flex flex-col text-center border-none shadow-none bg-stone-200 dark:bg-stone-950">
        <CardHeader>
          <CardTitle className="text-3xl p-4">Set New Password</CardTitle>
        </CardHeader>

        <div className="flex items-center justify-center p-4">
          <img src={logo} alt="TokTok Logo" className="w-25 h-25" />
        </div>

        <CardContent>
          {success ? (
            <p className="text-[var(--color-button-pink) text-sm">
              Passwort erfolgreich geändert. Du wirst gleich weitergeleitet...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </span>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Neues Passwort"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {isLoading ? "Speichern..." : "Passwort speichern"}
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
