
import React, { useState } from "react";
import { useContracts } from "@/contexts/ContractContext";
import { useUsers } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractStatus } from "@/types";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle, FileText, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ContractsManagement = () => {
  const { contracts, loading } = useContracts();
  const { users, loading: usersLoading } = useUsers();
  const location = useLocation();
  const [timeRange, setTimeRange] = useState("year");
  
  // Determine if we're in the contract list view
  const isContractList = location.pathname === "/contract-list";

  // Get teacher name by ID
  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(user => user.id === teacherId);
    return teacher ? teacher.name : "未知教师";
  };

  // 获取即将到期的合同（30天内）
  const expiringContracts = contracts.filter(contract => {
    if (contract.status !== ContractStatus.APPROVED) return false;
    const endDate = new Date(contract.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  // 统计数据
  const contractsByType = [
    { name: "教学型", value: contracts.filter(c => c.type === "teaching").length },
    { name: "科研型", value: contracts.filter(c => c.type === "research").length },
    { name: "教学科研型", value: contracts.filter(c => c.type === "both").length },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  if (isContractList) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">全校合同列表</h2>
          <Button variant="outline" onClick={() => window.history.back()}>返回</Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {loading || usersLoading ? (
              <div className="text-center py-4">加载中...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>合同标题</TableHead>
                    <TableHead>教师姓名</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>开始日期</TableHead>
                    <TableHead>结束日期</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.title}</TableCell>
                      <TableCell>{getTeacherName(contract.teacherId)}</TableCell>
                      <TableCell>{contract.type}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            contract.status === ContractStatus.APPROVED
                              ? "bg-status-approved/10 text-status-approved"
                              : contract.status === ContractStatus.REJECTED
                              ? "bg-status-rejected/10 text-status-rejected"
                              : "bg-status-pending/10 text-status-pending"
                          }`}
                        >
                          {contract.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/contracts/${contract.id}`}>
                            查看详情
                          </Link>
                        </Button>
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
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">合同管理</h2>
        <div className="flex gap-2">
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
          <Button asChild>
            <Link to="/contract-list">
              <FileText className="w-4 h-4 mr-2" />
              查看所有合同
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                即将到期的合同
              </CardTitle>
              <CardDescription>显示30天内即将到期的合同</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading || usersLoading ? (
              <div className="text-center py-4">加载中...</div>
            ) : expiringContracts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                暂无即将到期的合同
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>合同标题</TableHead>
                    <TableHead>教师姓名</TableHead>
                    <TableHead>开始日期</TableHead>
                    <TableHead>到期日期</TableHead>
                    <TableHead>剩余天数</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringContracts.map(contract => {
                    const endDate = new Date(contract.endDate);
                    const now = new Date();
                    const diffTime = endDate.getTime() - now.getTime();
                    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    return (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.title}</TableCell>
                        <TableCell>{getTeacherName(contract.teacherId)}</TableCell>
                        <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="text-yellow-500 font-medium">
                            {daysLeft}天
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/contracts/${contract.id}`}>
                              查看详情
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>合同类型分布</CardTitle>
              <CardDescription>按合同类型统计分布情况</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contractsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contractsByType.map((entry, index) => (
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

      <Card>
        <CardHeader>
          <CardTitle>最近更新的合同</CardTitle>
          <CardDescription>显示最近更新的10份合同</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || usersLoading ? (
            <div className="text-center py-4">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同标题</TableHead>
                  <TableHead>教师姓名</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 10)
                  .map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.title}</TableCell>
                      <TableCell>{getTeacherName(contract.teacherId)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            contract.status === ContractStatus.APPROVED
                              ? "bg-status-approved/10 text-status-approved"
                              : contract.status === ContractStatus.REJECTED
                              ? "bg-status-rejected/10 text-status-rejected"
                              : "bg-status-pending/10 text-status-pending"
                          }`}
                        >
                          {contract.status === ContractStatus.APPROVED
                            ? "已批准"
                            : contract.status === ContractStatus.REJECTED
                            ? "已拒绝"
                            : "审批中"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(contract.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/contracts/${contract.id}`}>
                            查看详情
                          </Link>
                        </Button>
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

export default ContractsManagement;
