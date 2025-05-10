"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';
import type { User } from '@/lib/definitions';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        login(data.user as User);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user.name}!`,
          variant: 'default',
        });
        const redirectUrl = searchParams.get('redirect') || '/dashboard';
        router.push(redirectUrl);
      } else {
        toast({
          title: 'Login Failed',
          description: data.error || 'Invalid credentials.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-[#2C3136]">
      <Card className="w-full max-w-md shadow-xl bg-[#2C3136] text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">PLMUN Portal Login</CardTitle>
          <CardDescription className="text-[#84878B]">Access your PLMUN consultation scheduling dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#84878B]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base bg-white text-[#2C3136] border-[#84878B]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#84878B]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base bg-white text-[#2C3136] border-[#84878B]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-lg py-6 bg-[#27691F] text-white hover:bg-[#27691F]/90 shadow-md" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-[#84878B]">
            Don't have an account?{' '}
            <Button 
              variant="link" 
              asChild 
              className="p-0 h-auto text-[#27691F] hover:text-[#27691F]/80"
            >
              <Link href="/register">Register here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}