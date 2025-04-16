
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // In a real app, we'd validate the email format and require a password
      if (!email) {
        setError("请输入邮箱地址");
        return;
      }

      // For demo purposes, any valid email from our mock data will work
      // with any password
      const success = await login(email, password || "password");

      if (!success) {
        setError("用户不存在或密码错误");
      }
    } catch (err) {
      setError("登录时发生错误");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Login test accounts for the demo:
  // HR Admin: admin@university.edu
  // Department Admin: compscidept@university.edu or mathdept@university.edu
  // Teacher: liu@university.edu, chen@university.edu, or zhao@university.edu

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary p-2 text-primary-foreground">
                <FileText size={24} />
              </div>
            </div>
            <CardTitle className="text-2xl">教师合同管理系统</CardTitle>
            <CardDescription>请登录您的账户</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded bg-destructive/10 p-3 text-center text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    忘记密码?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <p>示例账户 (无需输入密码):</p>
                <p>人事管理员: admin@university.edu</p>
                <p>部门管理员: compscidept@university.edu</p>
                <p>教师: liu@university.edu</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "登录中..." : "登录"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
