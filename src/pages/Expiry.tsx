
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Search,
  Clock,
  Bell,
  CalendarDays,
  ArrowUpDown,
  UserCircle,
  Eye,
  FileText,
  Mail,
  Download,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for expiring contracts
const expiryMockData = [
  {
    id: "con101",
    teacherId: "u1",
    teacherName: "张三",
    title: "教学型合同",
    department: "计算机学院",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2025-05-01T00:00:00Z",
    daysRemaining: 14,
    notified: true,
  },
  {
    id: "con102",
    teacherId: "u2",
    teacherName: "李四",
    title: "科研型合同",
    department: "物理学院",
    startDate: "2023-06-01T00:00:00Z",
    endDate: "2025-05-15T00:00:00Z",
    daysRemaining: 28,
    notified: false,
  },
  {
    id: "con103",
    teacherId: "u3",
    teacherName: "王五",
    title: "教学科研型合同",
    department: "化学学院",
    startDate: "2023-09-01T00:00:00Z",
    endDate: "2025-06-01T00:00:00Z",
    daysRemaining: 45,
    notified: false,
  },
  {
    id: "con104",
    teacherId: "u4",
    teacherName: "赵六",
    title: "实验教学岗位合同",
    department: "数学学院",
    startDate: "2023-03-01T00:00:00Z",
    endDate: "2025-06-30T00:00:00Z",
    daysRemaining: 74,
    notified: true,
  },
  {
    id: "con105",
    teacherId: "u5",
    teacherName: "钱七",
    title: "教学型合同",
    department: "经济学院",
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2025-07-15T00:00:00Z",
    daysRemaining: 89,
    notified: false,
  },
];

const Expiry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [sortField, setSortField] = useState("daysRemaining");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedContract, setSelectedContract] = useState<typeof expiryMockData[0] | null>(null);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleView = (id: string) => {
    navigate(`/contracts/${id}`);
  };

  const handleNotify = (contract: typeof expiryMockData[0]) => {
    setSelectedContract(contract);
    setIsNotifyDialogOpen(true);
  };

  const sendNotification = () => {
    if (!selectedContract) return;
    
    toast({
      title: "通知已发送",
      description: `已向 ${selectedContract.teacherName} 发送合同到期提醒`,
    });
    
    setIsNotifyDialogOpen(false);
  };

  // Filter and sort contracts
  const filteredContracts = expiryMockData
    .filter(contract => {
      // Search filter
      const matchesSearch = contract.teacherName.includes(searchTerm) || 
                           contract.title.includes(searchTerm);
      
      // Department filter
      const matchesDepartment = departmentFilter === "all" || contract.department === departmentFilter;
      
      // Expiry filter
      let matchesExpiry = true;
      if (expiryFilter === "30days") {
        matchesExpiry = contract.daysRemaining <= 30;
      } else if (expiryFilter === "60days") {
        matchesExpiry = contract.daysRemaining <= 60;
      } else if (expiryFilter === "90days") {
        matchesExpiry = contract.daysRemaining <= 90;
      }
      
      return matchesSearch && matchesDepartment && matchesExpiry;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortField === "daysRemaining") {
        return sortOrder === "asc" 
          ? a.daysRemaining - b.daysRemaining
          : b.daysRemaining - a.daysRemaining;
      } else if (sortField === "teacherName") {
        return sortOrder === "asc"
          ? a.teacherName.localeCompare(b.teacherName)
          : b.teacherName.localeCompare(a.teacherName);
      } else if (sortField === "department") {
        return sortOrder === "asc"
          ? a.department.localeCompare(b.department)
          : b.department.localeCompare(a.department);
      }
      return 0;
    });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">合同到期管理</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索教师或合同..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="部门" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有部门</SelectItem>
              <SelectItem value="计算机学院">计算机学院</SelectItem>
              <SelectItem value="物理学院">物理学院</SelectItem>
              <SelectItem value="化学学院">化学学院</SelectItem>
              <SelectItem value="数学学院">数学学院</SelectItem>
              <SelectItem value="经济学院">经济学院</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={expiryFilter} onValueChange={setExpiryFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="到期时间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有</SelectItem>
              <SelectItem value="30days">30天内</SelectItem>
              <SelectItem value="60days">60天内</SelectItem>
              <SelectItem value="90days">90天内</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          共 <span className="font-medium">{filteredContracts.length}</span> 条记录
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>即将到期合同</CardTitle>
          <CardDescription>查看并管理即将到期的合同</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">序号</TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("teacherName")}
                  >
                    教师
                    {sortField === "teacherName" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "transform rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("department")}
                  >
                    部门
                    {sortField === "department" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "transform rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>合同标题</TableHead>
                <TableHead>到期日期</TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("daysRemaining")}
                  >
                    剩余天数
                    {sortField === "daysRemaining" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "transform rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>提醒状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    未找到即将到期的合同
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract, index) => (
                  <TableRow key={contract.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span>{contract.teacherName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{contract.department}</TableCell>
                    <TableCell>{contract.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {new Date(contract.endDate).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contract.daysRemaining <= 30 ? (
                        <Badge variant="destructive" className="flex gap-1 items-center">
                          <Clock className="h-3 w-3" /> {contract.daysRemaining}天
                        </Badge>
                      ) : contract.daysRemaining <= 60 ? (
                        <Badge variant="default" className="flex gap-1 items-center">
                          <Clock className="h-3 w-3" /> {contract.daysRemaining}天
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex gap-1 items-center">
                          <Clock className="h-3 w-3" /> {contract.daysRemaining}天
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {contract.notified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          已提醒
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                          未提醒
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(contract.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={contract.notified}
                          onClick={() => handleNotify(contract)}
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4" />
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

      {/* Notification Dialog */}
      <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>发送合同到期提醒</DialogTitle>
            <DialogDescription>
              向教师发送合同即将到期的提醒通知
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <div className="py-4">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={selectedContract.teacherName} />
                  <AvatarFallback>{selectedContract.teacherName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedContract.teacherName}</p>
                  <p className="text-sm text-muted-foreground">{selectedContract.department}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">合同标题:</span>
                  <span>{selectedContract.title}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">到期日期:</span>
                  <span>
                    {new Date(selectedContract.endDate).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">剩余天数:</span>
                  <span>{selectedContract.daysRemaining}天</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">提醒方式:</p>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">系统通知 + 电子邮件</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={sendNotification}>
              <Bell className="mr-2 h-4 w-4" />
              发送提醒
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expiry;
