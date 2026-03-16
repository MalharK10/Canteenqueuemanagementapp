import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Coffee, Lock, User, Loader2 } from 'lucide-react';

interface SignupProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://65.2.183.102:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.');
        setIsLoading(false);
      } else {
        onSignup();
      }
    } catch {
      setError('Network error. Please ensure the backend server is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse delay-1000" />

      <div className="z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary/10 rounded-full flex items-center justify-center transform transition-transform hover:scale-110 shadow-lg">
            <Coffee className="w-12 h-12 text-primary drop-shadow-md" />
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl transition-all duration-300">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign up to start ordering from the canteen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground/90 font-medium">Username</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    className="pl-10 bg-background/50 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/90 font-medium">Password</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background/50 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground/90 font-medium">Confirm Password</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background/50 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground border-t border-border/50 pt-4 mt-2">
            <p>Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
