
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Eye,
  ArrowUpDown,
  UserCircle,
  CalendarDays,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Mock data for pending approvals
const approvalsMockData = [
  {
    id: "apr001",
    applicantId: "u1",
    applicantName: "张三",
    title: "教学型合同申请",
    type: "新签",
    submittedAt: "2025-04-10T08:30:00Z",
    department: "计算机学院",
    status: "待审核",
    urgency: "normal",
  },
  {
    id: "apr002",
    applicantId: "u2",
    applicantName: "李四",
    title: "科研型合同续签",
    type: "续签",
    submittedAt: "2025-04-12T09:45:00Z",
    department: "计算机学院",
    status: "待审核",
    urgency: "urgent",
  },
  {
    id: "apr003",
    applicantId: "u3",
    applicantName: "王五",
    title: "教学科研型合同申请",
    type: "新签",
    submittedAt: "2025-04-13T14:20:00Z",
    department: "计算机学院",
    status: "待审核",
    urgency: "normal",
  },
  {
    id: "apr004",
    applicantId: "u4",
    applicantName: "赵六",
    title: "实验教学岗位合同",
    type: "新签",
    submittedAt: "2025-04-14T11:15:00Z",
    department: "计算机学院",
    status: "待审核",
    urgency: "normal",
  },
  {
    id: "apr005",
    applicantId: "u5",
    applicantName: "钱七",
    title: "教学型合同变更",
    type: "变更",
    submittedAt: "2025-04-15T10:30:00Z",
    department: "计算机学院",
    status: "待审核",
    urgency: "urgent",
  },
];

const Approvals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [sortField, setSortField] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleApprove = (id: string) => {
    toast({
      title: "操作成功",
      description: `申请 ${id} 已审批通过`,
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: "操作成功",
      description: `申请 ${id} 已被驳回`,
    });
  };

  const handleView = (id: string) => {
    navigate(`/approvals/${id}`);
  };

  // Filter and sort approvals
  const filteredApprovals = approvalsMockData
    .filter(approval => {
      // Search filter
      const matchesSearch = approval.applicantName.includes(searchTerm) || 
                           approval.title.includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusFilter === "all" || approval.status === statusFilter;
      
      // Urgency filter
      const matchesUrgency = urgencyFilter === "all" || approval.urgency === urgencyFilter;
      
      return matchesSearch && matchesStatus && matchesUrgency;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortField === "submittedAt") {
        return sortOrder === "asc" 
          ? new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
          : new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else if (sortField === "applicantName") {
        return sortOrder === "asc"
          ? a.applicantName.localeCompare(b.applicantName)
          : b.applicantName.localeCompare(a.applicantName);
      } else if (sortField === "urgency") {
        const urgencyOrder = { urgent: 1, normal: 2 };
        return sortOrder === "asc"
          ? (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 999) - (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 999)
          : (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 999) - (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 999);
      }
      return 0;
    });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">合同审批</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索申请..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="待审核">待审核</SelectItem>
              <SelectItem value="已通过">已通过</SelectItem>
              <SelectItem value="已驳回">已驳回</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="紧急程度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有</SelectItem>
              <SelectItem value="urgent">紧急</SelectItem>
              <SelectItem value="normal">普通</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          共 <span className="font-medium">{filteredApprovals.length}</span> 条记录
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>待审批合同</CardTitle>
          <CardDescription>查看并处理待审批的合同申请</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">序号</TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("applicantName")}
                  >
                    申请人
                    {sortField === "applicantName" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "transform rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>申请标题</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("submittedAt")}
                  >
                    提交时间
                    {sortField === "submittedAt" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "transform rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("urgency")}
                  >
                    紧急程度
                    {sortField === "urgency" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "transform rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    暂无待审批合同
                  </TableCell>
                </TableRow>
              ) : (
                filteredApprovals.map((approval, index) => (
                  <TableRow key={approval.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span>{approval.applicantName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{approval.title}</TableCell>
                    <TableCell>
                      <Badge variant={
                        approval.type === "新签" ? "default" :
                        approval.type === "续签" ? "secondary" :
                        "outline"
                      }>
                        {approval.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {new Date(approval.submittedAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {approval.urgency === "urgent" ? (
                        <Badge variant="destructive" className="flex gap-1 items-center">
                          <Clock className="h-3 w-3" /> 紧急
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex gap-1 items-center">
                          <Clock className="h-3 w-3" /> 普通
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(approval.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(approval.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(approval.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Approvals;
