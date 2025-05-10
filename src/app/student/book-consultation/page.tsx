"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import type { FacultyStatus, FacultyStatusOption } from '@/lib/definitions';
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
      case 'Available': return <CheckCircle className="h-5 w-5 text-[#27691F]" />;
      case 'In Class': return <Clock className="h-5 w-5 text-orange-900" />;
      case 'Offline': return <XCircle className="h-5 w-5 text-red-900" />;
      default: return null;
    }
  };
  
  const getStatusColor = (status: FacultyStatusOption) => {
    switch (status) {
      case 'Available': return "bg-[#27691F]/10 border-[#27691F]/50";
      case 'In Class': return "bg-orange-900/10 border-orange-950";
      case 'Offline': return "bg-red-900/10 border-red-950";
      default: return "bg-[#84878B]/10 border-[#84878B]/50";
    }
  };

  const getStatusTextColor = (status: FacultyStatusOption) => {
    switch (status) {
      case 'Available': return "text-[#27691F]";
      case 'In Class': return "text-orange-900";
      case 'Offline': return "text-red-900";
      default: return "text-[#84878B]";
    }
  };

  return (
    <AuthGuard allowedRoles={['student']}>
      <div className="space-y-8 bg-[#2C3136] p-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Users className="mr-3 h-8 w-8 text-[#27691F]" /> Book a PLMUN Portal Consultation
        </h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Faculty Availability</h2>
          {isLoadingFaculty ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-10 w-10 animate-spin text-[#27691F]" />
              <p className="ml-3 text-lg text-[#84878B]">Loading faculty...</p>
            </div>
          ) : facultyList.length === 0 ? (
            <p className="text-[#84878B]">No faculty members found or available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facultyList.map((faculty) => (
                <Card 
                  key={faculty.id} 
                  className={`shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-[#2C3136] text-white ${selectedFaculty?.id === faculty.id ? 'ring-2 ring-[#27691F]' : ''} ${getStatusColor(faculty.status)}`}
                  onClick={() => faculty.status === 'Available' ? setSelectedFaculty(faculty) : toast({title: "Faculty Not Available", description: `${faculty.faculty_name} is currently ${faculty.status}.`, variant: "destructive"})}
                >
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{faculty.faculty_name}</CardTitle>
                    <CardDescription className="text-[#84878B]">
                      Last updated: {format(new Date(faculty.last_updated), "PPp")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-2">
                    {getStatusIcon(faculty.status)}
                    <span className={`font-medium ${getStatusTextColor(faculty.status)}`}>
                      {faculty.status}
                    </span>
                  </CardContent>
                  {faculty.status !== 'Available' && (
                    <CardFooter>
                      <p className="text-xs text-[#84878B]">Cannot book when not available.</p>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {selectedFaculty && selectedFaculty.status === 'Available' && (
          <Card className="shadow-xl bg-[#2C3136] border-[#27691F] text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-[#27691F]">Schedule with {selectedFaculty.faculty_name}</CardTitle>
              <CardDescription className="text-[#84878B]">
                Select a date and time for your consultation in the PLMUN Portal system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="date-picker" className="text-[#84878B]">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white text-[#2C3136] border-[#84878B]",
                          !selectedDate && "text-[#84878B]"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#27691F]" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white text-[#2C3136]">
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
                  <Label htmlFor="time-slot" className="text-[#84878B]">Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger id="time-slot" className="w-full bg-white text-[#2C3136] border-[#84878B]">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-[#2C3136]">
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
                className="w-full md:w-auto bg-[#27691F] text-white hover:bg-[#27691F]/90 shadow-md"
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