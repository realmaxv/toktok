import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.svg';
import { Mail, LockKeyhole } from 'lucide-react';

export default function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        <Card className="w-full max-w-md border-none">
          <CardHeader>
            <CardTitle className="text-2xl">
              Account created! Welcome to TokTok.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please check your email to verify your account before logging in.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md flex flex-col border-none shadow-none bg-stone-200 dark:bg-stone-950">
          <CardHeader>
            <CardTitle className="text-3xl p-4">
              Create Your <br />
              Account
            </CardTitle>
          </CardHeader>
          <div className="flex items-center justify-center p-4">
            <img src={logo} alt="TokTok Logo" className="w-25 h-25" />
          </div>
          <CardContent>
            <form onSubmit={handleSignUp} className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" />
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 bg-transparent">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-Mail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-13"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" />
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

              <div className="mt-4 text-center text-sm text-gray-500 ">
                Already have an account?{' '}
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
