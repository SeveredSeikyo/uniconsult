"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import type { FacultyStatus, Consultation, FacultyStatusOption, User } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Loader2, Users, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

export default function BookConsultationPage() {
  const { currentUser } = useAuth();
  const [facultyList, setFacultyList] = useState<FacultyStatus[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyStatus | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFaculty = async () => {
      setIsLoadingFaculty(true);
      try {
        const response = await fetch('/api/faculty/status');
        if (response.ok) {
          const data: FacultyStatus[] = await response.json();
          setFacultyList(data);
        } else {
          toast({ title: "Error", description: "Failed to fetch faculty list.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching faculty.", variant: "destructive" });
        console.error("Error fetching faculty:", error);
      } finally {
        setIsLoadingFaculty(false);
      }
    };
    fetchFaculty();
  }, [toast]);

  const handleBookConsultation = async () => {
    if (!currentUser || !selectedFaculty || !selectedDate || !selectedTime) {
      toast({ title: "Missing Information", description: "Please select faculty, date, and time.", variant: "destructive" });
      return;
    }

    setIsBooking(true);
    const dateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    dateTime.setHours(hours, minutes, 0, 0);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.id,
          faculty_id: selectedFaculty.faculty_id,
          datetime: dateTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "Booking Successful!", description: `Consultation with ${selectedFaculty.faculty_name} on ${format(dateTime, "PPP p")} is booked.`, variant: "default" });
        setSelectedFaculty(null);
        setSelectedDate(undefined);
        setSelectedTime('');
      } else {
        toast({ title: "Booking Failed", description: data.error || "Could not book consultation.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      console.error("Booking error:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const getStatusIcon = (status: FacultyStatusOption) => {
    switch (status) {
      case 'Available': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'In Class': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'Offline': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };
  
  const getStatusColor = (status: FacultyStatusOption) => {
    switch (status) {
      case 'Available': return "border-green-500 bg-green-50";
      case 'In Class': return "border-orange-500 bg-orange-50";
      case 'Offline': return "border-red-500 bg-red-50";
      default: return "border-gray-300";
    }
  };


  return (
    <AuthGuard allowedRoles={['student']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Users className="mr-3 h-8 w-8" /> Book a Consultation
        </h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Faculty Availability</h2>
          {isLoadingFaculty ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-3 text-lg">Loading faculty...</p>
            </div>
          ) : facultyList.length === 0 ? (
             <p className="text-muted-foreground">No faculty members found or available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facultyList.map((faculty) => (
                <Card 
                  key={faculty.id} 
                  className={`shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer ${selectedFaculty?.id === faculty.id ? 'ring-2 ring-primary' : ''} ${getStatusColor(faculty.status)}`}
                  onClick={() => faculty.status === 'Available' ? setSelectedFaculty(faculty) : toast({title: "Faculty Not Available", description: `${faculty.faculty_name} is currently ${faculty.status}.`, variant: "destructive"})}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{faculty.faculty_name}</CardTitle>
                    <CardDescription>Last updated: {format(new Date(faculty.last_updated), "PPp")}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-2">
                    {getStatusIcon(faculty.status)}
                    <span className={`font-medium ${
                      faculty.status === 'Available' ? 'text-green-600' :
                      faculty.status === 'In Class' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {faculty.status}
                    </span>
                  </CardContent>
                  {faculty.status !== 'Available' && (
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">Cannot book when not available.</p>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {selectedFaculty && selectedFaculty.status === 'Available' && (
          <Card className="shadow-xl border-primary">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Schedule with {selectedFaculty.faculty_name}</CardTitle>
              <CardDescription>Select a date and time for your consultation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="date-picker">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || date.getDay() === 0 || date.getDay() === 6} // Disable past dates, Sundays, Saturdays
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="time-slot">Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger id="time-slot" className="w-full">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleBookConsultation} 
                disabled={isBooking || !selectedDate || !selectedTime}
                className="w-full md:w-auto shadow-md"
                size="lg"
              >
                {isBooking ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                Book Consultation
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
