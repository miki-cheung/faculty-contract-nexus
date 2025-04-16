
import React, { useState } from "react";
import { useContracts } from "@/contexts/ContractContext";
import { useAuth } from "@/contexts/AuthContext";
import { ContractStatus, ContractType } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  FileQuestion,
} from "lucide-react";

const statusIcons: Record<string, React.ReactNode> = {
  [ContractStatus.DRAFT]: <FileQuestion className="h-4 w-4 text-status-draft" />,
  [ContractStatus.PENDING_DEPT]: <Clock className="h-4 w-4 text-status-pending" />,
  [ContractStatus.PENDING_HR]: <Clock className="h-4 w-4 text-status-pending" />,
  [ContractStatus.APPROVED]: <CheckCircle className="h-4 w-4 text-status-approved" />,
  [ContractStatus.REJECTED]: <AlertCircle className="h-4 w-4 text-status-rejected" />,
  [ContractStatus.EXPIRED]: <AlertCircle className="h-4 w-4 text-status-expired" />,
  [ContractStatus.TERMINATED]: <AlertCircle className="h-4 w-4 text-status-expired" />
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

const translateType = (type: ContractType): string => {
  switch (type) {
    case ContractType.FULL_TIME:
      return "全职";
    case ContractType.PART_TIME:
      return "兼职";
    case ContractType.TEMPORARY:
      return "临时";
    case ContractType.VISITING:
      return "访问";
    default:
      return type;
  }
};

const MyContracts = () => {
  const { user } = useAuth();
  const { contracts, loading } = useContracts();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  if (!user) return null;

  const myContracts = contracts.filter(contract => contract.teacherId === user.id);

  const filteredContracts = myContracts.filter(contract => {
    // Apply status filter
    if (statusFilter !== "all" && contract.status !== statusFilter) {
      return false;
    }

    // Apply search filter
    if (
      searchText &&
      !contract.title.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">我的合同</h2>
        <p className="text-muted-foreground">查看和管理您的所有合同</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>合同列表</CardTitle>
          <CardDescription>您的所有合同记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <div className="w-[180px]">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="合同状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value={ContractStatus.DRAFT}>草稿</SelectItem>
                    <SelectItem value={ContractStatus.PENDING_DEPT}>部门审批中</SelectItem>
                    <SelectItem value={ContractStatus.PENDING_HR}>人事审批中</SelectItem>
                    <SelectItem value={ContractStatus.APPROVED}>已批准</SelectItem>
                    <SelectItem value={ContractStatus.REJECTED}>已拒绝</SelectItem>
                    <SelectItem value={ContractStatus.EXPIRED}>已过期</SelectItem>
                    <SelectItem value={ContractStatus.TERMINATED}>已终止</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索合同..."
                  className="pl-8 w-[250px]"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <Button asChild>
              <Link to="/apply">申请新合同</Link>
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg font-semibold">加载中...</p>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/60" />
              <p className="mt-4 text-lg font-semibold">没有找到合同</p>
              <p className="text-muted-foreground">
                {myContracts.length === 0
                  ? "您还没有任何合同。点击'申请新合同'按钮开始。"
                  : "尝试更改过滤条件以查看更多合同。"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>开始日期</TableHead>
                  <TableHead>结束日期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>{translateType(contract.type)}</TableCell>
                    <TableCell>
                      {new Date(contract.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(contract.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {statusIcons[contract.status]}
                        <span className="ml-2">{translateStatus(contract.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" title="查看详情">
                          <Link to={`/my-contracts/${contract.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {contract.fileUrl && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="下载合同"
                            asChild
                          >
                            <a href={contract.fileUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyContracts;
