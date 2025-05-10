"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';
import type { User, UserRole } from '@/lib/definitions';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState(''); // For faculty
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const userData: Partial<User> & {password: string} = {
      name,
      email,
      password,
      role,
    };

    if (role === 'student' && studentId) {
      userData.student_id = studentId;
    } else if (role === 'faculty' && department) {
      userData.department = department;
      // Faculty ID might be assigned upon admin approval or system generation. For now, let's omit direct input.
    }

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Registration Successful',
          description: `Welcome, ${data.user.name}! Please log in.`,
          variant: 'default',
        });
        router.push('/login'); // Redirect to login after registration
      } else {
        toast({
          title: 'Registration Failed',
          description: data.error || 'Could not create account.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-[#2C3136] p-8 min-h-screen">
      <Card className="w-full max-w-lg shadow-xl bg-[#2C3136] text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Create PLMUN Portal Account</CardTitle>
          <CardDescription className="text-[#84878B]">
            Join the PLMUN Portal to schedule and manage consultations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#84878B]">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-white text-[#2C3136] border-[#84878B]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#84878B]">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-white text-[#2C3136] border-[#84878B]"
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
                className="bg-white text-[#2C3136] border-[#84878B]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#84878B]">I am a...</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role" className="bg-white text-[#2C3136] border-[#84878B]">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#2C3136]">
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  {/* Admin role is typically not self-registered */}
                </SelectContent>
              </Select>
            </div>

            {role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-[#84878B]">Student ID</Label>
                <Input 
                  id="studentId" 
                  placeholder="S123456" 
                  value={studentId} 
                  onChange={(e) => setStudentId(e.target.value)} 
                  required={role === 'student'} 
                  className="bg-white text-[#2C3136] border-[#84878B]"
                />
              </div>
            )}

            {role === 'faculty' && (
              <div className="space-y-2">
                <Label htmlFor="department" className="text-[#84878B]">Department</Label>
                <Input 
                  id="department" 
                  placeholder="e.g., Computer Science" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  required={role === 'faculty'}
                  className="bg-white text-[#2C3136] border-[#84878B]"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full text-lg py-6 bg-[#27691F] text-white hover:bg-[#27691F]/90 shadow-md" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
              Register
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-[#84878B]">
            Already have an account?{' '}
            <Button 
              variant="link" 
              asChild 
              className="p-0 h-auto text-[#27691F] hover:underline"
            >
              <Link href="/login">Login here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}