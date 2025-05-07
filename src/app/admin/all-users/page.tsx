"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState }from 'react';
import type { User } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users } from 'lucide-react';

export default function AllUsersPage() {
  const { currentUser } = useAuth();
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchAllUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUserList(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch user list.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred fetching users.", variant: "destructive" });
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Users className="mr-3 h-8 w-8" /> All Registered Users
        </h1>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">User Overview</CardTitle>
            <CardDescription>A list of all users currently in the UniConsult system.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading user list...</p>
              </div>
            ) : userList.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Student/Faculty ID</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userList.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                           <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                                user.role === 'faculty' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                'bg-green-100 text-green-700 border-green-300' // student
                            }`}>
                                {user.role}
                            </span>
                        </TableCell>
                        <TableCell>{user.student_id || user.faculty_id || 'N/A'}</TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
           {userList.length > 0 && (
            <CardFooter className="text-sm text-muted-foreground">
                Total users: {userList.length}
            </CardFooter>
           )}
        </Card>
      </div>
    </AuthGuard>
  );
}
