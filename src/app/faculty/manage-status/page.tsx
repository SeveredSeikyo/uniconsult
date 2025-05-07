"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import type { FacultyStatus, FacultyStatusOption } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Edit3, Activity, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageStatusPage() {
  const { currentUser } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<FacultyStatusOption | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<FacultyStatusOption | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser && currentUser.role === 'faculty') {
      fetchCurrentStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchCurrentStatus = async () => {
    if (!currentUser || !currentUser.id) return;
    setIsLoading(true);
    try {
      // This API returns all statuses. We need to find the current user's.
      // A dedicated API endpoint /api/faculty/status/:id would be more efficient.
      const response = await fetch('/api/faculty/status');
      if (response.ok) {
        const allStatuses: FacultyStatus[] = await response.json();
        const userStatus = allStatuses.find(s => s.faculty_id === currentUser.id);
        if (userStatus) {
          setCurrentStatus(userStatus.status);
          setLastUpdated(userStatus.last_updated);
          setNewStatus(userStatus.status); // Pre-fill select with current status
        } else {
          // If no status found, means it's a new faculty or status record missing.
          // Default to 'Offline' and allow setting.
          setCurrentStatus('Offline'); 
          setNewStatus('Offline');
          toast({ title: "Status Not Set", description: "Your status is not set. Defaulting to Offline.", variant: "default" });
        }
      } else {
        toast({ title: "Error", description: "Failed to fetch current status.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred fetching status.", variant: "destructive" });
      console.error("Error fetching status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentUser || !currentUser.id || !newStatus) {
      toast({ title: "Missing Information", description: "Please select a new status.", variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    try {
      const response = await fetch('/api/faculty/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faculty_id: currentUser.id, status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Status Updated!", description: `Your status is now ${data.status.status}.`, variant: "default" });
        setCurrentStatus(data.status.status);
        setLastUpdated(data.status.last_updated);
      } else {
        toast({ title: "Update Failed", description: data.error || "Could not update status.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      console.error("Status update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusDisplayInfo = (status: FacultyStatusOption | undefined) => {
    switch (status) {
      case 'Available':
        return { text: 'Available', icon: <CheckCircle className="h-6 w-6 text-green-500" />, color: 'text-green-600' };
      case 'In Class':
        return { text: 'In Class', icon: <Activity className="h-6 w-6 text-orange-500" />, color: 'text-orange-600' };
      case 'Offline':
        return { text: 'Offline', icon: <ShieldAlert className="h-6 w-6 text-red-500" />, color: 'text-red-600' };
      default:
        return { text: 'Loading...', icon: <Loader2 className="h-6 w-6 animate-spin" />, color: 'text-gray-500' };
    }
  };
  
  const displayInfo = getStatusDisplayInfo(currentStatus);

  return (
    <AuthGuard allowedRoles={['faculty']}>
      <div className="space-y-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary flex items-center">
            <Edit3 className="mr-3 h-8 w-8" /> Update My Availability Status
        </h1>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Current Status</CardTitle>
            {isLoading ? (
                 <CardDescription className="flex items-center text-lg">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading status...
                 </CardDescription>
            ) : (
                <>
                <CardDescription className={`flex items-center text-xl font-semibold ${displayInfo.color}`}>
                    {displayInfo.icon}
                    <span className="ml-2">{displayInfo.text}</span>
                </CardDescription>
                {lastUpdated && <p className="text-sm text-muted-foreground">Last updated: {format(new Date(lastUpdated), "PPPp")}</p>}
                </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                Set new status:
              </label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as FacultyStatusOption)}>
                <SelectTrigger id="status-select" className="w-full text-base py-3">
                  <SelectValue placeholder="Select your new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="In Class">In Class</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={isLoading || isUpdating || !newStatus || newStatus === currentStatus} 
              className="w-full md:w-auto text-lg py-6 shadow-md"
              size="lg"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-5 w-5" />
              )}
              Update Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AuthGuard>
  );
}
