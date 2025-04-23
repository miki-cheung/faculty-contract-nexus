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
  CardFooter,
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
  FilePlus,
  Calendar,
  Tag
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
    case ContractStatus.PENDING_HR:
      return "待签署";
    case ContractStatus.APPROVED:
      return "已签署";
    case ContractStatus.REJECTED:
    case ContractStatus.TERMINATED:
      return "已作废";
    case ContractStatus.EXPIRED:
      return "即将到期";
    default:
      return status;
  }
};

const getStatusColor = (status: ContractStatus): string => {
  switch (status) {
    case ContractStatus.DRAFT:
      return "bg-gray-100 text-gray-800";
    case ContractStatus.PENDING_DEPT:
    case ContractStatus.PENDING_HR:
      return "bg-blue-100 text-blue-800";
    case ContractStatus.APPROVED:
      return "bg-green-100 text-green-800";
    case ContractStatus.REJECTED:
    case ContractStatus.TERMINATED:
      return "bg-red-100 text-red-800";
    case ContractStatus.EXPIRED:
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  const myContracts = contracts.filter(contract => contract.teacherId === user.id);

  const activeContracts = myContracts.filter(contract => contract.status === ContractStatus.APPROVED);
  const pendingContracts = myContracts.filter(
    contract => [ContractStatus.PENDING_DEPT, ContractStatus.PENDING_HR].includes(contract.status)
  );
  const draftContracts = myContracts.filter(contract => contract.status === ContractStatus.DRAFT);
  const rejectedContracts = myContracts.filter(
    contract => [ContractStatus.REJECTED, ContractStatus.TERMINATED].includes(contract.status)
  );

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
        description: "您的合同申请已成功提交，请等待签署。",
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
        <Button onClick={() => setShowApplyDialog(true)}>
          <FilePlus className="mr-2 h-4 w-4" />
          申请合同
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">已签署合同</CardTitle>
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
            <CardTitle className="text-sm font-medium">待签署</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              等待签署的合同
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
            <CardTitle className="text-sm font-medium">已作废</CardTitle>
            <AlertCircle className="h-4 w-4 text-status-rejected" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              已作废的合同
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>我的合同</CardTitle>
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
                    <SelectItem value={ContractStatus.PENDING_DEPT}>待签署</SelectItem>
                    <SelectItem value={ContractStatus.APPROVED}>已签署</SelectItem>
                    <SelectItem value={ContractStatus.REJECTED}>已作废</SelectItem>
                    <SelectItem value={ContractStatus.EXPIRED}>即将到期</SelectItem>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts.map((contract) => (
                <Card key={contract.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <Badge className={getStatusColor(contract.status as ContractStatus)}>
                        {translateStatus(contract.status as ContractStatus)}
                      </Badge>
                    </div>
                    <CardDescription>{translateType(contract.type)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">开始日期：</span>
                        <span className="ml-1 font-medium">
                          {new Date(contract.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">结束日期：</span>
                        <span className="ml-1 font-medium">
                          {new Date(contract.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/my-contracts/${contract.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </Link>
                    </Button>
                    {contract.fileUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={contract.fileUrl} download>
                          <Download className="h-4 w-4 mr-1" />
                          下载合同
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>申请新合同</DialogTitle>
            <DialogDescription>
              填写以下表单申请新的合同。所有标有*的字段为必填项。
            </DialogDescription>
          </DialogHeader>

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
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-primary mr-2"></div>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyContracts;
