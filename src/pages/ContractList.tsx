import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  CalendarIcon, 
  FileText, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  Upload, 
  FilePlus, 
  Search 
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useContracts } from "@/contexts/ContractContext";
import { useUsers } from "@/contexts/UserContext";
import { ContractStatus, ContractType, UserRole, Contract } from "@/types";

const ContractList = () => {
  const { contracts, loading } = useContracts();
  const { getUser, getDepartment, users, departments, loading: usersLoading } = useUsers();
  
  // 状态
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // 获取教师姓名
  const getTeacherName = (teacherId: string) => {
    const teacher = getUser(teacherId);
    return teacher ? teacher.name : "未知教师";
  };
  
  // 获取教师工号
  const getTeacherEmployeeId = (teacherId: string) => {
    const teacher = getUser(teacherId);
    return teacher?.employeeId || "无工号";
  };
  
  // 获取部门名称
  const getDepartmentName = (teacherId: string) => {
    const teacher = getUser(teacherId);
    if (!teacher) return "未知部门";
    
    const department = getDepartment(teacher.departmentId);
    return department ? department.name : "未知部门";
  };
  
  // 判断合同是否已到期
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

  // 判断合同是否即将到期（30天内）
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

  // 获取合同期限状态的标签样式
  const getContractTermStatusClass = (isExpired: boolean): string => {
    return isExpired 
      ? "bg-red-100 text-red-800" 
      : "bg-green-100 text-green-800";
  };
  
  // 过滤合同
  const filteredContracts = contracts.filter(contract => {
    try {
      // 搜索过滤
      const searchMatch = 
        searchTerm === "" || 
        contract.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
      
      // 期限状态过滤
      const expiryMatch = 
        expiryFilter === "all" || 
        (expiryFilter === "expiring_soon" && isContractExpiringSoon(contract.endDate)) ||
        (expiryFilter === "expired" && isContractExpired(contract.endDate));
      
      return searchMatch && statusMatch && typeMatch && departmentMatch && expiryMatch;
    } catch (error) {
      console.error("过滤合同时出错:", error, contract);
      return false;
    }
  });
  
  // 分页
  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  // 获取状态文本
  const getStatusText = (status: ContractStatus) => {
    switch(status) {
      case ContractStatus.APPROVED: return "已签署";
      case ContractStatus.PENDING_DEPT: 
      case ContractStatus.PENDING_HR: return "待签署";
      case ContractStatus.REJECTED:
      case ContractStatus.TERMINATED: return "已作废";
      case ContractStatus.ARCHIVED: return "已归档";
      default: return "未知状态";
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
      case ContractStatus.ARCHIVED: return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // 表单验证模式
  const contractFormSchema = z.object({
    title: z.string().min(2, {
      message: "合同标题不能少于2个字符",
    }),
    teacherId: z.string({
      required_error: "请选择教师",
    }),
    type: z.nativeEnum(ContractType, {
      required_error: "请选择合同类型",
    }),
    status: z.nativeEnum(ContractStatus, {
      required_error: "请选择合同状态",
    }),
    startDate: z.date({
      required_error: "请选择开始日期",
    }),
    endDate: z.date({
      required_error: "请选择结束日期",
    }),
  }).refine((data) => data.endDate > data.startDate, {
    message: "结束日期必须晚于开始日期",
    path: ["endDate"],
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">全校合同列表</h1>
          <p className="text-gray-500">查看和管理所有教师合同</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-1" asChild>
            <Link to="/admin/contracts/create">
              <FilePlus className="h-4 w-4" />
              创建合同
            </Link>
          </Button>
          <Button variant="outline" className="border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-1">
            <Upload className="h-4 w-4" />
            导入合同
          </Button>
          <Button variant="outline" className="border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-1">
            <Download className="h-4 w-4" />
            导出数据
          </Button>
        </div>
      </div>
      
      {/* 过滤和搜索 */}
      <div className="bg-white rounded-md p-4 mb-4 border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索合同编号或教师姓名"
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
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待签署</SelectItem>
                  <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                  <SelectItem value="rejected">已作废</SelectItem>
                  <SelectItem value={ContractStatus.ARCHIVED}>已归档</SelectItem>
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
            
            <div className="w-40">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="部门筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有部门</SelectItem>
                  {departments && departments.length > 0 && departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Select value={expiryFilter} onValueChange={setExpiryFilter}>
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
          </div>
        </div>
      </div>
      
      {/* 合同列表 */}
      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        {loading || usersLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">合同编号</TableHead>
                    <TableHead>教师姓名</TableHead>
                    <TableHead>教师工号</TableHead>
                    <TableHead>教师部门</TableHead>
                    <TableHead>合同类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>开始日期</TableHead>
                    <TableHead>结束日期</TableHead>
                    <TableHead>合同期限</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        没有找到符合条件的合同
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.id}</TableCell>
                        <TableCell>{getTeacherName(contract.teacherId)}</TableCell>
                        <TableCell>{getTeacherEmployeeId(contract.teacherId)}</TableCell>
                        <TableCell>{getDepartmentName(contract.teacherId)}</TableCell>
                        <TableCell>
                          {contract.type === ContractType.FULL_TIME && "全职合同"}
                          {contract.type === ContractType.PART_TIME && "兼职合同"}
                          {contract.type === ContractType.TEMPORARY && "临时合同"}
                          {contract.type === ContractType.VISITING && "访问学者"}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(contract.status as ContractStatus)}`}>
                            {getStatusText(contract.status as ContractStatus)}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {(contract.status === ContractStatus.PENDING_DEPT || contract.status === ContractStatus.PENDING_HR) ? (
                            <span className="text-xs text-gray-500">-</span>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractTermStatusClass(isContractExpired(contract.endDate))}`}>
                              {isContractExpired(contract.endDate) ? '已到期' : '未到期'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">打开菜单</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(contract.status === ContractStatus.PENDING_DEPT || contract.status === ContractStatus.PENDING_HR) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingContract(contract);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>编辑</span>
                                </DropdownMenuItem>
                              )}
                              
                              {contract.status === ContractStatus.APPROVED && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setRenewingContract(contract);
                                    setShowRenewDialog(true);
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>续签合同</span>
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  console.log(`删除合同: ${contract.id}`);
                                  // 处理删除逻辑
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>删除</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-500">
                  显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredContracts.length)} 项，共 {filteredContracts.length} 项
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 编辑合同对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑合同</DialogTitle>
            <DialogDescription>
              修改合同信息，所有字段都是必填的。
            </DialogDescription>
          </DialogHeader>
          
          {editingContract && (
            <EditContractForm 
              contract={editingContract} 
              onClose={() => setShowEditDialog(false)}
              onSuccess={() => {
                setShowEditDialog(false);
                // 刷新合同列表
                window.location.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* 续签合同对话框 */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>续签合同</DialogTitle>
            <DialogDescription>
              基于现有合同创建新的续签合同。
            </DialogDescription>
          </DialogHeader>
          
          {renewingContract && (
            <RenewContractForm 
              contract={renewingContract} 
              onClose={() => setShowRenewDialog(false)}
              onSuccess={() => {
                setShowRenewDialog(false);
                // 刷新合同列表
                window.location.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 编辑合同表单组件
const EditContractForm = ({ contract, onClose, onSuccess }) => {
  const { users, getUsersByRole } = useUsers();
  const { updateContractStatus } = useContracts();
  const [submitting, setSubmitting] = useState(false);
  
  // 获取所有教师用户
  const teachers = getUsersByRole(UserRole.TEACHER);
  
  // 准备初始值
  const defaultValues = {
    title: contract.title,
    teacherId: contract.teacherId,
    type: contract.type,
    status: contract.status,
    startDate: new Date(contract.startDate),
    endDate: new Date(contract.endDate),
  };
  
  const form = useForm({
    resolver: zodResolver(contractFormSchema),
    defaultValues,
  });
  
  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // 更新合同状态
      updateContractStatus(
        contract.id, 
        values.status, 
        "current-user", // 应该从用户上下文中获取
        "通过编辑表单更新"
      );
      
      // 注意：由于我们没有完整的updateContract方法，
      // 这里只更新了状态，其他字段的更新在实际应用中需要实现
      
      onSuccess();
    } catch (error) {
      console.error("更新合同失败:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>合同标题</FormLabel>
                <FormControl>
                  <Input placeholder="请输入合同标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>选择教师</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择教师" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.title || "教师"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>合同类型</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择合同类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ContractType.FULL_TIME}>
                      全职合同
                    </SelectItem>
                    <SelectItem value={ContractType.PART_TIME}>
                      兼职合同
                    </SelectItem>
                    <SelectItem value={ContractType.TEMPORARY}>
                      临时合同
                    </SelectItem>
                    <SelectItem value={ContractType.VISITING}>
                      访问学者
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>合同状态</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择合同状态" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ContractStatus.PENDING_DEPT}>待签署</SelectItem>
                    <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                    <SelectItem value={ContractStatus.ARCHIVED}>已归档</SelectItem>
                    <SelectItem value={ContractStatus.REJECTED}>已作废</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>开始日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "yyyy年MM月dd日", {
                            locale: zhCN,
                          })
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>结束日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "yyyy年MM月dd日", {
                            locale: zhCN,
                          })
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {submitting ? "提交中..." : "保存修改"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// 续签合同表单组件
const RenewContractForm = ({ contract, onClose, onSuccess }) => {
  const { createContract } = useContracts();
  const [submitting, setSubmitting] = useState(false);
  
  // 计算默认的新合同开始日期（原合同结束日期后一天）
  const originalEndDate = new Date(contract.endDate);
  const newStartDate = new Date(originalEndDate);
  newStartDate.setDate(newStartDate.getDate() + 1);
  
  // 计算默认的新合同结束日期（原合同期限相同）
  const originalStartDate = new Date(contract.startDate);
  const originalDuration = originalEndDate.getTime() - originalStartDate.getTime();
  const newEndDate = new Date(newStartDate.getTime() + originalDuration);
  
  // 准备初始值
  const defaultValues = {
    title: `${contract.title} (续签)`,
    teacherId: contract.teacherId,
    type: contract.type,
    status: ContractStatus.PENDING_DEPT,
    startDate: newStartDate,
    endDate: newEndDate,
  };
  
  const form = useForm({
    resolver: zodResolver(contractFormSchema),
    defaultValues,
  });
  
  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // 创建新的续签合同
      await createContract({
        title: values.title,
        teacherId: values.teacherId,
        type: values.type,
        startDate: format(values.startDate, "yyyy-MM-dd"),
        endDate: format(values.endDate, "yyyy-MM-dd"),
        status: values.status,
        templateId: contract.templateId || "template1",
        data: contract.data || {},
        // 注意：实际应用中可能需要添加关联到原合同的字段
      });
      
      onSuccess();
    } catch (error) {
      console.error("创建续签合同失败:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>合同标题</FormLabel>
                <FormControl>
                  <Input placeholder="请输入合同标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>合同类型</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择合同类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ContractType.FULL_TIME}>
                      全职合同
                    </SelectItem>
                    <SelectItem value={ContractType.PART_TIME}>
                      兼职合同
                    </SelectItem>
                    <SelectItem value={ContractType.TEMPORARY}>
                      临时合同
                    </SelectItem>
                    <SelectItem value={ContractType.VISITING}>
                      访问学者
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>合同状态</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择合同状态" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ContractStatus.PENDING_DEPT}>待签署</SelectItem>
                    <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                    <SelectItem value={ContractStatus.ARCHIVED}>已归档</SelectItem>
                    <SelectItem value={ContractStatus.REJECTED}>已作废</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>开始日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "yyyy年MM月dd日", {
                            locale: zhCN,
                          })
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>结束日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "yyyy年MM月dd日", {
                            locale: zhCN,
                          })
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {submitting ? "提交中..." : "创建续签合同"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ContractList;
