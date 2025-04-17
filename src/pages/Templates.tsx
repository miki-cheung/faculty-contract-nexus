
import React, { useState } from "react";
import { useTemplates } from "@/contexts/TemplateContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilePlus, FileText, Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const Templates = () => {
  const { templates, createTemplate, updateTemplate, deleteTemplate, loading } = useTemplates();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    applicableRoles: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      content: "",
      applicableRoles: "",
    });
  };

  const handleAddTemplate = async () => {
    try {
      await createTemplate({
        name: formData.name,
        description: formData.description,
        content: formData.content,
        applicableRoles: formData.applicableRoles.split(",").map(role => role.trim()),
        version: "1.0",
      });
      
      toast({
        title: "模板创建成功",
        description: "新的合同模板已成功创建",
      });
      
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "创建失败",
        description: "创建模板时发生错误",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        content: template.content,
        applicableRoles: template.applicableRoles.join(", "),
      });
      setCurrentTemplate(templateId);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!currentTemplate) return;

    try {
      await updateTemplate(currentTemplate, {
        name: formData.name,
        description: formData.description,
        content: formData.content,
        applicableRoles: formData.applicableRoles.split(",").map(role => role.trim()),
      });
      
      toast({
        title: "模板更新成功",
        description: "合同模板已成功更新",
      });
      
      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "更新失败",
        description: "更新模板时发生错误",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (templateId: string) => {
    setCurrentTemplate(templateId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!currentTemplate) return;

    try {
      await deleteTemplate(currentTemplate);
      
      toast({
        title: "模板删除成功",
        description: "合同模板已成功删除",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除模板时发生错误",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold">合同模板管理</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              新建模板
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>创建新合同模板</DialogTitle>
              <DialogDescription>
                创建一个新的合同模板，填写相关信息以便于后续使用。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  模板名称
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  模板描述
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="applicableRoles" className="text-right">
                  适用角色
                </Label>
                <Input
                  id="applicableRoles"
                  name="applicableRoles"
                  value={formData.applicableRoles}
                  onChange={handleInputChange}
                  placeholder="教授, 副教授, 讲师"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right">
                  模板内容
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddTemplate}>
                创建模板
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>合同模板列表</CardTitle>
          <CardDescription>查看和管理所有合同模板</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模板名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>适用角色</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>{template.applicableRoles.join(", ")}</TableCell>
                  <TableCell>{template.version}</TableCell>
                  <TableCell>{format(new Date(template.createdAt), "yyyy-MM-dd")}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(template.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClick(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>编辑合同模板</DialogTitle>
            <DialogDescription>
              修改现有合同模板的信息。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                模板名称
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                模板描述
              </Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-applicableRoles" className="text-right">
                适用角色
              </Label>
              <Input
                id="edit-applicableRoles"
                name="applicableRoles"
                value={formData.applicableRoles}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-content" className="text-right">
                模板内容
              </Label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="col-span-3"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateTemplate}>
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除这个合同模板吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
