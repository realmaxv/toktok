import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { Mail, LockKeyhole } from "lucide-react";

export default function SignIn({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { session } = useAuthContext();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setError(
          "Your email is not verified. Please check your inbox and verify your account."
        );
        return;
      }

      console.log("Login success, user:", data.user);
      navigate("/home");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during login"
      );
      console.log("Login failed:", error);
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
          <CardTitle className="text-3xl p-4">Sign In to TokTok</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-center p-4">
          <img src={logo} alt="TokTok Logo" className="w-[25px] h-[25px]" />
        </div>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
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

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockKeyhole className="w-4 h-4 text-muted-foreground" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-4 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="underline underline-offset-4 text-[var(--color-button-pink)]"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
