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
import { FilePen, FileCheck, FileCheck2, FileX, Clock, FilePlus } from "lucide-react";

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
          <div className="flex gap-2">
            <Button variant="default" asChild>
              <Link to="/create-contract" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                创建合同
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>返回</Button>
          </div>
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
    <div className="container mx-auto py-8 space-y-4 bg-[#F6F5FF]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold">合同管理</h1>
            <p className="text-gray-500">管理所有教师合同</p>
          </div>
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
            asChild
          >
            <Link to="/admin/contracts/create">
              <FilePlus className="w-4 h-4" />
              创建合同
            </Link>
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年度</option>
            <option value="all">全部</option>
          </select>
          <Button variant="outline" className="border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-1" asChild>
            <Link to="/admin/contracts/list">
              <FileText className="w-4 w-4" />
              查看所有合同
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-md p-4 flex items-center border shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-blue-500 text-white mr-4">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">总合同数</div>
            <div className="text-xl font-medium">{contracts.length}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-md p-4 flex items-center border shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gray-500 text-white mr-4">
            <FilePen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">草稿</div>
            <div className="text-xl font-medium">{contracts.filter(c => c.status === ContractStatus.DRAFT).length}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-md p-4 flex items-center border shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-yellow-500 text-white mr-4">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">待签署</div>
            <div className="text-xl font-medium">
              {contracts.filter(c => 
                c.status === ContractStatus.PENDING_DEPT || 
                c.status === ContractStatus.PENDING_HR
              ).length}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-md p-4 flex items-center border shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-green-500 text-white mr-4">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">已签署</div>
            <div className="text-xl font-medium">{contracts.filter(c => c.status === ContractStatus.APPROVED).length}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-md p-4 flex items-center border shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-red-500 text-white mr-4">
            <FileX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">已作废</div>
            <div className="text-xl font-medium">
              {contracts.filter(c => 
                c.status === ContractStatus.REJECTED || 
                c.status === ContractStatus.TERMINATED
              ).length}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-md p-4 flex items-center border shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-amber-500 text-white mr-4">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">即将到期</div>
            <div className="text-xl font-medium">{expiringContracts.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              即将到期的合同
            </h3>
            <p className="text-sm text-gray-500">显示30天内即将到期的合同</p>
          </div>
        </div>
        {loading || usersLoading ? (
          <div className="text-center py-4">加载中...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {expiringContracts.map((contract) => {
                const endDate = new Date(contract.endDate);
                const now = new Date();
                const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <div key={contract.id} 
                    className="bg-white border border-gray-100 rounded-md overflow-hidden">
                    <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50">
                      <div className="text-sm font-medium line-clamp-1 pr-2">
                        {contract.title}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="space-y-2 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>{getTeacherName(contract.teacherId)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>到期：{new Date(contract.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          剩余{daysLeft}天
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">签署中的合同</h3>
            <p className="text-sm text-gray-500">显示当前正在签署流程中的合同</p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1 border border-blue-500 text-blue-500 hover:bg-blue-50">
            <Download className="h-4 w-4" />
            导出
          </Button>
        </div>
        {loading || usersLoading ? (
          <div className="text-center py-4">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-left font-medium text-gray-500">合同标题</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">教师姓名</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">当前阶段</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">创建时间</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {contracts
                  .filter(contract => 
                    contract.status === ContractStatus.PENDING_DEPT || 
                    contract.status === ContractStatus.PENDING_HR)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map((contract, index) => (
                    <tr key={contract.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                      <td className="py-3 px-4 border-b border-gray-100">{contract.title}</td>
                      <td className="py-3 px-4 border-b border-gray-100">{getTeacherName(contract.teacherId)}</td>
                      <td className="py-3 px-4 border-b border-gray-100">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            contract.status === ContractStatus.PENDING_DEPT
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {contract.status === ContractStatus.PENDING_DEPT
                            ? "部门审批中"
                            : "人事审批中"}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100">{new Date(contract.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 border-b border-gray-100 text-right">
                        {/* 查看详情按钮已移除 */}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsManagement;
