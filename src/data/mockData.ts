
import { User, UserRole, Department, Contract, ContractStatus, ContractType, ContractTemplate, Notification } from "../types";

// Mock Users
export const users: User[] = [
  {
    id: "u1",
    name: "李管理",
    email: "admin@university.edu",
    role: UserRole.HR_ADMIN,
    employeeId: "HR001",
    position: "人事处处长",
    phone: "13800000001",
    avatarUrl: "/avatars/admin.png"
  },
  {
    id: "u2",
    name: "王主任",
    email: "compscidept@university.edu",
    role: UserRole.DEPT_ADMIN,
    departmentId: "d1",
    employeeId: "CS001",
    position: "计算机系主任",
    phone: "13800000002",
    avatarUrl: "/avatars/dept1.png"
  },
  {
    id: "u3",
    name: "张主任",
    email: "mathdept@university.edu",
    role: UserRole.DEPT_ADMIN,
    departmentId: "d2",
    employeeId: "MA001",
    position: "数学系主任",
    phone: "13800000003",
    avatarUrl: "/avatars/dept2.png"
  },
  {
    id: "u4",
    name: "刘教授",
    email: "liu@university.edu",
    role: UserRole.TEACHER,
    departmentId: "d1",
    employeeId: "CS101",
    position: "教授",
    phone: "13800000004",
    avatarUrl: "/avatars/teacher1.png"
  },
  {
    id: "u5",
    name: "陈副教授",
    email: "chen@university.edu",
    role: UserRole.TEACHER,
    departmentId: "d1",
    employeeId: "CS102",
    position: "副教授",
    phone: "13800000005",
    avatarUrl: "/avatars/teacher2.png"
  },
  {
    id: "u6",
    name: "赵讲师",
    email: "zhao@university.edu",
    role: UserRole.TEACHER,
    departmentId: "d2",
    employeeId: "MA101",
    position: "讲师",
    phone: "13800000006",
    avatarUrl: "/avatars/teacher3.png"
  }
];

// Mock Departments
export const departments: Department[] = [
  {
    id: "d1",
    name: "计算机科学系",
    code: "CS",
    adminId: "u2"
  },
  {
    id: "d2",
    name: "数学系",
    code: "MATH",
    adminId: "u3"
  },
  {
    id: "d3",
    name: "物理系",
    code: "PHYS",
    adminId: undefined
  }
];

// Mock Contract Templates
export const contractTemplates: ContractTemplate[] = [
  {
    id: "t1",
    name: "全职教师合同模板",
    description: "适用于所有全职教师岗位的标准合同模板",
    fields: [
      {
        id: "f1",
        name: "position",
        label: "职位",
        type: "select",
        required: true,
        options: ["教授", "副教授", "助理教授", "讲师"]
      },
      {
        id: "f2",
        name: "salary",
        label: "基本工资",
        type: "number",
        required: true
      },
      {
        id: "f3",
        name: "teaching_hours",
        label: "教学课时",
        type: "number",
        required: true
      },
      {
        id: "f4",
        name: "research_requirements",
        label: "科研要求",
        type: "text",
        required: true
      }
    ],
    fileUrl: "/templates/full_time_template.pdf",
    applicable_positions: ["教授", "副教授", "助理教授", "讲师"],
    applicable_contract_types: [ContractType.FULL_TIME],
    version: "1.0",
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2023-09-01T00:00:00Z",
    isActive: true
  },
  {
    id: "t2",
    name: "兼职教师合同模板",
    description: "适用于兼职教师的合同模板",
    fields: [
      {
        id: "f1",
        name: "position",
        label: "职位",
        type: "select",
        required: true,
        options: ["兼职教授", "兼职副教授", "兼职讲师"]
      },
      {
        id: "f2",
        name: "hourly_rate",
        label: "小时工资",
        type: "number",
        required: true
      },
      {
        id: "f3",
        name: "teaching_hours",
        label: "教学课时",
        type: "number",
        required: true
      }
    ],
    fileUrl: "/templates/part_time_template.pdf",
    applicable_positions: ["兼职教授", "兼职副教授", "兼职讲师"],
    applicable_contract_types: [ContractType.PART_TIME],
    version: "1.0",
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2023-09-01T00:00:00Z",
    isActive: true
  },
  {
    id: "t3",
    name: "访问学者合同模板",
    description: "适用于访问学者的合同模板",
    fields: [
      {
        id: "f1",
        name: "home_institution",
        label: "原所在机构",
        type: "text",
        required: true
      },
      {
        id: "f2",
        name: "research_area",
        label: "研究领域",
        type: "text",
        required: true
      },
      {
        id: "f3",
        name: "allowance",
        label: "补贴金额",
        type: "number",
        required: true
      }
    ],
    fileUrl: "/templates/visiting_template.pdf",
    applicable_positions: ["访问教授", "访问研究员"],
    applicable_contract_types: [ContractType.VISITING],
    version: "1.0",
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2023-09-01T00:00:00Z",
    isActive: true
  }
];

