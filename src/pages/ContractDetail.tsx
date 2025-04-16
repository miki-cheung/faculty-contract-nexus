
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useContracts } from "@/contexts/ContractContext";
import { useTemplates } from "@/contexts/TemplateContext";
import { useUsers } from "@/contexts/UserContext";
import { ContractStatus, UserRole } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileQuestion,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const statusIcons: Record<string, React.ReactNode> = {
  [ContractStatus.DRAFT]: <FileQuestion className="h-5 w-5 text-status-draft" />,
  [ContractStatus.PENDING_DEPT]: <Clock className="h-5 w-5 text-status-pending" />,
  [ContractStatus.PENDING_HR]: <Clock className="h-5 w-5 text-status-pending" />,
  [ContractStatus.APPROVED]: <CheckCircle className="h-5 w-5 text-status-approved" />,
  [ContractStatus.REJECTED]: <XCircle className="h-5 w-5 text-status-rejected" />,
  [ContractStatus.EXPIRED]: <AlertCircle className="h-5 w-5 text-status-expired" />,
  [ContractStatus.TERMINATED]: <AlertCircle className="h-5 w-5 text-status-expired" />
};

const translateStatus = (status: ContractStatus): string => {
  switch (status) {
    case ContractStatus.DRAFT:
      return "草稿";
    case ContractStatus.PENDING_DEPT:
      return "部门审批中";
    case ContractStatus.PENDING_HR:
      return "人事审批中";
    case ContractStatus.APPROVED:
      return "已批准";
    case ContractStatus.REJECTED:
      return "已拒绝";
    case ContractStatus.EXPIRED:
      return "已过期";
    case ContractStatus.TERMINATED:
      return "已终止";
    default:
      return status;
  }
};

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getContract, updateContractStatus } = useContracts();
  const { getTemplate } = useTemplates();
  const { getUser } = useUsers();
  const [showApproveDialog, setShowApproveDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);

  if (!id || !user) return null;

  const contract = getContract(id);
  if (!contract) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">合同未找到</h1>
          <p className="text-muted-foreground">找不到该合同或您无权访问</p>
          <Button
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </div>
      </div>
    );
  }

  const template = getTemplate(contract.templateId);
  const teacher = getUser(contract.teacherId);

  // Access control
  const canApprove =
    (user.role === UserRole.DEPT_ADMIN &&
      contract.status === ContractStatus.PENDING_DEPT) ||
    (user.role === UserRole.HR_ADMIN &&
      contract.status === ContractStatus.PENDING_HR);

  const canReject = canApprove;

  const handleApprove = () => {
    if (user.role === UserRole.DEPT_ADMIN) {
      updateContractStatus(
        contract.id,
        ContractStatus.PENDING_HR,
        user.id
      );
    } else if (user.role === UserRole.HR_ADMIN) {
      updateContractStatus(
        contract.id,
        ContractStatus.APPROVED,
        user.id
      );
    }
    setShowApproveDialog(false);
  };

  const handleReject = () => {
    updateContractStatus(
      contract.id,
      ContractStatus.REJECTED,
      user.id,
      "不符合要求"
    );
    setShowRejectDialog(false);
  };

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.DRAFT:
        return "bg-status-draft/10 text-status-draft";
      case ContractStatus.PENDING_DEPT:
      case ContractStatus.PENDING_HR:
        return "bg-status-pending/10 text-status-pending";
      case ContractStatus.APPROVED:
        return "bg-status-approved/10 text-status-approved";
      case ContractStatus.REJECTED:
        return "bg-status-rejected/10 text-status-rejected";
      case ContractStatus.EXPIRED:
      case ContractStatus.TERMINATED:
        return "bg-status-expired/10 text-status-expired";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> 返回
        </Button>
        <div className="flex items-center gap-2">
          {statusIcons[contract.status]}
          <Badge className={getStatusColor(contract.status)}>
            {translateStatus(contract.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{contract.title}</CardTitle>
              <CardDescription>
                {template?.name || "合同详情"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">基本信息</h3>
                <Separator className="my-2" />
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">教师姓名</dt>
                    <dd>{teacher?.name || "未知"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">工号</dt>
                    <dd>{teacher?.employeeId || "未知"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">合同开始日期</dt>
                    <dd>{new Date(contract.startDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">合同结束日期</dt>
                    <dd>{new Date(contract.endDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">创建时间</dt>
                    <dd>{new Date(contract.createdAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">最后更新</dt>
                    <dd>{new Date(contract.updatedAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium">合同内容</h3>
                <Separator className="my-2" />
                <dl className="space-y-4">
                  {Object.entries(contract.data).map(([key, value]) => {
                    const field = template?.fields.find(f => f.name === key);
                    return (
                      <div key={key}>
                        <dt className="text-sm font-medium text-muted-foreground">
                          {field?.label || key}
                        </dt>
                        <dd className="mt-1">{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              {contract.attachments && contract.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">附件</h3>
                  <Separator className="my-2" />
                  <ul className="space-y-2">
                    {contract.attachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center justify-between rounded-md border p-2">
                        <span>{attachment.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                        >
                          <a href={attachment.fileUrl} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              {contract.fileUrl && (
                <Button variant="outline" asChild>
                  <a href={contract.fileUrl} download>
                    <FileText className="mr-2 h-4 w-4" />
                    下载合同文件
                  </a>
                </Button>
              )}
              <div className="flex gap-2">
                {canReject && (
                  <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                    拒绝
                  </Button>
                )}
                {canApprove && (
                  <Button onClick={() => setShowApproveDialog(true)}>
                    批准
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>审批进度</CardTitle>
              <CardDescription>
                合同审批流程追踪
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-approved text-white">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">创建合同</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(contract.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {contract.departmentApprovalStatus === "approved" ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-approved text-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  ) : contract.departmentApprovalStatus === "rejected" ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-rejected text-white">
                      <XCircle className="h-4 w-4" />
                    </div>
                  ) : contract.status === ContractStatus.PENDING_DEPT ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-pending text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">部门审批</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.departmentApprovedAt
                        ? new Date(contract.departmentApprovedAt).toLocaleString()
                        : "等待审批"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {contract.status === ContractStatus.APPROVED ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-approved text-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  ) : contract.status === ContractStatus.REJECTED ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-rejected text-white">
                      <XCircle className="h-4 w-4" />
                    </div>
                  ) : contract.status === ContractStatus.PENDING_HR ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-pending text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">人事处审批</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.approvedAt
                        ? new Date(contract.approvedAt).toLocaleString()
                        : "等待审批"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批准</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要批准这份合同吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              确认批准
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>拒绝合同</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要拒绝这份合同吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认拒绝
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractDetail;
