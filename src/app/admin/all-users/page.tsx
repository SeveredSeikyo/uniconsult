"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
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

  const getRoleBadgeColor = (role: User['role']) => {
    if (role === 'admin') return 'bg-purple-900 text-white border-purple-950';
    if (role === 'faculty') return 'bg-blue-900 text-white border-blue-950';
    return 'bg-[#27691F] text-white border-[#27691F]/50'; // student
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8 bg-[#2C3136] p-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Users className="mr-3 h-8 w-8 text-[#27691F]" /> All PLMUN Portal Users
        </h1>

        <Card className="shadow-xl bg-[#2C3136] text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-white">User Overview</CardTitle>
            <CardDescription className="text-[#84878B]">
              A list of all users currently in the PLMUN Portal system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-[#27691F]" />
                <p className="ml-2 text-[#84878B]">Loading user list...</p>
              </div>
            ) : userList.length === 0 ? (
                <p className="text-[#84878B] text-center py-4">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">ID</TableHead>
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Email</TableHead>
                      <TableHead className="text-white">Role</TableHead>
                      <TableHead className="text-white">Student/Faculty ID</TableHead>
                      <TableHead className="text-white">Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userList.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-[#84878B]">{user.id}</TableCell>
                        <TableCell className="font-medium text-white">{user.name}</TableCell>
                        <TableCell className="text-[#84878B]">{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#84878B]">{user.student_id || user.faculty_id || 'N/A'}</TableCell>
                        <TableCell className="text-[#84878B]">{user.department || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {userList.length > 0 && (
            <CardFooter className="text-sm text-[#84878B]">
              Total users: {userList.length}
            </CardFooter>
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}