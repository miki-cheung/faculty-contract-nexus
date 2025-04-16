
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useContracts } from "@/contexts/ContractContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  FilePlus,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  FileBarChart
} from "lucide-react";
import { ContractStatus } from "@/types";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { contracts, loading } = useContracts();
  const { unreadCount } = useNotifications();

  const myContracts = contracts.filter(contract => contract.teacherId === user?.id);
  const activeContracts = myContracts.filter(contract => contract.status === ContractStatus.APPROVED);
  const pendingContracts = myContracts.filter(
    contract => [ContractStatus.PENDING_DEPT, ContractStatus.PENDING_HR].includes(contract.status)
  );
  const draftContracts = myContracts.filter(contract => contract.status === ContractStatus.DRAFT);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">欢迎, {user?.name}</h2>
        <p className="text-muted-foreground">这是您的个人合同管理中心</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">有效合同</CardTitle>
            <FileCheck className="h-4 w-4 text-status-approved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              当前生效的合同数量
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">待审批</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              正在等待审批的合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">草稿</CardTitle>
            <FileText className="h-4 w-4 text-status-draft" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              尚未提交的合同草稿
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">未读通知</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              您有 {unreadCount} 条未读通知
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>近期合同</CardTitle>
            <CardDescription>查看您最近的合同</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">加载中...</div>
            ) : myContracts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>您目前没有任何合同</p>
                <Button asChild className="mt-2">
                  <Link to="/apply">申请新合同</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myContracts.slice(0, 5).map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">{contract.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          contract.status === ContractStatus.APPROVED
                            ? "bg-status-approved/10 text-status-approved"
                            : contract.status === ContractStatus.REJECTED
                            ? "bg-status-rejected/10 text-status-rejected"
                            : contract.status === ContractStatus.PENDING_DEPT || contract.status === ContractStatus.PENDING_HR
                            ? "bg-status-pending/10 text-status-pending"
                            : "bg-status-draft/10 text-status-draft"
                        }`}
                      >
                        {contract.status === ContractStatus.APPROVED
                          ? "已批准"
                          : contract.status === ContractStatus.REJECTED
                          ? "已拒绝"
                          : contract.status === ContractStatus.PENDING_DEPT
                          ? "部门审批中"
                          : contract.status === ContractStatus.PENDING_HR
                          ? "人事审批中"
                          : "草稿"}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link to="/my-contracts">查看全部合同</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快捷入口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/apply">
                  <FilePlus className="mr-2 h-4 w-4" />
                  申请新合同
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/my-contracts">
                  <FileText className="mr-2 h-4 w-4" />
                  查看我的合同
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/profile">
                  <Users className="mr-2 h-4 w-4" />
                  更新个人资料
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/notifications">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  查看所有通知
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DepartmentAdminDashboard = () => {
  const { user } = useAuth();
  const { contracts, loading } = useContracts();
  const { unreadCount } = useNotifications();

  // In a real app, we'd filter these properly
  const departmentContracts = contracts.filter(contract => {
    // This is a simplified mock - in a real app we would properly filter by department
    return contract.teacherId && user?.departmentId === user?.departmentId;
  });
  
  const pendingApprovals = departmentContracts.filter(
    contract => contract.status === ContractStatus.PENDING_DEPT
  );
  
  const approvedContracts = departmentContracts.filter(
    contract => contract.status === ContractStatus.APPROVED ||
                contract.status === ContractStatus.PENDING_HR
  );
  
  const rejectedContracts = departmentContracts.filter(
    contract => contract.status === ContractStatus.REJECTED
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">欢迎, {user?.name}</h2>
        <p className="text-muted-foreground">
          这是您的部门合同管理中心
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">待审批</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">
              需要您审批的合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">已批准</CardTitle>
            <CheckCircle className="h-4 w-4 text-status-approved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              已批准的部门合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <AlertCircle className="h-4 w-4 text-status-rejected" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              已拒绝的部门合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">未读通知</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              您有 {unreadCount} 条未读通知
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>待审批合同</CardTitle>
            <CardDescription>需要您审批的合同</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">加载中...</div>
            ) : pendingApprovals.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>当前没有需要审批的合同</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.slice(0, 5).map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">{contract.title}</div>
                      <div className="text-sm text-muted-foreground">
                        申请日期: {new Date(contract.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <Link to={`/approvals/${contract.id}`}>审批</Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link to="/approvals">查看全部待审批</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快捷入口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/approvals">
                  <FileCheck className="mr-2 h-4 w-4" />
                  合同审批
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dept-contracts">
                  <FileText className="mr-2 h-4 w-4" />
                  部门合同
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dept-teachers">
                  <Users className="mr-2 h-4 w-4" />
                  教师管理
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dept-reports">
                  <FileBarChart className="mr-2 h-4 w-4" />
                  部门统计
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const HRAdminDashboard = () => {
  const { user } = useAuth();
  const { contracts, loading } = useContracts();
  const { unreadCount } = useNotifications();

  const pendingHRApprovals = contracts.filter(
    contract => contract.status === ContractStatus.PENDING_HR
  );
  
  const approvedContracts = contracts.filter(
    contract => contract.status === ContractStatus.APPROVED
  );
  
  const pendingDeptApprovals = contracts.filter(
    contract => contract.status === ContractStatus.PENDING_DEPT
  );
  
  const expiringSoon = approvedContracts.filter(contract => {
    const endDate = new Date(contract.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">欢迎, {user?.name}</h2>
        <p className="text-muted-foreground">
          这是人事管理中心
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">待审批</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingHRApprovals.length}</div>
            <p className="text-xs text-muted-foreground">
              需要人事处审批的合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">部门审批中</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeptApprovals.length}</div>
            <p className="text-xs text-muted-foreground">
              等待部门审批的合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
            <AlertCircle className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringSoon.length}</div>
            <p className="text-xs text-muted-foreground">
              30天内到期的合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">未读通知</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              您有 {unreadCount} 条未读通知
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>待人事审批</CardTitle>
            <CardDescription>需要人事处最终审批的合同</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">加载中...</div>
            ) : pendingHRApprovals.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>当前没有需要人事处审批的合同</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingHRApprovals.slice(0, 5).map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">{contract.title}</div>
                      <div className="text-sm text-muted-foreground">
                        部门已批准: {contract.departmentApprovedAt ? new Date(contract.departmentApprovedAt).toLocaleDateString() : "未知"}
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <Link to={`/hr-approvals/${contract.id}`}>审批</Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link to="/hr-approvals">查看全部待审批</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快捷入口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/hr-approvals">
                  <FileCheck className="mr-2 h-4 w-4" />
                  合同审批
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/templates">
                  <FilePlus className="mr-2 h-4 w-4" />
                  合同模板管理
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/expiry">
                  <Clock className="mr-2 h-4 w-4" />
                  到期合同管理
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/users">
                  <Users className="mr-2 h-4 w-4" />
                  用户管理
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Render different dashboard based on user role
  switch (user.role) {
    case UserRole.HR_ADMIN:
      return <HRAdminDashboard />;
    case UserRole.DEPT_ADMIN:
      return <DepartmentAdminDashboard />;
    case UserRole.TEACHER:
      return <TeacherDashboard />;
    default:
      return <div>未知用户角色</div>;
  }
};

export default Dashboard;
