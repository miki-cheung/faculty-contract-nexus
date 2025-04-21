import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useUsers } from "@/contexts/UserContext";
import { useContracts } from "@/contexts/ContractContext";
import { ContractType, ContractStatus } from "@/types";
import { UserRole } from "@/types";

// 表单验证模式
const formSchema = z.object({
  title: z.string().min(2, {
    message: "合同标题不能少于2个字符",
  }),
  teacherId: z.string({
    required_error: "请选择教师",
  }),
  type: z.nativeEnum(ContractType, {
    required_error: "请选择合同类型",
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

type FormValues = z.infer<typeof formSchema>;

const CreateContract = () => {
  const navigate = useNavigate();
  const { users, getUsersByRole, loading: usersLoading } = useUsers();
  const { createContract, loading: contractLoading } = useContracts();
  const [submitting, setSubmitting] = useState(false);

  // 获取所有教师用户
  const teachers = getUsersByRole(UserRole.TEACHER);

  // 表单默认值
  const defaultValues: Partial<FormValues> = {
    title: "",
    type: undefined,
    startDate: undefined,
    endDate: undefined,
    teacherId: undefined,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      
      // 创建新合同
      const newContract = await createContract({
        title: values.title,
        teacherId: values.teacherId,
        type: values.type,
        startDate: format(values.startDate, "yyyy-MM-dd"),
        endDate: format(values.endDate, "yyyy-MM-dd"),
        status: ContractStatus.DRAFT,
        templateId: "template1", // 使用默认模板
        data: {}, // 空数据对象，后续在合同详情页填写
      });
      
      // 创建成功后跳转到合同详情页
      navigate(`/contracts/${newContract.id}`);
    } catch (error) {
      console.error("创建合同失败:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 bg-[#F6F5FF]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">创建新合同</h1>
        <p className="text-gray-500">填写基本信息创建新的合同</p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>合同基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {usersLoading ? (
                            <SelectItem value="loading" disabled>
                              加载中...
                            </SelectItem>
                          ) : teachers.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              没有可选教师
                            </SelectItem>
                          ) : (
                            teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name} ({teacher.title || "教师"})
                              </SelectItem>
                            ))
                          )}
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
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || contractLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {submitting ? "提交中..." : "创建合同"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateContract;
