"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Users, Edit, BarChartHorizontalBig, Briefcase, UserCheck, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashPage() {
  const { currentUser, role } = useAuth();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!currentUser) {
    return (
      <AuthGuard>
        <p className="text-[#84878B]">Loading dashboard...</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-8 bg-[#2C3136] p-6">
        {error === 'unauthorized' && (
          <Alert className="mb-6 bg-red-900 text-white border-none">
            <AlertTriangle className="h-4 w-4 text-white" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access the requested page.
            </AlertDescription>
          </Alert>
        )}
        <h1 className="text-4xl font-bold text-white">Welcome to your PLMUN Portal Dashboard, {currentUser.name}!</h1>
        <p className="text-xl text-[#84878B]">
          You are logged in as a <span className="font-semibold text-[#27691F]">{role}</span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {role === 'student' && (
            <>
              <DashboardActionCard
                title="Book a Consultation"
                description="Find available faculty and schedule your consultation."
                link="/student/book-consultation"
                icon={<CalendarCheck className="h-8 w-8 text-[#27691F]" />}
              />
              <DashboardActionCard
                title="My Consultations"
                description="View and manage your upcoming and past consultations."
                link="/student/my-consultations"
                icon={<Briefcase className="h-8 w-8 text-[#27691F]" />}
              />
            </>
          )}

          {role === 'faculty' && (
            <>
              <DashboardActionCard
                title="Update My Status"
                description="Let students know your current availability."
                link="/faculty/manage-status"
                icon={<Edit className="h-8 w-8 text-[#27691F]" />}
              />
              <DashboardActionCard
                title="My Scheduled Consultations"
                description="View and manage your upcoming consultations."
                link="/faculty/my-consultations"
                icon={<Briefcase className="h-8 w-8 text-[#27691F]" />}
              />
            </>
          )}

          {role === 'admin' && (
            <>
              <DashboardActionCard
                title="Manage Faculty Accounts"
                description="Add, view, or modify faculty accounts."
                link="/admin/manage-faculty"
                icon={<Users className="h-8 w-8 text-[#27691F]" />}
              />
              <DashboardActionCard
                title="Generate Reports"
                description="View summaries of consultations and faculty availability."
                link="/admin/reports"
                icon={<BarChartHorizontalBig className="h-8 w-8 text-[#27691F]" />}
              />
              <DashboardActionCard
                title="View All Users"
                description="See a list of all registered users."
                link="/admin/all-users"
                icon={<UserCheck className="h-8 w-8 text-[#27691F]" />}
              />
              <DashboardActionCard
                title="View All Consultations"
                description="Overview of all scheduled consultations in the system."
                link="/admin/all-consultations"
                icon={<CalendarCheck className="h-8 w-8 text-[#27691F]" />}
              />
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

interface DashboardActionCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

function DashboardActionCard({ title, description, link, icon }: DashboardActionCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-[#2C3136] text-white">
      <CardHeader className="flex-row items-center space-x-4 pb-2">
        <div className="p-3 bg-[#27691F]/10 rounded-full">
          {icon}
        </div>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-[#84878B]">{description}</CardDescription>
      </CardContent>
      <div className="p-6 pt-0">
        <Button 
          asChild 
          className="w-full bg-[#27691F] text-white hover:bg-[#27691F]/90 shadow-md"
        >
          <Link href={link}>Go to {title}</Link>
        </Button>
      </div>
    </Card>
  );
}