// Mock Contracts
export const contracts: Contract[] = [
  {
    id: "c1",
    teacherId: "u4",
    templateId: "t1",
    title: "刘教授全职教师合同",
    type: ContractType.FULL_TIME,
    status: ContractStatus.APPROVED,
    startDate: "2023-09-01",
    endDate: "2026-08-31",
    createdAt: "2023-08-01T00:00:00Z",
    updatedAt: "2023-08-15T00:00:00Z",
    approvedAt: "2023-08-15T00:00:00Z",
    approvedBy: "u1",
    fileUrl: "/contracts/liu_contract.pdf",
    data: {
      position: "教授",
      salary: 300000,
      teaching_hours: 240,
      research_requirements: "每年发表至少2篇SCI论文"
    },
    departmentApprovalStatus: "approved",
    departmentApprovedAt: "2023-08-10T00:00:00Z",
    departmentApprovedBy: "u2"
  },
  {
    id: "c2",
    teacherId: "u5",
    templateId: "t1",
    title: "陈副教授全职教师合同",
    type: ContractType.FULL_TIME,
    status: ContractStatus.PENDING_HR,
    startDate: "2023-09-01",
    endDate: "2026-08-31",
    createdAt: "2023-08-05T00:00:00Z",
    updatedAt: "2023-08-12T00:00:00Z",
    fileUrl: "/contracts/chen_contract.pdf",
    data: {
      position: "副教授",
      salary: 250000,
      teaching_hours: 280,
      research_requirements: "每年发表至少1篇SCI论文"
    },
    departmentApprovalStatus: "approved",
    departmentApprovedAt: "2023-08-12T00:00:00Z",
    departmentApprovedBy: "u2"
  },
  {
    id: "c3",
    teacherId: "u6",
    templateId: "t1",
    title: "赵讲师全职教师合同",
    type: ContractType.FULL_TIME,
    status: ContractStatus.PENDING_DEPT,
    startDate: "2023-09-01",
    endDate: "2026-08-31",
    createdAt: "2023-08-07T00:00:00Z",
    updatedAt: "2023-08-07T00:00:00Z",
    fileUrl: "/contracts/zhao_contract.pdf",
    data: {
      position: "讲师",
      salary: 200000,
      teaching_hours: 320,
      research_requirements: "参与院系科研项目"
    }
  },
  {
    id: "c4",
    teacherId: "u4",
    templateId: "t2",
    title: "刘教授兼职教学合同",
    type: ContractType.PART_TIME,
    status: ContractStatus.DRAFT,
    startDate: "2023-09-01",
    endDate: "2024-01-31",
    createdAt: "2023-08-10T00:00:00Z",
    updatedAt: "2023-08-10T00:00:00Z",
    fileUrl: "/contracts/liu_part_time_contract.pdf",
    data: {
      position: "兼职教授",
      hourly_rate: 800,
      teaching_hours: 64
    }
  }
];

// Mock Notifications
export const notifications: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    title: "新合同申请待审批",
    message: "陈副教授的全职教师合同申请需要您的审批",
    isRead: false,
    createdAt: "2023-08-12T10:00:00Z",
    link: "/contracts/c2",
    type: "approval_required"
  },
  {
    id: "n2",
    userId: "u2",
    title: "新合同申请待审批",
    message: "赵讲师的全职教师合同申请需要您的审批",
    isRead: false,
    createdAt: "2023-08-07T14:30:00Z",
    link: "/contracts/c3",
    type: "approval_required"
  },
  {
    id: "n3",
    userId: "u4",
    title: "合同已批准",
    message: "您的全职教师合同已获批准",
    isRead: true,
    createdAt: "2023-08-15T09:15:00Z",
    link: "/contracts/c1",
    type: "status_changed"
  },
  {
    id: "n4",
    userId: "u5",
    title: "部门已批准合同",
    message: "您的合同已获得部门批准，等待人事处最终审批",
    isRead: false,
    createdAt: "2023-08-12T16:45:00Z",
    link: "/contracts/c2",
    type: "status_changed"
  },
  {
    id: "n5",
    userId: "u1",
    title: "合同即将到期",
    message: "5份教师合同将在30天内到期",
    isRead: false,
    createdAt: "2023-08-01T08:00:00Z",
    link: "/contracts?filter=expiring",
    type: "contract_expiry"
  }
];
