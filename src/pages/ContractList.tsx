import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useContracts } from "@/contexts/ContractContext";
import { useUsers } from "@/contexts/UserContext";
import { ContractStatus, ContractType } from "@/types";

const ContractList = () => {
  const { contracts, loading } = useContracts();
  const { getUser, getDepartment, loading: usersLoading } = useUsers();
  
  // 状态
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 获取教师姓名
  const getTeacherName = (teacherId: string) => {
    const teacher = getUser(teacherId);
    return teacher ? teacher.name : "未知教师";
  };
  
  // 获取部门名称
  const getDepartmentName = (teacherId: string) => {
    const teacher = getUser(teacherId);
    if (!teacher || !teacher.departmentId) return "未知部门";
    
    const department = getDepartment(teacher.departmentId);
    return department ? department.name : "未知部门";
  };
  
  // 过滤合同
  const filteredContracts = contracts.filter(contract => {
    // 搜索过滤
    const searchMatch = 
      searchTerm === "" || 
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTeacherName(contract.teacherId).toLowerCase().includes(searchTerm.toLowerCase());
    
    // 状态过滤
    const statusMatch = 
      statusFilter === "all" || 
      (statusFilter === "pending" && (contract.status === ContractStatus.PENDING_DEPT || contract.status === ContractStatus.PENDING_HR)) ||
      (statusFilter === "rejected" && (contract.status === ContractStatus.REJECTED || contract.status === ContractStatus.TERMINATED)) ||
      contract.status === statusFilter;
    
    // 类型过滤
    const typeMatch = 
      typeFilter === "all" || 
      contract.type === typeFilter;
    
    // 部门过滤（基于教师所属部门）
    const teacher = getUser(contract.teacherId);
    const departmentMatch = 
      departmentFilter === "all" || 
      (teacher && teacher.departmentId === departmentFilter);
    
    return searchMatch && statusMatch && typeMatch && departmentMatch;
  });
  
  // 分页
  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  // 状态显示文本
  const getStatusText = (status: ContractStatus) => {
    switch(status) {
      case ContractStatus.APPROVED: return "已签署";
      case ContractStatus.PENDING_DEPT: 
      case ContractStatus.PENDING_HR: return "待签署";
      case ContractStatus.REJECTED:
      case ContractStatus.TERMINATED: return "已作废";
      case ContractStatus.DRAFT: return "草稿";
      case ContractStatus.EXPIRED: return "即将到期";
      default: return status;
    }
  };
  
  // 类型显示文本
  const getTypeText = (type: ContractType) => {
    switch(type) {
      case ContractType.FULL_TIME: return "全职合同";
      case ContractType.PART_TIME: return "兼职合同";
      case ContractType.TEMPORARY: return "临时合同";
      case ContractType.VISITING: return "访问学者";
      default: return type;
    }
  };
  
  // 获取状态样式
  const getStatusStyle = (status: ContractStatus) => {
    switch(status) {
      case ContractStatus.APPROVED: return "bg-green-100 text-green-800";
      case ContractStatus.PENDING_DEPT: 
      case ContractStatus.PENDING_HR: return "bg-blue-100 text-blue-800";
      case ContractStatus.REJECTED:
      case ContractStatus.TERMINATED: return "bg-red-100 text-red-800";
      case ContractStatus.DRAFT: return "bg-gray-100 text-gray-800";
      case ContractStatus.EXPIRED: return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="container mx-auto py-8 bg-[#F6F5FF]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">全校合同列表</h1>
          <p className="text-gray-500">查看和管理所有教师合同</p>
        </div>
        <Button variant="outline" className="border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-1">
          <Download className="h-4 w-4" />
          导出数据
        </Button>
      </div>
      
      {/* 过滤和搜索 */}
      <div className="bg-white rounded-md p-4 mb-4 border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索合同标题或教师姓名"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value={ContractStatus.DRAFT}>草稿</SelectItem>
                  <SelectItem value="pending">待签署</SelectItem>
                  <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                  <SelectItem value="rejected">已作废</SelectItem>
                  <SelectItem value={ContractStatus.EXPIRED}>即将到期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="类型筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value={ContractType.FULL_TIME}>全职合同</SelectItem>
                  <SelectItem value={ContractType.PART_TIME}>兼职合同</SelectItem>
                  <SelectItem value={ContractType.TEMPORARY}>临时合同</SelectItem>
                  <SelectItem value={ContractType.VISITING}>访问学者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* 合同表格 */}
      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        {loading || usersLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">合同标题</TableHead>
                    <TableHead>教师姓名</TableHead>
                    <TableHead>所属部门</TableHead>
                    <TableHead>合同类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>开始日期</TableHead>
                    <TableHead>结束日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        没有找到符合条件的合同
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.title}</TableCell>
                        <TableCell>{getTeacherName(contract.teacherId)}</TableCell>
                        <TableCell>{getDepartmentName(contract.teacherId)}</TableCell>
                        <TableCell>{getTypeText(contract.type)}</TableCell>
                        <TableCell>
                          <Select 
                            value={contract.status} 
                            onValueChange={(newStatus) => {
                              console.log(`将合同 ${contract.id} 的状态从 ${contract.status} 更改为 ${newStatus}`);
                              // 这里可以添加更新合同状态的逻辑
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs min-w-[120px] border-none shadow-none p-0">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(contract.status as ContractStatus)}`}>
                                {getStatusText(contract.status as ContractStatus)}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ContractStatus.DRAFT}>草稿</SelectItem>
                              <SelectItem value={ContractStatus.PENDING_DEPT}>待签署</SelectItem>
                              <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                              <SelectItem value={ContractStatus.REJECTED}>已作废</SelectItem>
                              <SelectItem value={ContractStatus.EXPIRED}>即将到期</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs px-2 py-1 h-auto border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            onClick={() => {
                              // 处理续签逻辑
                              console.log(`续签合同: ${contract.id}`);
                            }}
                          >
                            续签合同
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* 分页 */}
            {filteredContracts.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-500">
                  显示 {(currentPage - 1) * pageSize + 1} 至 {Math.min(currentPage * pageSize, filteredContracts.length)} 条，共 {filteredContracts.length} 条
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    第 {currentPage} 页，共 {totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10条/页</SelectItem>
                      <SelectItem value="20">20条/页</SelectItem>
                      <SelectItem value="50">50条/页</SelectItem>
                      <SelectItem value="100">100条/页</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContractList;
