import React, { useState } from "react";
import { useContracts } from "@/contexts/ContractContext";
import { useTemplates } from "@/contexts/TemplateContext";
import { useAuth } from "@/contexts/AuthContext";
import { ContractStatus, ContractType } from "@/types";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  FileQuestion,
  FileBarChart,
  FileCheck,
  ChevronDown,
  ChevronUp,
  FilePlus
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";
import { PieChart, Pie, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const statusIcons: Record<string, React.ReactNode> = {
  [ContractStatus.DRAFT]: <FileQuestion className="h-4 w-4 text-status-draft" />,
  [ContractStatus.PENDING_DEPT]: <Clock className="h-4 w-4 text-status-pending" />,
  [ContractStatus.PENDING_HR]: <Clock className="h-4 w-4 text-status-pending" />,
  [ContractStatus.APPROVED]: <CheckCircle className="h-4 w-4 text-status-approved" />,
  [ContractStatus.REJECTED]: <AlertCircle className="h-4 w-4 text-status-rejected" />,
  [ContractStatus.EXPIRED]: <AlertCircle className="h-4 w-4 text-status-expired" />,
  [ContractStatus.TERMINATED]: <AlertCircle className="h-4 w-4 text-status-expired" />
};

const translateStatus = (status: ContractStatus): string => {
  switch (status) {
    case ContractStatus.DRAFT:
      return "草稿";
    case ContractStatus.PENDING_DEPT:
      return "部门审批中";
    case ContractStatus.PENDING_HR:
      return "人事审批中";
    case ContractStatus.APPROVED:
      return "已批准";
    case ContractStatus.REJECTED:
      return "已拒绝";
    case ContractStatus.EXPIRED:
      return "已过期";
    case ContractStatus.TERMINATED:
      return "已终止";
    default:
      return status;
  }
};

const translateType = (type: ContractType): string => {
  switch (type) {
    case ContractType.FULL_TIME:
      return "全职";
    case ContractType.PART_TIME:
      return "兼职";
    case ContractType.TEMPORARY:
      return "临时";
    case ContractType.VISITING:
      return "访问";
    default:
      return type;
  }
};

const applyFormSchema = z.object({
  templateId: z.string({
    required_error: "请选择合同模板",
  }),
  title: z.string().min(2, {
    message: "标题至少需要2个字符",
  }),
  startDate: z.string().min(1, {
    message: "请输入起始日期",
  }),
  endDate: z.string().min(1, {
    message: "请输入结束日期",
  }),
  position: z.string().min(1, {
    message: "请输入职位",
  }),
  details: z.string().min(10, {
    message: "详情至少需要10个字符",
  }),
  additionalNotes: z.string().optional(),
  attachments: z.boolean().default(false).optional(),
  confirmInfo: z.boolean().refine(val => val === true, {
    message: "请确认信息准确",
  }),
});

type ApplyFormValues = z.infer<typeof applyFormSchema>;

const MyContracts = () => {
  const { user } = useAuth();
  const { contracts, loading } = useContracts();
  const { templates, loading: templatesLoading } = useTemplates();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [showStats, setShowStats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  if (!user) return null;

  const myContracts = contracts.filter(contract => contract.teacherId === user.id);

  const activeContracts = myContracts.filter(contract => contract.status === ContractStatus.APPROVED);
  const pendingContracts = myContracts.filter(
    contract => [ContractStatus.PENDING_DEPT, ContractStatus.PENDING_HR].includes(contract.status)
  );
  const draftContracts = myContracts.filter(contract => contract.status === ContractStatus.DRAFT);
  const rejectedContracts = myContracts.filter(contract => contract.status === ContractStatus.REJECTED);

  const filteredContracts = myContracts.filter(contract => {
    if (statusFilter !== "all" && contract.status !== statusFilter) {
      return false;
    }

    if (
      searchText &&
      !contract.title.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const pieChartData = [
    { name: "有效合同", value: activeContracts.length, color: "#10b981" },
    { name: "待审批", value: pendingContracts.length, color: "#f59e0b" },
    { name: "草稿", value: draftContracts.length, color: "#6b7280" },
    { name: "已拒绝", value: rejectedContracts.length, color: "#ef4444" },
  ].filter(item => item.value > 0);

  const currentYear = new Date().getFullYear();
  const barChartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const approvedCount = myContracts.filter(contract => {
      const startDate = new Date(contract.startDate);
      return startDate.getMonth() === i && startDate.getFullYear() === currentYear && contract.status === ContractStatus.APPROVED;
    }).length;
    
    const pendingCount = myContracts.filter(contract => {
      const startDate = new Date(contract.startDate);
      return startDate.getMonth() === i && startDate.getFullYear() === currentYear && 
        (contract.status === ContractStatus.PENDING_DEPT || contract.status === ContractStatus.PENDING_HR);
    }).length;
    
    return {
      name: `${month}月`,
      已批准: approvedCount,
      待审批: pendingCount,
    };
  });

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      title: "",
      startDate: "",
      endDate: "",
      position: user?.position || "",
      details: "",
      additionalNotes: "",
      attachments: false,
      confirmInfo: false,
    },
  });

  const onSubmit = async (values: ApplyFormValues) => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Form values:", values);
      
      toast({
        title: "申请已提交",
        description: "您的合同申请已成功提交，请等待审批。",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "提交失败",
        description: "提交申请时发生错误，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    form.setValue("templateId", templateId);
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      form.setValue("title", `${template.name} 申请`);
      form.setValue("details", template.description || "");
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "草稿已保存",
      description: "您的合同申请草稿已保存",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">我的合同</h2>
        <Button 
          onClick={() => {
            const applyTab = document.querySelector('[data-state="apply"]') as HTMLButtonElement;
            if (applyTab) applyTab.click();
          }}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          申请合同
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">合同列表</TabsTrigger>
          <TabsTrigger value="apply">申请新合同</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">有效合同</CardTitle>
                <FileCheck className="h-4 w-4 text-status-approved" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeContracts.length}</div>
                <p className="text-xs text-muted-foreground">
                  当前生效的合同数量
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">待审批</CardTitle>
                <Clock className="h-4 w-4 text-status-pending" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingContracts.length}</div>
                <p className="text-xs text-muted-foreground">
                  正在等待审批的合同
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">草稿</CardTitle>
                <FileText className="h-4 w-4 text-status-draft" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{draftContracts.length}</div>
                <p className="text-xs text-muted-foreground">
                  尚未提交的合同草稿
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
                <AlertCircle className="h-4 w-4 text-status-rejected" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejectedContracts.length}</div>
                <p className="text-xs text-muted-foreground">
                  被拒绝的合同申请
                </p>
              </CardContent>
            </Card>
          </div>

          <Button 
            variant="ghost" 
            className="flex items-center gap-2 mb-2"
            onClick={() => setShowStats(!showStats)}
          >
            <FileBarChart className="h-4 w-4" />
            {showStats ? "隐藏统计图表" : "显示统计图表"}
            {showStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showStats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>合同状态分布</CardTitle>
                  <CardDescription>各状态合同数量占比</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}份合同`]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      暂无合同数据
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>按月份统计</CardTitle>
                  <CardDescription>{currentYear}年合同数量</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="已批准" fill="#10b981" />
                      <Bar dataKey="待审批" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>合同列表</CardTitle>
              <CardDescription>您的所有合同记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-[180px]">
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="合同状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有状态</SelectItem>
                        <SelectItem value={ContractStatus.DRAFT}>草稿</SelectItem>
                        <SelectItem value={ContractStatus.PENDING_DEPT}>部门审批中</SelectItem>
                        <SelectItem value={ContractStatus.PENDING_HR}>人事审批中</SelectItem>
                        <SelectItem value={ContractStatus.APPROVED}>已批准</SelectItem>
                        <SelectItem value={ContractStatus.REJECTED}>已拒绝</SelectItem>
                        <SelectItem value={ContractStatus.EXPIRED}>已过期</SelectItem>
                        <SelectItem value={ContractStatus.TERMINATED}>已终止</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="搜索合同..."
                      className="pl-8 w-[250px]"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-10">
                  <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-lg font-semibold">加载中...</p>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/60" />
                  <p className="mt-4 text-lg font-semibold">没有找到合同</p>
                  <p className="text-muted-foreground">
                    {myContracts.length === 0
                      ? "您还没有任何合同。点击'申请新合同'按钮开始。"
                      : "尝试更改过滤条件以查看更多合同。"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>合同标题</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>开始日期</TableHead>
                      <TableHead>结束日期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.title}</TableCell>
                        <TableCell>{translateType(contract.type)}</TableCell>
                        <TableCell>
                          {new Date(contract.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(contract.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {statusIcons[contract.status]}
                            <span className="ml-2">{translateStatus(contract.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" title="查看流程">
                              查看流程
                            </Button>
                            <Button size="icon" variant="ghost" title="查看详情">
                              <Link to={`/my-contracts/${contract.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {contract.fileUrl && (
                              <Button
                                size="icon"
                                variant="ghost"
                                title="下载合同"
                                asChild
                              >
                                <a href={contract.fileUrl} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>新合同申请</CardTitle>
              <CardDescription>
                填写以下表单申请新的合同。所有标有*的字段为必填项。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex h-full items-center justify-center py-10">
                  <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-lg font-semibold">加载中...</p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="templateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>合同模板 *</FormLabel>
                          <Select
                            onValueChange={(value) => handleTemplateChange(value)}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择合同模板" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            选择适合您需求的合同模板
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>合同标题 *</FormLabel>
                            <FormControl>
                              <Input placeholder="输入合同标题" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>申请职位 *</FormLabel>
                            <FormControl>
                              <Input placeholder="职位" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>起始日期 *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>结束日期 *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>合同详情 *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="请描述合同详情..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>补充说明</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="补充说明（可选）..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            提供任何其他需要考虑的信息
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attachments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>包含附件</FormLabel>
                            <FormDescription>
                              勾选此项添加证件资料等附件
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("attachments") && (
                      <div className="border rounded-md p-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FilePlus className="w-10 h-10 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                支持 PDF, DOC, DOCX, JPG, PNG (最大 10MB)
                              </p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="confirmInfo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>确认信息 *</FormLabel>
                            <FormDescription>
                              我确认以上提供的所有信息真实准确
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        保存草稿
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                            处理中...
                          </>
                        ) : (
                          <>
                            <FilePlus className="mr-2 h-4 w-4" />
                            提交申请
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyContracts;
