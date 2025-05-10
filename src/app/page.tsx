import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, CalendarClock, BarChart3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center ">
      <Image 
        src="https://i.ibb.co/dwXND354/3.png" 
        alt="University campus" 
        width={1200} 
        height={400} 
        className="rounded-lg shadow-lg mb-8 object-cover w-full max-w-4xl h-64 md:h-96"
        data-ai-hint="university campus"
        priority
      />
      <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl mb-6">
        Welcome to PLMUN Portal
      </h1>
      <p className="max-w-2xl text-xl text-[#84878B] sm:text-2xl mb-10">
        Seamlessly schedule and manage academic consultations between students and faculty.
        Our platform simplifies booking, status updates, and reporting.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Button asChild size="lg" className="bg-[#27691F] text-white hover:bg-[#27691F]/90 shadow-md">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-[#84878B] text-[#84878B] hover:bg-[#84878B]/10 shadow-md">
          <Link href="/register">Register</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <FeatureCard
          icon={<CalendarClock className="h-10 w-10 text-[#27691F]" />}
          title="Easy Scheduling"
          description="Students can easily find available faculty and book consultation slots that fit their schedule."
        />
        <FeatureCard
          icon={<Users className="h-10 w-10 text-[#27691F]" />}
          title="Faculty Availability"
          description="Faculty can update their status in real-time, ensuring students see accurate availability."
        />
        <FeatureCard
          icon={<BarChart3 className="h-10 w-10 text-[#27691F]" />}
          title="Admin Oversight"
          description="Administrators can manage faculty accounts and generate insightful reports on consultation activities."
        />
      </div>

      <footer className="mt-16 text-[#84878B] text-sm">
        <p>© {new Date().getFullYear()} PLMUN Portal. All rights reserved.</p>
        <p>Built for simplified academic interactions at PLMUN.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-left shadow-lg hover:shadow-xl transition-shadow duration-300 bg-[#2C3136] text-white">
      <CardHeader className="items-center">
        <div className="p-3 bg-[#27691F]/10 rounded-full mb-3">
          {icon}
        </div>
        <CardTitle className="text-2xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[#84878B]">{description}</p>
      </CardContent>
    </Card>
  );
}