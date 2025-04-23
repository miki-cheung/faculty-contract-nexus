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
import { ClipboardSignature } from "lucide-react";

const ContractsManagement = () => {
  const { contracts, loading } = useContracts();
  const { users, loading: usersLoading } = useUsers();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const isContractList = location.pathname === "/contract-list";

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(user => user.id === teacherId);
    return teacher ? teacher.name : "未知教师";
  };

  let archivedContracts = contracts.filter(contract => {
    if (contract.status !== ContractStatus.APPROVED) return false;
    const endDate = new Date(contract.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  if (archivedContracts.length === 0) {
    archivedContracts = [
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

  const draftContracts = contracts.filter(
    (contract) => contract.status === ContractStatus.DRAFT
  ).length;
  const pendingContracts = contracts.filter(
    (contract) =>
      contract.status === ContractStatus.PENDING_DEPT ||
      contract.status === ContractStatus.PENDING_HR
  ).length;
  const approvedContracts = contracts.filter(
    (contract) => contract.status === ContractStatus.APPROVED
  ).length;
  const rejectedContracts = contracts.filter(
    (contract) =>
      contract.status === ContractStatus.REJECTED ||
      contract.status === ContractStatus.TERMINATED
  ).length;
  const archivedContractsCount = contracts.filter(
    (contract) => contract.status === ContractStatus.ARCHIVED
  ).length;
  const unsignedContracts = contracts.filter(
    (contract) => 
      contract.status === ContractStatus.DRAFT || 
      contract.status === ContractStatus.PENDING_DEPT || 
      contract.status === ContractStatus.PENDING_HR
  ).length;

  if (isContractList) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">全校合同列表</h2>
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
            <option value="PENDING_DEPT">待部门审批</option>
            <option value="PENDING_HR">待人事审批</option>
            <option value="APPROVED">已批准</option>
            <option value="REJECTED">已拒绝</option>
            <option value="ARCHIVED">已归档</option>
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
                          <Select 
                            value={contract.status} 
                            onValueChange={(newStatus) => {
                              console.log(`将合同 ${contract.id} 的状态从 ${contract.status} 更改为 ${newStatus}`);
                              // 这里可以添加更新合同状态的逻辑
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs min-w-[120px] border-none shadow-none p-0 bg-transparent">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                待签署
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ContractStatus.PENDING_DEPT}>待签署</SelectItem>
                              <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                              <SelectItem value={ContractStatus.REJECTED}>已作废</SelectItem>
                              <SelectItem value={ContractStatus.ARCHIVED}>已归档</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{contract.startDate}</TableCell>
                        <TableCell>{contract.endDate}</TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs px-2 py-1 h-auto border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                              onClick={() => {
                                console.log(`编辑合同: ${contract.id}`);
                                // 处理编辑逻辑
                              }}
                            >
                              编辑
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs px-2 py-1 h-auto border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => {
                                console.log(`删除合同: ${contract.id}`);
                                // 处理删除逻辑
                              }}
                            >
                              删除
                            </Button>
                          </div>
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
    <div className="container mx-auto py-8 space-y-4">
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
          <Button variant="outline" className="border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-1" asChild>
            <Link to="/admin/contracts/list">
              <FileText className="w-4 w-4" />
              查看所有合同
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 grid-rows-2 gap-6 mb-8">
        {/* 总合同数 - 左侧大卡片 */}
        <div className="row-span-2 col-span-1 bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <div className="text-lg font-medium text-gray-700 mb-1">合同数量</div>
          <div className="flex-grow flex flex-col items-start justify-center space-y-4">
            <div className="text-5xl font-bold mb-4 self-start">{contracts.length}</div>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></span>
                  <span className="text-sm">已签署</span>
                  <span className="text-sm font-semibold ml-1">
                    {Math.round((approvedContracts / Math.max(contracts.length, 1)) * 100)}%
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-300 mr-2"></span>
                  <span className="text-sm">未签署</span>
                  <span className="text-sm font-semibold ml-1">
                    {Math.round((unsignedContracts / Math.max(contracts.length, 1)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-28 h-28 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* 背景圆环 */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e6e6e6" strokeWidth="15" />
                  
                  {/* 已签署部分 - 蓝色 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="15"
                    strokeDasharray={`${Math.round((approvedContracts / Math.max(contracts.length, 1)) * 251.2)} 251.2`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                  
                  {/* 未签署部分 - 浅蓝色 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="15"
                    strokeDasharray={`${Math.round((unsignedContracts / Math.max(contracts.length, 1)) * 251.2)} 251.2`}
                    strokeDashoffset={`${-Math.round((approvedContracts / Math.max(contracts.length, 1)) * 251.2)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* 已签署 */}
        <div className="col-span-1 row-span-1 bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-medium text-gray-700">已签署</div>
              <div className="text-5xl font-bold mt-2">{approvedContracts}</div>
            </div>
            <div className="p-2 rounded-md border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
        </div>
        {/* 待续签 */}
        <div className="col-span-1 row-span-1 bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-medium text-gray-700">待续签</div>
              <div className="text-5xl font-bold mt-2">{archivedContracts.length}</div>
            </div>
            <div className="p-2 rounded-md border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        {/* 签署中 */}
        <div className="col-span-1 row-span-1 bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-medium text-gray-700">签署中</div>
              <div className="text-5xl font-bold mt-2">{pendingContracts + approvedContracts}</div>
            </div>
            <div className="p-2 rounded-md border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        {/* 未签署 */}
        <div className="col-span-1 row-span-1 bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-medium text-gray-700">未签署</div>
              <div className="text-5xl font-bold mt-2">{unsignedContracts}</div>
            </div>
            <div className="p-2 rounded-md border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        {/* 已归档 */}
        <div className="col-span-1 row-span-1 bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-medium text-gray-700">已归档</div>
              <div className="text-5xl font-bold mt-2">{draftContracts}</div>
            </div>
            <div className="p-2 rounded-md border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        {/* 已作废 */}
        <div className="col-span-1 row-span-1 bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-medium text-gray-700">已作废</div>
              <div className="text-5xl font-bold mt-2">{rejectedContracts}</div>
            </div>
            <div className="p-2 rounded-md border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
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
              {archivedContracts.map((contract) => {
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
            <table className="min-w-full bg-gray-50">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-left font-medium text-gray-500">合同标题</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">教师姓名</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">状态</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">开始时间</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">结束时间</th>
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
                    <tr key={contract.id} className="hover:bg-gray-100">
                      <td className="py-3 px-4 border-b border-gray-100">{contract.title}</td>
                      <td className="py-3 px-4 border-b border-gray-100">{getTeacherName(contract.teacherId)}</td>
                      <td className="py-3 px-4 border-b border-gray-100">
                        <Select 
                          value={contract.status} 
                          onValueChange={(newStatus) => {
                            console.log(`将合同 ${contract.id} 的状态从 ${contract.status} 更改为 ${newStatus}`);
                            // 这里可以添加更新合同状态的逻辑
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs min-w-[120px] border-none shadow-none p-0 bg-transparent">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              待签署
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ContractStatus.PENDING_DEPT}>待签署</SelectItem>
                            <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                            <SelectItem value={ContractStatus.REJECTED}>已作废</SelectItem>
                            <SelectItem value={ContractStatus.ARCHIVED}>已归档</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100">
                        {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100">
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100">{new Date(contract.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 border-b border-gray-100 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs px-2 py-1 h-auto border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            onClick={() => {
                              console.log(`编辑合同: ${contract.id}`);
                              // 处理编辑逻辑
                            }}
                          >
                            编辑
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs px-2 py-1 h-auto border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => {
                              console.log(`删除合同: ${contract.id}`);
                              // 处理删除逻辑
                            }}
                          >
                            删除
                          </Button>
                        </div>
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
