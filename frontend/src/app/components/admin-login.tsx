import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Shield, Lock, User, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBackToUser: () => void;
}

export function AdminLogin({ onLogin, onBackToUser }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://http://65.2.183.102:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Invalid admin credentials.');
      } else {
        onLogin();
      }
    } catch {
      setError('Network error. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/15 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/15 blur-[100px] animate-pulse delay-1000" />

      <div className="z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-destructive/10 rounded-full flex items-center justify-center transform transition-transform hover:scale-110 shadow-lg">
            <Shield className="w-12 h-12 text-destructive drop-shadow-md" />
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl transition-all duration-300">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to manage the canteen menu
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
                <Label htmlFor="admin-username" className="text-foreground/90 font-medium">
                  Username
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-destructive transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <Input
                    id="admin-username"
                    type="text"
                    placeholder="Admin username"
                    className="pl-10 bg-background/50 border-input hover:border-destructive/50 focus:border-destructive transition-colors"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-foreground/90 font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-destructive transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background/50 border-input hover:border-destructive/50 focus:border-destructive transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all bg-destructive hover:bg-destructive/90"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In as Admin'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={onBackToUser}
            >
              Back to user login
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
