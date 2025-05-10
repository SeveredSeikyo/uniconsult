"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Users, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManageFacultyPage() {
  const { currentUser } = useAuth();
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state for adding new faculty
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facultyIdInput, setFacultyIdInput] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchFaculty();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchFaculty = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/faculty');
      if (response.ok) {
        const data = await response.json();
        setFacultyList(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch faculty list.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred fetching faculty.", variant: "destructive" });
      console.error("Error fetching faculty:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, faculty_id: facultyIdInput, department }),
      });
      constcastle
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Faculty Added", description: `${data.user.name} has been added as faculty.`, variant: "default" });
        fetchFaculty(); // Refresh list
        // Reset form
        setName(''); setEmail(''); setPassword(''); setFacultyIdInput(''); setDepartment('');
      } else {
        toast({ title: "Failed to Add Faculty", description: data.error || "Could not add faculty.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      console.error("Add faculty error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (facultyUserId: number) => {
    try {
      const response = await fetch(`/api/admin/faculty/${facultyUserId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({ title: "Success", description: "Faculty member deleted." });
        fetchFaculty(); // Refresh
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error || "Could not delete faculty.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete faculty.", variant: "destructive" });
    }
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8 bg-[#2C3136] p-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Users className="mr-3 h-8 w-8 text-[#27691F]" /> Manage PLMUN Faculty Accounts
        </h1>

        <Card className="shadow-xl bg-[#2C3136] text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Add New Faculty</CardTitle>
            <CardDescription className="text-[#84878B]">
              Create an account for a new faculty member in the PLMUN Portal system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFaculty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-[#84878B]">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Jane Smith" className="bg-white text-[#2C3136] border-[#84878B]" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[#84878B]">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane.smith@example.com" className="bg-white text-[#2C3136] border-[#84878B]" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[#84878B]">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-white text-[#2C3136] border-[#84878B]" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="facultyIdInput" className="text-[#84878B]">Faculty ID</Label>
                  <Input id="facultyIdInput" value={facultyIdInput} onChange={(e) => setFacultyIdInput(e.target.value)} required placeholder="F00X" className="bg-white text-[#2C3136] border-[#84878B]" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="department" className="text-[#84878B]">Department</Label>
                  <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required placeholder="e.g., Computer Science" className="bg-white text-[#2C3136] border-[#84878B]" />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="bg-[#27691F] text-white hover:bg-[#27691F]/90 shadow-md">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Add Faculty
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xl bg-[#2C3136] text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Current Faculty Members</CardTitle>
            <CardDescription className="text-[#84878B]">
              List of all faculty members in the PLMUN Portal system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-[#27691F]" />
                <p className="ml-2 text-[#84878B]">Loading faculty list...</p>
              </div>
            ) : facultyList.length === 0 ? (
                <p className="text-[#84878B] text-center py-4">No faculty members found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Faculty ID</TableHead>
                    <TableHead className="text-white">Department</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyList.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium text-white">{faculty.name}</TableCell>
                      <TableCell className="text-[#84878B]">{faculty.email}</TableCell>
                      <TableCell className="text-[#84878B]">{faculty.faculty_id || 'N/A'}</TableCell>
                      <TableCell className="text-[#84878B]">{faculty.department || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="bg-red-900 text-white hover:bg-red-900/90 shadow-sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#2C3136] text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#84878B]">
                                Are you sure you want to delete faculty member {faculty.name}? This will also remove their status and potentially affect associated consultations. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-[#84878B] text-white hover:bg-[#84878B]/90">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFaculty(faculty.id)} className="bg-red-900 text-white hover:bg-red-900/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {facultyList.length > 0 && (
            <CardFooter className="text-sm text-[#84878B]">
              Total faculty members: {facultyList.length}
            </CardFooter>
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}