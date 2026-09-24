export type Role = "super_admin" | "gym_owner" | "manager" | "trainer" | "receptionist" | "member";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  photo?: string;
}

export interface MembershipPlan {
  _id: string;
  name: string;
  durationInMonths: number;
  price: number;
  description?: string;
  features: string[];
  accessType: "Basic" | "Full" | "Premium";
  personalTrainerIncluded: boolean;
  status: "active" | "inactive";
}

export interface Trainer {
  _id: string;
  trainerId: string;
  name: string;
  photo?: string;
  phone?: string;
  email?: string;
  specialization: string[];
  experience: number;
  salary: number;
  joiningDate: string;
  availability?: string;
  status: "active" | "on_leave" | "inactive";
}

export interface Member {
  _id: string;
  memberId: string;
  fullName: string;
  photo?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  joiningDate: string;
  membershipPlan?: MembershipPlan | string;
  membershipStartDate?: string;
  membershipExpiryDate?: string;
  assignedTrainer?: Trainer | string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  medicalNotes?: string;
  status: "active" | "expired" | "frozen" | "cancelled";
}

export interface Payment {
  _id: string;
  member: Member | string;
  membershipPlan?: MembershipPlan | string;
  amount: number;
  discount: number;
  tax: number;
  finalAmount: number;
  method: string;
  status: "paid" | "pending" | "refunded";
  invoiceNumber: string;
  date: string;
  notes?: string;
}

export interface AttendanceRecord {
  _id: string;
  member: Member | string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  method: "QR" | "RFID" | "Manual";
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  newMembersThisMonth: number;
  todaysCheckins: number;
  activeTrainers: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
  monthlyRevenue: number;
  upcomingExpirations: Member[];
  recentTransactions: Payment[];
}
