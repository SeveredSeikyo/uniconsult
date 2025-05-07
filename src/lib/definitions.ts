export type UserRole = "student" | "faculty" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  password?: string; // Password should not be sent to client
  role: UserRole;
  student_id?: string | null;
  faculty_id?: string | null;
  department?: string | null;
};

export type FacultyStatusOption = "Available" | "In Class" | "Offline";

export type FacultyStatus = {
  id: number;
  faculty_id: number;
  faculty_name?: string; // For display purposes
  status: FacultyStatusOption;
  last_updated: string; // ISO date string
};

export type ConsultationStatus = "Scheduled" | "Cancelled" | "Completed";

export type Consultation = {
  id: number;
  student_id: number;
  student_name?: string; // For display
  faculty_id: number;
  faculty_name?: string; // For display
  datetime: string; // ISO date string
  status: ConsultationStatus;
  reason?: string | null;
};
