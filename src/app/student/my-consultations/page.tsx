"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import type { Consultation } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Loader2, CalendarX2, Info, MessageSquareWarning, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

export default function MyConsultationsPage() {
  const { currentUser } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      fetchConsultations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchConsultations = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/consultations?student_id=${currentUser.id}`);
      if (response.ok) {
        const data: Consultation[] = await response.json();
        setConsultations(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch consultations.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while fetching consultations.", variant: "destructive" });
      console.error("Error fetching consultations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConsultation = async () => {
    if (!selectedConsultationId || !cancelReason) {
      toast({ title: "Missing Information", description: "Reason for cancellation is required.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`/api/consultations/${selectedConsultationId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason, cancelled_by_role: 'student' }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Consultation cancelled successfully.", variant: "default" });
        fetchConsultations(); // Refresh the list
        setCancelReason('');
        setSelectedConsultationId(null);
      } else {
        const data = await response.json();
        toast({ title: "Cancellation Failed", description: data.error || "Could not cancel consultation.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      console.error("Cancellation error:", error);
    }
  };

  const getStatusBadgeColor = (status: Consultation['status']) => {
    if (status === 'Scheduled') return 'bg-blue-900 text-white border-blue-950';
    if (status === 'Cancelled') return 'bg-red-900 text-white border-red-950';
    if (status === 'Completed') return 'bg-[#27691F] text-white border-[#27691F]/50';
    return 'bg-[#84878B] text-white border-[#84878B]/50';
  };

  const getCardBorderColor = (status: Consultation['status']) => {
    if (status === 'Scheduled') return 'border-blue-950';
    if (status === 'Cancelled') return 'border-red-950';
    if (status === 'Completed') return 'border-[#27691F]/50';
    return 'border-[#84878B]/50';
  };

  return (
    <AuthGuard allowedRoles={['student']}>
      <div className="space-y-8 bg-[#2C3136] p-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <ClipboardList className="mr-3 h-8 w-8 text-[#27691F]" /> My PLMUN Portal Consultations
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-[#27691F]" />
            <p className="ml-3 text-lg text-[#84878B]">Loading your consultations...</p>
          </div>
        ) : consultations.length === 0 ? (
          <Card className="shadow-md bg-[#2C3136] text-white">
            <CardContent className="p-6 text-center">
              <Info className="mx-auto h-12 w-12 text-[#84878B] mb-4" />
              <p className="text-xl text-[#84878B]">You have no consultations scheduled in the PLMUN Portal.</p>
              <Button 
                asChild 
                className="mt-4 bg-[#27691F] text-white hover:bg-[#27691F]/90"
              >
                <a href="/student/book-consultation">Book a New Consultation</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consultations.map((consultation) => (
              <Card 
                key={consultation.id} 
                className={`shadow-lg bg-[#2C3136] text-white ${getCardBorderColor(consultation.status)}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-white">With: {consultation.faculty_name}</CardTitle>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(consultation.status)}`}>
                      {consultation.status}
                    </span>
                  </div>
                  <CardDescription className="text-[#84878B]">
                    {format(new Date(consultation.datetime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {consultation.status === 'Cancelled' && consultation.reason && (
                    <p className="text-sm text-[#84878B] flex items-start">
                      <MessageSquareWarning className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-red-900" />
                      <span className="font-semibold">Reason for cancellation:</span> {consultation.reason}
                    </p>
                  )}
                </CardContent>
                {consultation.status === 'Scheduled' && (
                  <CardFooter>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          className="bg-red-900 text-white hover:bg-red-900/90 shadow"
                          size="sm"
                          onClick={() => setSelectedConsultationId(consultation.id)}
                        >
                          <CalendarX2 className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#2C3136] text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Cancel Consultation?</AlertDialogTitle>
                          <AlertDialogDescription className="text-[#84878B]">
                            Please provide a reason for cancelling your consultation with {consultation.faculty_name} on {format(new Date(consultation.datetime), "PPp")}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea
                          placeholder="Enter reason for cancellation..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="min-h-[100px] bg-white text-[#2C3136] border-[#84878B]"
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel 
                            className="bg-[#84878B] text-white hover:bg-[#84878B]/90"
                            onClick={() => {setCancelReason(''); setSelectedConsultationId(null);}}
                          >
                            Back
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-900 text-white hover:bg-red-900/90"
                            onClick={handleCancelConsultation} 
                            disabled={!cancelReason.trim()}
                          >
                            Confirm Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}