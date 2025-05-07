"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState }from 'react';
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
      if(response.ok) {
        toast({title: "Success", description: "Faculty member deleted."});
        fetchFaculty(); // Refresh
      } else {
        const data = await response.json();
        toast({title: "Error", description: data.error || "Could not delete faculty.", variant: "destructive"});
      }
    } catch (error) {
      toast({title: "Error", description: "Failed to delete faculty.", variant: "destructive"});
    }
  };


  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Users className="mr-3 h-8 w-8" /> Manage Faculty Accounts
        </h1>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Faculty</CardTitle>
            <CardDescription>Create an account for a new faculty member.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFaculty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Jane Smith" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane.smith@example.com" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="facultyIdInput">Faculty ID</Label>
                  <Input id="facultyIdInput" value={facultyIdInput} onChange={(e) => setFacultyIdInput(e.target.value)} required placeholder="F00X" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required placeholder="e.g., Computer Science" />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="shadow-md">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Add Faculty
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Current Faculty Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading faculty list...</p>
              </div>
            ) : facultyList.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No faculty members found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Faculty ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyList.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium">{faculty.name}</TableCell>
                      <TableCell>{faculty.email}</TableCell>
                      <TableCell>{faculty.faculty_id || 'N/A'}</TableCell>
                      <TableCell>{faculty.department || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="shadow-sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete faculty member {faculty.name}? This will also remove their status and potentially affect associated consultations. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFaculty(faculty.id)} className="bg-destructive hover:bg-destructive/90">
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
            <CardFooter className="text-sm text-muted-foreground">
                Total faculty members: {facultyList.length}
            </CardFooter>
           )}
        </Card>
      </div>
    </AuthGuard>
  );
}
