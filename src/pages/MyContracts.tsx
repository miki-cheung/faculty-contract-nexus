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
  CardFooter,
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
  FileBarChart,
  FileCheck,
  ChevronDown,
  ChevronUp,
  FilePlus,
  Calendar,
  Tag
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const statusIcons: Record<string, React.ReactNode> = {
  [ContractStatus.PENDING_DEPT]: <Clock className="h-4 w-4 text-status-pending" />,
  [ContractStatus.PENDING_HR]: <Clock className="h-4 w-4 text-status-pending" />,
  [ContractStatus.APPROVED]: <CheckCircle className="h-4 w-4 text-status-approved" />,
  [ContractStatus.REJECTED]: <AlertCircle className="h-4 w-4 text-status-rejected" />,
  [ContractStatus.EXPIRED]: <AlertCircle className="h-4 w-4 text-status-expired" />,
  [ContractStatus.TERMINATED]: <AlertCircle className="h-4 w-4 text-status-expired" />
};

const translateStatus = (status: ContractStatus): string => {
  switch (status) {
    case ContractStatus.PENDING_DEPT:
    case ContractStatus.PENDING_HR:
      return "待签署";
    case ContractStatus.APPROVED:
      return "已签署";
    case ContractStatus.REJECTED:
    case ContractStatus.TERMINATED:
      return "已作废";
    case ContractStatus.EXPIRED:
      return "即将到期";
    default:
      return status;
  }
};

