import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Coffee, Lock, User, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
  onSwitchToAdmin?: () => void;
}

export function Login({ onLogin, onSwitchToSignup, onSwitchToAdmin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please try again.');
        setIsLoading(false);
      } else {
        onLogin();
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access the canteen
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
                    placeholder="Enter your username"
                    className="pl-10 bg-background/50 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/90 font-medium">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div>
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
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 text-sm text-muted-foreground border-t border-border/50 pt-4 mt-2">
            <p>Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
            {onSwitchToAdmin && (
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                Admin Login
              </button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
