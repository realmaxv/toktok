import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { Mail, LockKeyhole } from "lucide-react";


export default function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) throw error;

      setSuccess(true);

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4 bg-stone-200 dark:bg-stone-950',
        className
      )}
      {...props}
    >

      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Thank you for signing up!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please check your email to confirm your account before signing in.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md flex flex-col border-none shadow-none bg-stone-200 dark:bg-stone-950">
          <CardHeader>
            <CardTitle className="text-3xl p-4">Create Your Account</CardTitle>
          </CardHeader>
          <div className="flex items-center justify-center p-4">
            <img src={logo} alt="TokTok Logo" className="w-[25px] h-[25px]" />
          </div>
          <CardContent>
            <form onSubmit={handleSignUp} className="flex flex-col gap-6">
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

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockKeyhole className="w-4 h-4 text-muted-foreground" />
                  </span>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Creating an account...' : 'Sign up'}
            </Button>

            <div className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <a
                href="/signin"
                className="underline underline-offset-4 text-[var(--color-button-pink)]"
              <Button
                type="submit"
                className="text-lg mt-2 h-13 w-full bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)]"
                disabled={isLoading}

              >
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>

              <div className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <a
                  href="/signin"
                  className="underline underline-offset-4 text-[var(--color-button-pink)]"
                >
                  Login
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
