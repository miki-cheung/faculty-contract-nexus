
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Save,
  Bell,
  Calendar,
  Workflow,
  Mail,
  Lock,
  Database,
  Globe,
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "合同管理系统",
    adminEmail: "admin@example.com",
    language: "zh-CN",
    dateFormat: "YYYY-MM-DD",
    autoLogout: "30",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmails: true,
    contractExpiry: 30,
    reviewReminder: 7,
    allowBulkNotifications: true,
    expiryNotificationsToHR: true,
  });

  const [workflowSettings, setWorkflowSettings] = useState({
    requireDeptApproval: true,
    requireHRApproval: true,
    allowExpedited: false,
    autoArchive: true,
    archiveDays: "90",
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordExpiry: "90",
    minPasswordLength: "8",
    requirePasswordComplexity: true,
    failedLoginAttempts: "5",
    twoFactorAuth: false,
  });

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneralSelectChange = (name: string, value: string) => {
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationSwitchChange = (name: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({ 
      ...prev, 
      [name]: typeof prev[name] === 'boolean' ? !prev[name] : prev[name] 
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkflowSwitchChange = (name: keyof typeof workflowSettings) => {
    setWorkflowSettings((prev) => ({ 
      ...prev, 
      [name]: typeof prev[name] === 'boolean' ? !prev[name] : prev[name] 
    }));
  };

  const handleWorkflowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWorkflowSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecuritySwitchChange = (name: keyof typeof securitySettings) => {
    setSecuritySettings((prev) => ({ 
      ...prev, 
      [name]: typeof prev[name] === 'boolean' ? !prev[name] : prev[name] 
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecuritySettings((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = async (settingType: string) => {
    setIsSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "设置已保存",
        description: `${settingType}设置已成功更新`,
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "更新设置时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">系统设置</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            基本设置
          </TabsTrigger>
          <TabsTrigger value="notification">
            <Bell className="h-4 w-4 mr-2" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="workflow">
            <Workflow className="h-4 w-4 mr-2" />
            工作流设置
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            安全设置
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                基本设置
              </CardTitle>
              <CardDescription>
                配置系统基本参数和默认值
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">系统名称</Label>
                  <Input
                    id="systemName"
                    name="systemName"
                    value={generalSettings.systemName}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">管理员邮箱</Label>
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    value={generalSettings.adminEmail}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">系统语言</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) => handleGeneralSelectChange("language", value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="选择语言" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">日期格式</Label>
                  <Select
                    value={generalSettings.dateFormat}
                    onValueChange={(value) => handleGeneralSelectChange("dateFormat", value)}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="选择日期格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY年MM月DD日">YYYY年MM月DD日</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoLogout">自动登出时间（分钟）</Label>
                <Input
                  id="autoLogout"
                  name="autoLogout"
                  type="number"
                  value={generalSettings.autoLogout}
                  onChange={handleGeneralChange}
                />
                <p className="text-sm text-muted-foreground">
                  设置为 0 表示不自动登出
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => saveSettings("基本")} 
                disabled={isSaving}
                className="ml-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "保存中..." : "保存设置"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notification">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                通知设置
              </CardTitle>
              <CardDescription>
                配置系统通知和提醒规则
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableEmails">启用电子邮件通知</Label>
                  <p className="text-sm text-muted-foreground">允许系统发送电子邮件通知</p>
                </div>
                <Switch
                  id="enableEmails"
                  checked={notificationSettings.enableEmails}
                  onCheckedChange={() => handleNotificationSwitchChange('enableEmails')}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="contractExpiry">合同到期提前通知天数</Label>
                <Input
                  id="contractExpiry"
                  name="contractExpiry"
                  type="number"
                  value={notificationSettings.contractExpiry}
                  onChange={handleNotificationChange}
                />
                <p className="text-sm text-muted-foreground">
                  在合同到期前多少天发送提醒通知
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reviewReminder">审批提醒天数</Label>
                <Input
                  id="reviewReminder"
                  name="reviewReminder"
                  type="number"
                  value={notificationSettings.reviewReminder}
                  onChange={handleNotificationChange}
                />
                <p className="text-sm text-muted-foreground">
                  待处理审批请求多少天后发送催办提醒
                </p>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowBulkNotifications">允许批量通知</Label>
                  <p className="text-sm text-muted-foreground">允许系统发送批量通知</p>
                </div>
                <Switch
                  id="allowBulkNotifications"
                  checked={notificationSettings.allowBulkNotifications}
                  onCheckedChange={() => handleNotificationSwitchChange('allowBulkNotifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="expiryNotificationsToHR">合同到期抄送人事处</Label>
                  <p className="text-sm text-muted-foreground">合同到期通知同时抄送人事处管理员</p>
                </div>
                <Switch
                  id="expiryNotificationsToHR"
                  checked={notificationSettings.expiryNotificationsToHR}
                  onCheckedChange={() => handleNotificationSwitchChange('expiryNotificationsToHR')}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => saveSettings("通知")} 
                disabled={isSaving}
                className="ml-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "保存中..." : "保存设置"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Workflow Settings */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Workflow className="h-5 w-5 mr-2" />
                工作流设置
              </CardTitle>
              <CardDescription>
                配置合同审批流程和自动化规则
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireDeptApproval">需要部门管理员审批</Label>
                  <p className="text-sm text-muted-foreground">合同申请需要部门管理员审批</p>
                </div>
                <Switch
                  id="requireDeptApproval"
                  checked={workflowSettings.requireDeptApproval}
                  onCheckedChange={() => handleWorkflowSwitchChange('requireDeptApproval')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireHRApproval">需要人事处审批</Label>
                  <p className="text-sm text-muted-foreground">合同申请需要人事处审批</p>
                </div>
                <Switch
                  id="requireHRApproval"
                  checked={workflowSettings.requireHRApproval}
                  onCheckedChange={() => handleWorkflowSwitchChange('requireHRApproval')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowExpedited">允许加急审批</Label>
                  <p className="text-sm text-muted-foreground">允许申请加急审批流程</p>
                </div>
                <Switch
                  id="allowExpedited"
                  checked={workflowSettings.allowExpedited}
                  onCheckedChange={() => handleWorkflowSwitchChange('allowExpedited')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoArchive">自动归档</Label>
                  <p className="text-sm text-muted-foreground">自动归档已完成的合同</p>
                </div>
                <Switch
                  id="autoArchive"
                  checked={workflowSettings.autoArchive}
                  onCheckedChange={() => handleWorkflowSwitchChange('autoArchive')}
                />
              </div>
              
              {workflowSettings.autoArchive && (
                <div className="space-y-2">
                  <Label htmlFor="archiveDays">归档天数</Label>
                  <Input
                    id="archiveDays"
                    name="archiveDays"
                    type="number"
                    value={workflowSettings.archiveDays}
                    onChange={handleWorkflowChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    合同完成后多少天自动归档
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => saveSettings("工作流")} 
                disabled={isSaving}
                className="ml-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "保存中..." : "保存设置"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                安全设置
              </CardTitle>
              <CardDescription>
                配置系统安全和登录规则
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">密码过期时间（天）</Label>
                <Input
                  id="passwordExpiry"
                  name="passwordExpiry"
                  type="number"
                  value={securitySettings.passwordExpiry}
                  onChange={handleSecurityChange}
                />
                <p className="text-sm text-muted-foreground">
                  设置为 0 表示密码永不过期
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minPasswordLength">最小密码长度</Label>
                <Input
                  id="minPasswordLength"
                  name="minPasswordLength"
                  type="number"
                  value={securitySettings.minPasswordLength}
                  onChange={handleSecurityChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requirePasswordComplexity">要求密码复杂度</Label>
                  <p className="text-sm text-muted-foreground">密码必须包含大小写字母、数字和特殊符号</p>
                </div>
                <Switch
                  id="requirePasswordComplexity"
                  checked={securitySettings.requirePasswordComplexity}
                  onCheckedChange={() => handleSecuritySwitchChange('requirePasswordComplexity')}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="failedLoginAttempts">最大失败登录尝试次数</Label>
                <Input
                  id="failedLoginAttempts"
                  name="failedLoginAttempts"
                  type="number"
                  value={securitySettings.failedLoginAttempts}
                  onChange={handleSecurityChange}
                />
                <p className="text-sm text-muted-foreground">
                  超过此次数账户将被锁定
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">两步验证</Label>
                  <p className="text-sm text-muted-foreground">要求用户启用两步验证</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={() => handleSecuritySwitchChange('twoFactorAuth')}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => saveSettings("安全")} 
                disabled={isSaving}
                className="ml-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "保存中..." : "保存设置"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
