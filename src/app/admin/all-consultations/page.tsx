"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState }from 'react';
import type { Consultation } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AllConsultationsPage() {
  const { currentUser } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchAllConsultations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchAllConsultations = async () => {
    setIsLoading(true);
    try {
      // Using the existing consultations endpoint with all=true
      const response = await fetch('/api/consultations?all=true');
      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch consultations list.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred fetching consultations.", variant: "destructive" });
      console.error("Error fetching consultations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(consultation => 
    (consultation.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (consultation.faculty_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (consultation.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: Consultation['status']) => {
    if (status === 'Scheduled') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700 border-red-300';
    if (status === 'Completed') return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <CalendarDays className="mr-3 h-8 w-8" /> All System Consultations
        </h1>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Consultation Records</CardTitle>
            <CardDescription>A comprehensive list of all consultations recorded in the UniConsult system.</CardDescription>
            <div className="pt-4">
              <Label htmlFor="search-consultations">Search Consultations</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search-consultations"
                  placeholder="Search by student, faculty, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-6 h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : filteredConsultations.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">
                  {searchTerm ? "No consultations match your search." : "No consultations found in the system."}
                </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-[200px]">Reason (if cancelled)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConsultations.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell>{consultation.id}</TableCell>
                        <TableCell className="font-medium">{consultation.student_name}</TableCell>
                        <TableCell className="font-medium">{consultation.faculty_name}</TableCell>
                        <TableCell>{format(new Date(consultation.datetime), "PPpp")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border whitespace-nowrap ${getStatusBadgeColor(consultation.status)}`}>
                            {consultation.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{consultation.reason || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
           {filteredConsultations.length > 0 && (
            <CardFooter className="text-sm text-muted-foreground">
                Displaying {filteredConsultations.length} of {consultations.length} total consultations.
            </CardFooter>
           )}
        </Card>
      </div>
    </AuthGuard>
  );
}

