"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
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
    if (status === 'Scheduled') return 'bg-blue-900 text-white border-blue-950';
    if (status === 'Cancelled') return 'bg-red-900 text-white border-red-950';
    if (status === 'Completed') return 'bg-[#27691F] text-white border-[#27691F]/50';
    return 'bg-[#84878B] text-white border-[#84878B]/50';
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8 bg-[#2C3136] p-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <CalendarDays className="mr-3 h-8 w-8 text-[#27691F]" /> All PLMUN Portal Consultations
        </h1>

        <Card className="shadow-xl bg-[#2C3136] text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Consultation Records</CardTitle>
            <CardDescription className="text-[#84878B]">
              A comprehensive list of all consultations recorded in the PLMUN Portal system.
            </CardDescription>
            <div className="pt-4">
              <Label htmlFor="search-consultations" className="text-[#84878B]">Search Consultations</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#84878B]" />
                <Input
                  id="search-consultations"
                  placeholder="Search by student, faculty, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-[#2C3136] border-[#84878B]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-6 h-64">
                <Loader2 className="h-12 w-12 animate-spin text-[#27691F]" />
              </div>
            ) : filteredConsultations.length === 0 ? (
                <p className="text-[#84878B] text-center py-10">
                  {searchTerm ? "No consultations match your search." : "No consultations found in the system."}
                </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">ID</TableHead>
                      <TableHead className="text-white">Student</TableHead>
                      <TableHead className="text-white">Faculty</TableHead>
                      <TableHead className="text-white">Date & Time</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="min-w-[200px] text-white">Reason (if cancelled)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConsultations.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell className="text-[#84878B]">{consultation.id}</TableCell>
                        <TableCell className="font-medium text-white">{consultation.student_name}</TableCell>
                        <TableCell className="font-medium text-white">{consultation.faculty_name}</TableCell>
                        <TableCell className="text-[#84878B]">{format(new Date(consultation.datetime), "PPpp")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border whitespace-nowrap ${getStatusBadgeColor(consultation.status)}`}>
                            {consultation.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-[#84878B]">{consultation.reason || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {filteredConsultations.length > 0 && (
            <CardFooter className="text-sm text-[#84878B]">
              Displaying {filteredConsultations.length} of {consultations.length} total consultations.
            </CardFooter>
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}