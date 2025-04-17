
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, RefreshCw } from "lucide-react";

// Mock data for department charts
const deptContractsByTypeData = [
  { name: "教学型", value: 15 },
  { name: "科研型", value: 10 },
  { name: "教学科研型", value: 18 },
];

const deptContractsByMonthData = [
  { name: "1月", 新签: 2, 续签: 1, 终止: 0 },
  { name: "2月", 新签: 1, 续签: 0, 终止: 0 },
  { name: "3月", 新签: 3, 续签: 1, 终止: 1 },
  { name: "4月", 新签: 1, 续签: 2, 终止: 0 },
  { name: "5月", 新签: 3, 续签: 1, 终止: 0 },
  { name: "6月", 新签: 2, 续签: 1, 终止: 1 },
  { name: "7月", 新签: 4, 续签: 3, 终止: 1 },
  { name: "8月", 新签: 6, 续签: 4, 终止: 2 },
  { name: "9月", 新签: 3, 续签: 2, 终止: 0 },
  { name: "10月", 新签: 1, 续签: 1, 终止: 0 },
  { name: "11月", 新签: 2, 续签: 2, 终止: 1 },
  { name: "12月", 新签: 4, 续签: 2, 终止: 1 },
];

const deptContractsByStatusData = [
  { name: "有效", value: 33 },
  { name: "即将到期", value: 5 },
  { name: "已到期", value: 3 },
];

const deptContractsByPositionData = [
  { name: "教授", count: 10 },
  { name: "副教授", count: 15 },
  { name: "讲师", count: 12 },
  { name: "助教", count: 6 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const DeptReports = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("year");
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const downloadReport = (reportType: string) => {
    // In a real app, this would generate and download a report
    alert(`下载${reportType}报告`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">部门合同统计</h1>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年度</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Contract by Type */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>合同类型分布</CardTitle>
              <CardDescription>按合同类型统计分布情况</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadReport("合同类型分布")}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptContractsByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deptContractsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contract Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>合同状态分布</CardTitle>
              <CardDescription>按合同状态统计分布情况</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadReport("合同状态分布")}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptContractsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deptContractsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Contract Trends */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>月度合同趋势</CardTitle>
            <CardDescription>显示每月合同新签、续签和终止数量</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadReport("月度合同趋势")}>
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptContractsByMonthData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="新签" fill="#8884d8" />
                <Bar dataKey="续签" fill="#82ca9d" />
                <Bar dataKey="终止" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Position Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>职称分布</CardTitle>
            <CardDescription>按职称统计合同数量</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadReport("职称分布")}>
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptContractsByPositionData}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 30,
                  left: 60,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeptReports;
