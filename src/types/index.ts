
// User Types
export enum UserRole {
  HR_ADMIN = "hr_admin",
  DEPT_ADMIN = "dept_admin",
  TEACHER = "teacher"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  employeeId?: string;
  position?: string;
  phone?: string;
  avatarUrl?: string;
  title?: string; // Added title property
}

// Department Types
export interface Department {
  id: string;
  name: string;
  code: string;
  adminId?: string;
}

// Contract Types
export enum ContractStatus {
  DRAFT = "draft",
  PENDING_DEPT = "pending_dept",
  PENDING_HR = "pending_hr",
  APPROVED = "approved",
  REJECTED = "rejected",
  ARCHIVED = "archived",
  TERMINATED = "terminated"
}

export enum ContractType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  TEMPORARY = "temporary",
  VISITING = "visiting"
}

export interface Contract {
  id: string;
  teacherId: string;
  templateId: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  departmentApprovalStatus?: "pending" | "approved" | "rejected";
  departmentApprovedAt?: string;
  departmentApprovedBy?: string;
  departmentRejectionReason?: string;
  fileUrl?: string;
  data: Record<string, any>; // JSON data containing contract field values
  attachments?: Attachment[];
}

// Contract Template Types
export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  required: boolean;
  options?: string[]; // For select fields
  defaultValue?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  fileUrl?: string;
  applicable_positions?: string[]; // E.g., ["professor", "associate_professor"]
  applicable_contract_types?: ContractType[]; 
  version: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  content?: string; // Added content property
  applicableRoles?: string[]; // Added applicableRoles property
}

// Attachment Types
export interface Attachment {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  type: "contract_expiry" | "approval_required" | "status_changed" | "system";
}
