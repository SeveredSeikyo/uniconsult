"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import type { Consultation, FacultyStatus, User } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, BarChart3, FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label'; // Added import for Label

type ReportType = "consultations" | "faculty_availability";

interface ReportData {
  consultations: Consultation[];
  facultyStatus: FacultyStatus[];
}

export default function ReportsPage() {
  const { currentUser } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({ consultations: [], facultyStatus: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReportType>("consultations");
  const { toast } = useToast();

  // Filters
  const [facultyFilter, setFacultyFilter] = useState<string>("all"); // faculty user ID or "all"
  const [statusFilter, setStatusFilter] = useState<string>("all"); // consultation status or "all"
  const [facultyList, setFacultyList] = useState<User[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [consultationsRes, facultyStatusRes, facultyListRes] = await Promise.all([
        fetch('/api/consultations?all=true'), // Fetch all consultations for admin
        fetch('/api/faculty/status'),
        fetch('/api/admin/faculty') // To populate faculty filter dropdown
      ]);

      const consultationsData = await consultationsRes.json();
      const facultyStatusData = await facultyStatusRes.json();
      const facultyListData = await facultyListRes.json();

      if (consultationsRes.ok && facultyStatusRes.ok && facultyListRes.ok) {
        setReportData({ consultations: consultationsData, facultyStatus: facultyStatusData });
        setFacultyList(facultyListData);
      } else {
        toast({ title: "Error", description: "Failed to fetch report data.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred fetching report data.", variant: "destructive" });
      console.error("Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredConsultations = reportData.consultations.filter(c => {
    const facultyMatch = facultyFilter === "all" || c.faculty_id === parseInt(facultyFilter);
    const statusMatch = statusFilter === "all" || c.status === statusFilter;
    return facultyMatch && statusMatch;
  });

  const exportToCSV = (type: ReportType) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let dataToExport;
    let headers: string[];

    if (type === "consultations") {
      headers = ["ID", "Student Name", "Faculty Name", "Date & Time", "Status", "Reason for Cancellation"];
      dataToExport = filteredConsultations.map(c => [
        c.id,
        c.student_name,
        c.faculty_name,
        format(new Date(c.datetime), "yyyy-MM-dd HH:mm"),
        c.status,
        c.reason || ""
      ]);
    } else { // faculty_availability
      headers = ["Faculty Name", "Status", "Last Updated"];
      dataToExport = reportData.facultyStatus.map(fs => [
        fs.faculty_name,
        fs.status,
        format(new Date(fs.last_updated), "yyyy-MM-dd HH:mm")
      ]);
    }

    csvContent += headers.join(",") + "\r\n";
    dataToExport.forEach(rowArray => {
      let row = rowArray.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exported to CSV", description: `${type} report has been downloaded.`, variant: "default" });
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold text-primary flex items-center mb-4 md:mb-0">
            <BarChart3 className="mr-3 h-8 w-8" /> UniConsult Reports
          </h1>
          <Button onClick={() => exportToCSV(activeTab)} disabled={isLoading} className="shadow-md">
            <Download className="mr-2 h-4 w-4" /> Export Current View to CSV
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportType)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="consultations">Consultations Report</TabsTrigger>
            <TabsTrigger value="faculty_availability">Faculty Availability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="consultations" className="mt-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Consultations Summary</CardTitle>
                <CardDescription>Overview of all scheduled, cancelled, and completed consultations.</CardDescription>
                 <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="faculty-filter">Filter by Faculty</Label>
                        <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                            <SelectTrigger id="faculty-filter">
                                <SelectValue placeholder="All Faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Faculty</SelectItem>
                                {facultyList.map(f => (
                                    <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-1">
                         <Label htmlFor="status-filter">Filter by Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id="status-filter">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-6 h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : filteredConsultations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10">No consultations match current filters.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason (if cancelled)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConsultations.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.id}</TableCell>
                          <TableCell>{c.student_name}</TableCell>
                          <TableCell>{c.faculty_name}</TableCell>
                          <TableCell>{format(new Date(c.datetime), "PPpp")}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                c.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                c.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                                c.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-300' :
                                'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                                {c.status}
                            </span>
                          </TableCell>
                          <TableCell>{c.reason || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty_availability" className="mt-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Faculty Availability Report</CardTitle>
                <CardDescription>Current status of all faculty members.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-6 h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : reportData.facultyStatus.length === 0 ? (
                     <p className="text-muted-foreground text-center py-10">No faculty status data available.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.facultyStatus.map((fs) => (
                        <TableRow key={fs.id}>
                          <TableCell className="font-medium">{fs.faculty_name}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                fs.status === 'Available' ? 'bg-green-100 text-green-700 border-green-300' :
                                fs.status === 'In Class' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                                fs.status === 'Offline' ? 'bg-red-100 text-red-700 border-red-300' :
                                'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                                {fs.status}
                            </span>
                          </TableCell>
                          <TableCell>{format(new Date(fs.last_updated), "PPpp")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}

// Helper for table display if needed or direct use of shadcn table.
