
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { User, Settings, FileText, Bell, Key, ChevronDown, UserCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const Profile = () => {
  const { user } = useAuth();
  const { departments } = useUsers();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    title: user?.title || "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    contractExpiry: true,
    approvalUpdates: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "资料已更新",
        description: "您的个人资料已成功更新",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "更新失败",
        description: "更新个人资料时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码不匹配",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "密码已更新",
        description: "您的密码已成功更新",
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: "更新密码时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "通知设置已更新",
        description: "您的通知偏好已成功更新",
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: "更新通知设置时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">未发现用户信息</p>
        </div>
      </div>
    );
  }

  const department = departments.find(d => d.id === user.departmentId);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">个人资料</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>个人信息</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="text-2xl">
                  <UserCircle2 className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.title || "职位未设置"}</p>
              <p className="text-sm text-muted-foreground">{department?.name || "部门未设置"}</p>
              
              <Separator className="my-4" />
              
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">邮箱:</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">电话:</span>
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full" onClick={() => setIsEditing(true)}>
                <Settings className="mr-2 h-4 w-4" />
                编辑资料
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>快速链接</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                查看我的合同
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                通知设置
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                修改密码
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">个人资料</TabsTrigger>
              <TabsTrigger value="security">安全设置</TabsTrigger>
              <TabsTrigger value="notifications">通知偏好</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>个人资料</CardTitle>
                  <CardDescription>
                    查看和更新您的个人信息
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">职称</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">电子邮箱</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号码</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">通讯地址</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">紧急联系人</Label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">紧急联系电话</Label>
                      <Input
                        id="emergencyPhone"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
                {isEditing && (
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? "保存中..." : "保存修改"}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>安全设置</CardTitle>
                  <CardDescription>
                    管理您的账户安全选项
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Collapsible 
                    open={isSecurityOpen} 
                    onOpenChange={setIsSecurityOpen}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center">
                          <Key className="h-5 w-5 mr-2" />
                          <h4 className="text-sm font-medium">修改密码</h4>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isSecurityOpen ? "transform rotate-180" : ""}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">当前密码</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">新密码</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">确认新密码</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <Button onClick={handleChangePassword} disabled={isSaving}>
                        {isSaving ? "更新中..." : "更新密码"}
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">两步验证</h4>
                    <p className="text-sm text-muted-foreground">
                      增强您账户的安全性，启用两步验证。
                    </p>
                    <Button variant="outline">设置两步验证</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">会话管理</h4>
                    <p className="text-sm text-muted-foreground">
                      管理您的登录设备和会话。
                    </p>
                    <Button variant="outline">查看登录设备</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>通知设置</CardTitle>
                  <CardDescription>
                    管理您想要接收的通知
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Collapsible 
                    open={isNotificationsOpen} 
                    onOpenChange={setIsNotificationsOpen}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center">
                          <Bell className="h-5 w-5 mr-2" />
                          <h4 className="text-sm font-medium">通知偏好</h4>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isNotificationsOpen ? "transform rotate-180" : ""}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">电子邮件通知</Label>
                          <p className="text-sm text-muted-foreground">接收电子邮件通知</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notifications.emailNotifications}
                          onCheckedChange={() => handleNotificationChange('emailNotifications')}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="contract-expiry">合同到期提醒</Label>
                          <p className="text-sm text-muted-foreground">在合同即将到期时接收提醒</p>
                        </div>
                        <Switch
                          id="contract-expiry"
                          checked={notifications.contractExpiry}
                          onCheckedChange={() => handleNotificationChange('contractExpiry')}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="approval-updates">审批状态更新</Label>
                          <p className="text-sm text-muted-foreground">当您的合同审批状态更新时接收通知</p>
                        </div>
                        <Switch
                          id="approval-updates"
                          checked={notifications.approvalUpdates}
                          onCheckedChange={() => handleNotificationChange('approvalUpdates')}
                        />
                      </div>
                      
                      <Button onClick={handleSaveNotifications} disabled={isSaving}>
                        {isSaving ? "保存中..." : "保存设置"}
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
