
import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContracts } from "@/contexts/ContractContext";
import { useUsers } from "@/contexts/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  Download, 
  RefreshCw, 
  Filter, 
  Search, 
  Plus, 
  FileText,
  ArrowDownUp,
  Eye,
} from "lucide-react";
import { ContractStatus, ContractType, UserRole } from "@/types";

// Mock data for department charts
const deptContractsByTypeData = [
  { name: "教学型", value: 15 },
  { name: "科研型", value: 10 },
  { name: "教学科研型", value: 18 },
];

const deptContractsByMonthData = [
  { name: "1月", 新签: 2, 续签: 1, 终止: 0 },
  { name: "2月", 新签: 1, 续签: 0, 终止: 0 },
  { name: "3月", 新签: 3, 续签: 1, 终止: 1 },
  { name: "4月", 新签: 1, 续签: 2, 终止: 0 },
  { name: "5月", 新签: 3, 续签: 1, 终止: 0 },
  { name: "6月", 新签: 2, 续签: 1, 终止: 1 },
  { name: "7月", 新签: 4, 续签: 3, 终止: 1 },
  { name: "8月", 新签: 6, 续签: 4, 终止: 2 },
  { name: "9月", 新签: 3, 续签: 2, 终止: 0 },
  { name: "10月", 新签: 1, 续签: 1, 终止: 0 },
  { name: "11月", 新签: 2, 续签: 2, 终止: 1 },
  { name: "12月", 新签: 4, 续签: 2, 终止: 1 },
];

const deptContractsByStatusData = [
  { name: "有效", value: 33 },
  { name: "即将到期", value: 5 },
  { name: "已到期", value: 3 },
];

const deptContractsByPositionData = [
  { name: "教授", count: 10 },
  { name: "副教授", count: 15 },
  { name: "讲师", count: 12 },
  { name: "助教", count: 6 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const DeptReports = () => {
  const { user } = useAuth();
  const { contracts, loading: contractsLoading } = useContracts();
  const { users, loading: usersLoading } = useUsers();
  const [timeRange, setTimeRange] = useState("year");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const downloadReport = (reportType: string) => {
    // In a real app, this would generate and download a report
    alert(`下载${reportType}报告`);
  };

  // Get teachers in the department
  const departmentTeachers = useMemo(() => {
    return users.filter(u => u.departmentId === user?.departmentId && u.role === UserRole.TEACHER);
  }, [users, user]);

  // Get department teacher IDs
  const departmentTeacherIds = useMemo(() => {
    return departmentTeachers.map(teacher => teacher.id);
  }, [departmentTeachers]);

  // Filter contracts based on department teachers
  const departmentContracts = useMemo(() => {
    return contracts.filter(contract => departmentTeacherIds.includes(contract.teacherId));
  }, [contracts, departmentTeacherIds]);

  // Get teacher name from user data
  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher ? teacher.name : "未知教师";
  };

  // Further filter by search term and status
  const filteredContracts = useMemo(() => {
    return departmentContracts.filter(contract => {
      const teacherName = getTeacherName(contract.teacherId);
      
      const matchesSearch = 
        contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacherName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && contract.status === ContractStatus.APPROVED) ||
        (statusFilter === "pending" && (contract.status === ContractStatus.PENDING_DEPT || contract.status === ContractStatus.PENDING_HR)) ||
        (statusFilter === "expired" && contract.status === ContractStatus.EXPIRED) ||
        (statusFilter === "terminated" && contract.status === ContractStatus.TERMINATED);
      
      return matchesSearch && matchesStatus;
    });
  }, [departmentContracts, searchTerm, statusFilter, users]);

  const loading = contractsLoading || usersLoading || isLoading;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">部门合同管理</h1>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年度</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Contract by Type */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>合同类型分布</CardTitle>
              <CardDescription>按合同类型统计分布情况</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadReport("合同类型分布")}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptContractsByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deptContractsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contract Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>合同状态分布</CardTitle>
              <CardDescription>按合同状态统计分布情况</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadReport("合同状态分布")}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptContractsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deptContractsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>部门合同列表</CardTitle>
              <CardDescription>管理部门内所有合同</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新建合同
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>创建新合同</DialogTitle>
                  <DialogDescription>
                    为部门教师创建新的合同
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Select>
                      <SelectTrigger className="col-span-4">
                        <SelectValue placeholder="选择教师" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentTeachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Select>
                      <SelectTrigger className="col-span-4">
                        <SelectValue placeholder="选择合同类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">教学型</SelectItem>
                        <SelectItem value="research">科研型</SelectItem>
                        <SelectItem value="both">教学科研型</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      className="col-span-4"
                      type="date"
                      placeholder="开始日期"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      className="col-span-4"
                      type="date"
                      placeholder="结束日期"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    取消
                  </Button>
                  <Button>创建合同</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索合同..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">有效</SelectItem>
                <SelectItem value="pending">审批中</SelectItem>
                <SelectItem value="expired">已到期</SelectItem>
                <SelectItem value="terminated">已终止</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同编号</TableHead>
                  <TableHead>教师</TableHead>
                  <TableHead>合同类型</TableHead>
                  <TableHead>开始日期</TableHead>
                  <TableHead>结束日期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      未找到合同数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id}</TableCell>
                      <TableCell>{getTeacherName(contract.teacherId)}</TableCell>
                      <TableCell>{contract.type}</TableCell>
                      <TableCell>{contract.startDate}</TableCell>
                      <TableCell>{contract.endDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            contract.status === ContractStatus.APPROVED
                              ? "default"
                              : contract.status === ContractStatus.PENDING_DEPT || contract.status === ContractStatus.PENDING_HR
                              ? "outline"
                              : contract.status === ContractStatus.EXPIRED
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {contract.status === ContractStatus.APPROVED
                            ? "有效"
                            : contract.status === ContractStatus.PENDING_DEPT || contract.status === ContractStatus.PENDING_HR
                            ? "审批中"
                            : contract.status === ContractStatus.EXPIRED
                            ? "已到期"
                            : "已终止"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/approvals/${contract.id}`}>
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            共 {filteredContracts.length} 条记录
          </div>
          {/* Pagination would go here */}
        </CardFooter>
      </Card>

      {/* Monthly Contract Trends */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>月度合同趋势</CardTitle>
            <CardDescription>显示每月合同新签、续签和终止数量</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadReport("月度合同趋势")}>
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptContractsByMonthData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="新签" fill="#8884d8" />
                <Bar dataKey="续签" fill="#82ca9d" />
                <Bar dataKey="终止" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeptReports;
