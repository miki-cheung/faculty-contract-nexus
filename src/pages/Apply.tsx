
import React, { useState } from "react";
import { useTemplates } from "@/contexts/TemplateContext";
import { useUsers } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Save, Send } from "lucide-react";

// Form schema
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

const Apply = () => {
  const { templates, loading: templatesLoading } = useTemplates();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

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
    
    // Simulate API call
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
    
    // In a real app, we'd populate form fields based on the template
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

  if (templatesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-semibold">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">合同申请</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>新合同申请</CardTitle>
            <CardDescription>
              填写以下表单申请新的合同。所有标有*的字段为必填项。
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
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
                    <Save className="mr-2 h-4 w-4" />
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
                        <Send className="mr-2 h-4 w-4" />
                        提交申请
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Apply;
