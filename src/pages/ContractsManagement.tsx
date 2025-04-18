
import React from "react";
import { useContracts } from "@/contexts/ContractContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractStatus } from "@/types";
import { Link } from "react-router-dom";
import { AlertCircle, FileText } from "lucide-react";

const ContractsManagement = () => {
  const { contracts, loading } = useContracts();

  // 获取即将到期的合同（30天内）
  const expiringContracts = contracts.filter(contract => {
    if (contract.status !== ContractStatus.APPROVED) return false;
    const endDate = new Date(contract.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">合同管理</h2>
        <Button asChild>
          <Link to="/contract-list">
            <FileText className="w-4 h-4 mr-2" />
            查看所有合同
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            即将到期的合同
          </CardTitle>
          <CardDescription>
            显示30天内即将到期的合同
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : expiringContracts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              暂无即将到期的合同
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同标题</TableHead>
                  <TableHead>教师姓名</TableHead>
                  <TableHead>开始日期</TableHead>
                  <TableHead>到期日期</TableHead>
                  <TableHead>剩余天数</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringContracts.map(contract => {
                  const endDate = new Date(contract.endDate);
                  const now = new Date();
                  const diffTime = endDate.getTime() - now.getTime();
                  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.title}</TableCell>
                      <TableCell>{contract.teacherName}</TableCell>
                      <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="text-yellow-500 font-medium">
                          {daysLeft}天
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/contracts/${contract.id}`}>
                            查看详情
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>最近更新的合同</CardTitle>
          <CardDescription>显示最近更新的10份合同</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同标题</TableHead>
                  <TableHead>教师姓名</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 10)
                  .map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.title}</TableCell>
                      <TableCell>{contract.teacherName}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            contract.status === ContractStatus.APPROVED
                              ? "bg-status-approved/10 text-status-approved"
                              : contract.status === ContractStatus.REJECTED
                              ? "bg-status-rejected/10 text-status-rejected"
                              : "bg-status-pending/10 text-status-pending"
                          }`}
                        >
                          {contract.status === ContractStatus.APPROVED
                            ? "已批准"
                            : contract.status === ContractStatus.REJECTED
                            ? "已拒绝"
                            : "审批中"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(contract.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/contracts/${contract.id}`}>
                            查看详情
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractsManagement;
