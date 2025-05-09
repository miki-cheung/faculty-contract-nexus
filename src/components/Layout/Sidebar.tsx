import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { 
  FileText, 
  FilePlus, 
  FileCheck, 
  Bell, 
  LogOut,
  FileBarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  badge?: number;
}

const SidebarItem = ({ href, icon: Icon, children, badge }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
      {badge ? (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen w-64 bg-sidebar flex flex-col border-r">
      <div className="p-6">
        <h2 className="text-xl font-bold text-sidebar-foreground">合同管理系统</h2>
      </div>

      <div className="px-3 py-2">
        <div className="space-y-1">
          {/* 教师角色菜单 */}
          {user.role === UserRole.TEACHER && (
            <SidebarItem href="/teacher/contracts" icon={FileText}>
              我的合同
            </SidebarItem>
          )}

          {/* 部门管理员菜单 */}
          {user.role === UserRole.DEPT_ADMIN && (
            <>
              <SidebarItem href="/dept/contracts" icon={FileText}>
                部门合同
              </SidebarItem>
              <SidebarItem href="/dept/approvals" icon={FileCheck}>
                合同审批
              </SidebarItem>
            </>
          )}

          {/* 人事管理员菜单 */}
          {user.role === UserRole.HR_ADMIN && (
            <>
              <SidebarItem href="/admin/contracts" icon={FileText}>
                合同管理
              </SidebarItem>
              <SidebarItem href="/admin/templates" icon={FilePlus}>
                合同类型
              </SidebarItem>
            </>
          )}
        </div>
      </div>

      <div className="mt-auto p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
    </div>
  );
}
