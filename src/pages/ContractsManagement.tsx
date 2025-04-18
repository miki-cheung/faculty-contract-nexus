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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

  // 搜索+筛选后的合同
  const filteredContracts = contracts.filter(contract => {
    const matchTitle = contract.title.includes(searchTerm);
    const matchStatus = statusFilter === "all" || contract.status === statusFilter;
    const matchType = typeFilter === "all" || contract.type === typeFilter;
    return matchTitle && matchStatus && matchType;
  });

  // 分页
  const totalContracts = filteredContracts.length;
  const totalPages = Math.ceil(totalContracts / pageSize);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 统计数据 - 使用正确的 ContractType 枚举值
  const contractsByType = [
    { name: "全职", value: contracts.filter(c => c.type === ContractType.FULL_TIME).length },
    { name: "兼职", value: contracts.filter(c => c.type === ContractType.PART_TIME).length },
    { name: "临时", value: contracts.filter(c => c.type === ContractType.TEMPORARY).length },
    { name: "访问", value: contracts.filter(c => c.type === ContractType.VISITING).length },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  if (isContractList) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">全校合同列表</h2>
          <Button variant="outline" onClick={() => window.history.back()}>返回</Button>
        </div>

        {/* 搜索、筛选、过滤控件 */}
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
                {/* 分页控件 */}
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
    <div className="container mx-auto py-6 space-y-6">
      {/* 顶部：合同管理标题和操作栏，始终显示在最上方 */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">合同管理</h2>
        <div className="flex gap-2">
          {/* 这里可添加导出、批量操作等按钮 */}
        </div>
      </div>

      {/* 统计图表区域：如无数据则显示提示 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 合同状态分布饼图 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>合同状态分布</CardTitle>
              <CardDescription>按合同状态统计分布情况</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {contracts.length === 0 ? (
                <span className="text-muted-foreground">暂无数据</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "有效", value: contracts.filter(c => c.status === ContractStatus.APPROVED).length },
                        { name: "即将到期", value: expiringContracts.length },
                        { name: "已到期", value: contracts.filter(c => c.status === ContractStatus.EXPIRED).length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
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
        {/* 月度合同趋势柱状图 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>月度合同趋势</CardTitle>
              <CardDescription>显示每月合同新签、续签和终止数量</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {/* 示例数据，实际可替换为后端数据 */}
              {contracts.length === 0 ? (
                <span className="text-muted-foreground">暂无数据</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getMonthlyStats(contracts)}
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
              )}
            </div>
          </CardContent>
        </Card>
        {/* 部门合同分布，仅人事管理员可见 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>部门合同分布</CardTitle>
              <CardDescription>按部门统计合同数量</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {contracts.length === 0 ? (
                <span className="text-muted-foreground">暂无数据</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getDeptStats(contracts, users)}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="dept" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 即将到期的合同卡片 */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              即将到期的合同
            </CardTitle>
            <CardDescription>30天内即将到期的合同</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {expiringContracts.length === 0 ? (
            <div className="text-muted-foreground">暂无即将到期的合同</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同标题</TableHead>
                  <TableHead>教师姓名</TableHead>
                  <TableHead>结束日期</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringContracts.map(contract => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.title}</TableCell>
                    <TableCell>{getTeacherName(contract.teacherId)}</TableCell>
                    <TableCell>{contract.endDate}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">即将到期</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 合同列表与分页...（原有内容） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

// 工具函数：生成月度统计数据
function getMonthlyStats(contracts) {
  // 生成最近12个月的月份标签
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  // 初始化数据结构
  const stats = months.map(month => ({ month, 新签: 0, 续签: 0, 终止: 0 }));
  contracts.forEach(contract => {
    const signMonth = contract.startDate.slice(0, 7);
    const endMonth = contract.endDate.slice(0, 7);
    if (months.includes(signMonth)) stats[months.indexOf(signMonth)]["新签"]++;
    if (months.includes(endMonth) && contract.status === ContractStatus.TERMINATED) stats[months.indexOf(endMonth)]["终止"]++;
    // 假定续签通过某字段判断，这里略
  });
  return stats;
}

// 工具函数：生成部门统计数据
function getDeptStats(contracts, users) {
  // 统计每个部门的合同数量
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

export default ContractsManagement;
