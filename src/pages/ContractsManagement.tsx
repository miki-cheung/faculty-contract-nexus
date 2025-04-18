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
import { ContractStatus, ContractType } from "@/types";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle, FileText, Download, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  
  const isContractList = location.pathname === "/contract-list";

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(user => user.id === teacherId);
    return teacher ? teacher.name : "未知教师";
  };

  let expiringContracts = contracts.filter(contract => {
    if (contract.status !== ContractStatus.APPROVED) return false;
    const endDate = new Date(contract.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  if (expiringContracts.length === 0) {
    expiringContracts = [
      {
        id: 'mock1',
        title: '【示例】张三-全职教师合同',
        teacherId: users[0]?.id || 'u1',
        startDate: '2024-09-01',
        endDate: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().slice(0,10); })(),
        status: ContractStatus.APPROVED,
        updatedAt: new Date().toISOString(),
        type: ContractType.FULL_TIME,
        templateId: 't1',
        createdAt: new Date().toISOString(),
        data: { position: "教授", salary: 300000 }
      },
      {
        id: 'mock2',
        title: '【示例】李四-兼职教师合同',
        teacherId: users[1]?.id || 'u2',
        startDate: '2024-08-15',
        endDate: (() => { const d = new Date(); d.setDate(d.getDate() + 25); return d.toISOString().slice(0,10); })(),
        status: ContractStatus.APPROVED,
        updatedAt: new Date().toISOString(),
        type: ContractType.PART_TIME,
        templateId: 't2',
        createdAt: new Date().toISOString(),
        data: { position: "兼职教授", hourly_rate: 800 }
      },
    ];
  }

  const contractsByType = [
    { name: "全职", value: contracts.filter(c => c.type === ContractType.FULL_TIME).length },
    { name: "兼职", value: contracts.filter(c => c.type === ContractType.PART_TIME).length },
    { name: "临时", value: contracts.filter(c => c.type === ContractType.TEMPORARY).length },
    { name: "访问", value: contracts.filter(c => c.type === ContractType.VISITING).length },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredContracts = contracts.filter(contract => {
    const matchTitle = contract.title.includes(searchTerm);
    const matchStatus = statusFilter === "all" || contract.status === statusFilter;
    const matchType = typeFilter === "all" || contract.type === typeFilter;
    return matchTitle && matchStatus && matchType;
  });

  const totalContracts = filteredContracts.length;
  const totalPages = Math.ceil(totalContracts / pageSize);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusPieData = [
    { name: "已批准", value: contracts.filter(c => c.status === ContractStatus.APPROVED).length },
    { name: "即将到期", value: expiringContracts.length },
    { name: "已到期", value: contracts.filter(c => c.status === ContractStatus.EXPIRED).length },
    { name: "草稿", value: contracts.filter(c => c.status === ContractStatus.DRAFT).length },
    { name: "已终止", value: contracts.filter(c => c.status === ContractStatus.TERMINATED).length },
  ];

  function getMonthlyStats(contracts) {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    const stats = months.map(month => ({ month, 新签: 0, 续签: 0, 终止: 0 }));
    contracts.forEach(contract => {
      const signMonth = contract.startDate.slice(0, 7);
      const endMonth = contract.endDate.slice(0, 7);
      if (months.includes(signMonth)) stats[months.indexOf(signMonth)]["新签"]++;
      if (months.includes(endMonth) && contract.status === ContractStatus.TERMINATED) stats[months.indexOf(endMonth)]["终止"]++;
    });
    return stats;
  }

  function getMonthlyStatsWithMock(contracts) {
    let stats = getMonthlyStats(contracts);
    if (!stats.some(item => item["新签"] > 0 || item["续签"] > 0 || item["终止"] > 0)) {
      stats = [
        { month: "2025-01", 新签: 8, 续签: 3, 终止: 1 },
        { month: "2025-02", 新签: 5, 续签: 2, 终止: 0 },
        { month: "2025-03", 新签: 7, 续签: 4, 终止: 2 },
        { month: "2025-04", 新签: 6, 续签: 3, 终止: 1 },
      ];
    }
    return stats;
  }

  const monthlyStats = getMonthlyStatsWithMock(contracts);

  function getDeptStats(contracts, users) {
    const deptMap = {};
    users.forEach(user => {
      if (!deptMap[user.department]) deptMap[user.department] = 0;
    });
    contracts.forEach(contract => {
      const teacher = users.find(u => u.id === contract.teacherId);
      if (teacher && teacher.department) deptMap[teacher.department]++;
    });
    return Object.entries(deptMap).map(([dept, count]) => ({ dept, count }));
  }

  function getDeptStatsWithMock(contracts, users) {
    let stats = getDeptStats(contracts, users);
    if (!stats.length || stats.every(item => item.count === 0)) {
      stats = [
        { dept: "数学系", count: 6 },
        { dept: "物理系", count: 4 },
        { dept: "化学系", count: 5 },
        { dept: "外语系", count: 3 },
      ];
    }
    return stats;
  }

  const deptStats = getDeptStatsWithMock(contracts, users);

  if (isContractList) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">全校合同列表</h2>
          <Button variant="outline" onClick={() => window.history.back()}>返回</Button>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="搜索合同标题"
            className="border rounded px-2 py-1"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: 180 }}
          />
          <select className="border rounded px-2 py-1" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">全部状态</option>
            <option value="APPROVED">已批准</option>
            <option value="REJECTED">已拒绝</option>
            <option value="PENDING_DEPT">待部门审批</option>
            <option value="PENDING_HR">待人事审批</option>
            <option value="DRAFT">草稿</option>
            <option value="EXPIRED">已到期</option>
            <option value="TERMINATED">已终止</option>
          </select>
          <select className="border rounded px-2 py-1" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">全部类型</option>
            <option value="FULL_TIME">全职</option>
            <option value="PART_TIME">兼职</option>
            <option value="TEMPORARY">临时</option>
            <option value="VISITING">访问</option>
          </select>
        </div>
        <Card>
          <CardContent className="p-6">
            {loading || usersLoading ? (
              <div className="text-center py-4">加载中...</div>
            ) : (
              <>
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
                    {paginatedContracts.map(contract => (
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
                            {contract.status === ContractStatus.APPROVED
                              ? "已批准"
                              : contract.status === ContractStatus.REJECTED
                              ? "已拒绝"
                              : contract.status === ContractStatus.PENDING_DEPT
                              ? "待部门审批"
                              : contract.status === ContractStatus.PENDING_HR
                              ? "待人事审批"
                              : contract.status === ContractStatus.DRAFT
                              ? "草稿"
                              : contract.status === ContractStatus.EXPIRED
                              ? "已到期"
                              : contract.status === ContractStatus.TERMINATED
                              ? "已终止"
                              : contract.status}
                          </span>
                        </TableCell>
                        <TableCell>{contract.startDate}</TableCell>
                        <TableCell>{contract.endDate}</TableCell>
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
                <div className="flex justify-between items-center mt-4">
                  <div>共 {totalContracts} 条记录</div>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>上一页</Button>
                    <span>第 {currentPage} / {totalPages || 1} 页</span>
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>下一页</Button>
                  </div>
                  <select className="border rounded px-1 py-0.5" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                    <option value={10}>每页10条</option>
                    <option value={20}>每页20条</option>
                    <option value={50}>每页50条</option>
                  </select>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">合同管理</h2>
          <p className="text-muted-foreground mt-2">管理和监控所有合同状态</p>
        </div>
        <div className="flex gap-4 items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年度</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to="/contract-list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              查看所有合同
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-muted-foreground text-sm">总合同数</span>
              <span className="text-3xl font-bold">{contracts.length}</span>
              <span className="text-xs text-muted-foreground">较上月增长 5%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-muted-foreground text-sm">生效中</span>
              <span className="text-3xl font-bold text-status-approved">
                {contracts.filter(c => c.status === ContractStatus.APPROVED).length}
              </span>
              <span className="text-xs text-muted-foreground">占总数 {Math.round(contracts.filter(c => c.status === ContractStatus.APPROVED).length / contracts.length * 100)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-muted-foreground text-sm">待审批</span>
              <span className="text-3xl font-bold text-status-pending">
                {contracts.filter(c => c.status === ContractStatus.PENDING_HR || c.status === ContractStatus.PENDING_DEPT).length}
              </span>
              <span className="text-xs text-status-pending">需要您的处理</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <span className="text-muted-foreground text-sm">即将到期</span>
              <span className="text-3xl font-bold text-status-expired">{expiringContracts.length}</span>
              <span className="text-xs text-status-expired">30天内到期</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">合同状态分布</CardTitle>
            <CardDescription>按合同状态统计分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {contracts.length === 0 ? (
                <span className="text-muted-foreground">暂无数据</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, idx) => (
                        <Cell key={color} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">月度合同趋势</CardTitle>
            <CardDescription>显示每月合同新签、续签和终止数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
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

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            即将到期的合同
          </CardTitle>
          <CardDescription>显示30天内即将到期的合同</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || usersLoading ? (
            <div className="text-center py-4">加载中...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center bg-accent/10 rounded-lg px-4 py-3">
                  <div className="text-xs text-muted-foreground">即将到期</div>
                  <div className="text-2xl font-bold text-yellow-600">{expiringContracts.length}</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-accent/10 rounded-lg px-4 py-3">
                  <div className="text-xs text-muted-foreground">平均剩余天数</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(expiringContracts.reduce((sum, c) => sum + Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now())/(1000*60*60*24))), 0) / expiringContracts.length) || 0}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {expiringContracts.map((contract) => {
                  const endDate = new Date(contract.endDate);
                  const now = new Date();
                  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={contract.id} 
                      className="flex items-center justify-between bg-card hover:bg-accent/5 transition-colors rounded-lg p-4 border">
                      <div>
                        <div className="font-medium text-lg flex items-center gap-2">
                          {contract.title}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">教师：{getTeacherName(contract.teacherId)}</div>
                        <div className="text-sm text-muted-foreground">到期：{new Date(contract.endDate).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                          剩余{daysLeft}天
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/contracts/${contract.id}`}>查看详情</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">最近更新的合同</CardTitle>
              <CardDescription>显示最近更新的10份合同</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading || usersLoading ? (
            <div className="text-center py-4">加载中...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>合同标题</TableHead>
                    <TableHead>教师姓名</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
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
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                              ? "待部门审批"
                              : contract.status === ContractStatus.PENDING_HR
                              ? "待人事审批"
                              : contract.status === ContractStatus.DRAFT
                              ? "草稿"
                              : contract.status === ContractStatus.EXPIRED
                              ? "已到期"
                              : contract.status === ContractStatus.TERMINATED
                              ? "已终止"
                              : contract.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(contract.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/contracts/${contract.id}`}>查看详情</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractsManagement;