const getStatusColor = (status: ContractStatus): string => {
  switch (status) {
    case ContractStatus.PENDING_DEPT:
    case ContractStatus.PENDING_HR:
      return "bg-blue-100 text-blue-800";
    case ContractStatus.APPROVED:
      return "bg-green-100 text-green-800";
    case ContractStatus.REJECTED:
    case ContractStatus.TERMINATED:
      return "bg-red-100 text-red-800";
    case ContractStatus.EXPIRED:
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
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

const isContractExpired = (endDate: string): boolean => {
  try {
    const today = new Date();
    const contractEndDate = new Date(endDate);
    return today > contractEndDate;
  } catch (error) {
    console.error("日期转换错误:", error);
    return false;
  }
};

const isContractExpiringSoon = (endDate: string): boolean => {
  try {
    const today = new Date();
    const contractEndDate = new Date(endDate);
    const diffTime = contractEndDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  } catch (error) {
    console.error("日期转换错误:", error);
    return false;
  }
};

const getExpiryStatusText = (endDate: string): string => {
  if (isContractExpired(endDate)) {
    return "已到期";
  } else if (isContractExpiringSoon(endDate)) {
    return "即将到期";
  } else {
    return "";
  }
};

const getExpiryStatusStyle = (endDate: string): string => {
  if (isContractExpired(endDate)) {
    return "bg-red-100 text-red-800";
  } else if (isContractExpiringSoon(endDate)) {
    return "bg-amber-100 text-amber-800";
  } else {
    return "";
  }
};

const getStatusColorValue = (status: ContractStatus): string => {
  switch (status) {
    case ContractStatus.PENDING_DEPT:
    case ContractStatus.PENDING_HR:
      return "#3b82f6"; // 蓝色
    case ContractStatus.APPROVED:
      return "#10b981"; // 绿色
    case ContractStatus.REJECTED:
    case ContractStatus.TERMINATED:
      return "#ef4444"; // 红色
    case ContractStatus.EXPIRED:
      return "#f59e0b"; // 琥珀色
    default:
      return "#6b7280"; // 灰色
  }
};

// 自定义筛选类型
type StatusFilterType = "all" | ContractStatus;
type ExpiryFilterType = "all" | "expiring_soon" | "expired";

const MyContracts = () => {
  const { user } = useAuth();
  const { contracts, loading } = useContracts();
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilterType>("all");
  const [searchText, setSearchText] = useState("");

  if (!user) return null;

  const myContracts = contracts.filter(contract => contract.teacherId === user.id);

  const activeContracts = myContracts.filter(contract => contract.status === ContractStatus.APPROVED);
  const pendingContracts = myContracts.filter(
    contract => [ContractStatus.PENDING_DEPT, ContractStatus.PENDING_HR].includes(contract.status)
  );
  const expiredContracts = myContracts.filter(contract => contract.status === ContractStatus.EXPIRED);
  const rejectedContracts = myContracts.filter(
    contract => [ContractStatus.REJECTED, ContractStatus.TERMINATED].includes(contract.status)
  );
  const archivedContracts = myContracts.filter(contract => contract.status === ContractStatus.ARCHIVED);
  
  // 计算即将到期的合同（30天内到期但尚未到期）
  const expiringSoonContracts = myContracts.filter(
    contract => isContractExpiringSoon(contract.endDate)
  );
  
  // 计算已到期的合同（已过结束日期）
  const actuallyExpiredContracts = myContracts.filter(
    contract => isContractExpired(contract.endDate)
  );

  const filteredContracts = myContracts.filter(contract => {
    // 搜索过滤
    if (
      searchText &&
      !contract.title.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }
    
    // 状态过滤
    if (statusFilter !== "all" && contract.status !== statusFilter) {
      return false;
    }
    
    // 期限过滤
    if (expiryFilter === "expiring_soon" && !isContractExpiringSoon(contract.endDate)) {
      return false;
    }
    
    if (expiryFilter === "expired" && !isContractExpired(contract.endDate)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">我的合同</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">已签署合同</CardTitle>
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
            <CardTitle className="text-sm font-medium">待签署</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              等待签署的合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
            <AlertCircle className="h-4 w-4 text-status-expired" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringSoonContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              即将到期的合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">已作废</CardTitle>
            <AlertCircle className="h-4 w-4 text-status-rejected" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              已作废的合同
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">已归档</CardTitle>
            <FileBarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              已归档的合同
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>我的合同</CardTitle>
          <CardDescription>您的所有合同记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <div className="w-[180px]">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilterType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="合同状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value={ContractStatus.PENDING_DEPT}>待签署</SelectItem>
                    <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                    <SelectItem value={ContractStatus.REJECTED}>已作废</SelectItem>
                    <SelectItem value={ContractStatus.ARCHIVED}>已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-[180px]">
                <Select
                  value={expiryFilter}
                  onValueChange={(value) => setExpiryFilter(value as ExpiryFilterType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="期限状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有期限</SelectItem>
                    <SelectItem value="expiring_soon">即将到期</SelectItem>
                    <SelectItem value="expired">已到期</SelectItem>
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
                  ? "您还没有任何合同。"
                  : "尝试更改过滤条件以查看更多合同。"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts.map((contract) => (
                <Card key={contract.id} className="overflow-hidden hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: getStatusColorValue(contract.status as ContractStatus) }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold">{contract.title}</CardTitle>
                      <Badge className={getStatusColor(contract.status as ContractStatus)}>
                        {translateStatus(contract.status as ContractStatus)}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm mt-1">合同编号: {contract.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-muted-foreground text-xs">合同类型</p>
                        <p className="font-medium">{translateType(contract.type)}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-muted-foreground text-xs">职位</p>
                        <p className="font-medium">{contract.data?.position || "未指定"}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-muted-foreground text-xs">开始日期</p>
                        <p className="font-medium">{new Date(contract.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-muted-foreground text-xs">结束日期</p>
                        <p className="font-medium">{new Date(contract.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {contract.data && contract.data.details && (
                      <div className="bg-gray-50 p-2 rounded mt-2">
                        <p className="text-muted-foreground text-xs mb-1">合同详情</p>
                        <p className="text-sm line-clamp-2">{contract.data.details}</p>
                      </div>
                    )}
                    
                    {(isContractExpiringSoon(contract.endDate) || isContractExpired(contract.endDate)) && (
                      <div className="flex items-center mt-2 bg-gray-50 p-2 rounded">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                        <Badge className={getExpiryStatusStyle(contract.endDate)}>
                          {getExpiryStatusText(contract.endDate)}
                        </Badge>
                        {isContractExpiringSoon(contract.endDate) && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            剩余 {Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyContracts;
