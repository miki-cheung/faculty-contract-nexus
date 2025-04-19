
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

const Index = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-semibold">加载中...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 基于用户角色重定向到不同页面
  switch (user.role) {
    case UserRole.HR_ADMIN:
      return <Navigate to="/contracts" replace />;
    case UserRole.DEPT_ADMIN:
      return <Navigate to="/dept-contracts" replace />;
    case UserRole.TEACHER:
      return <Navigate to="/my-contracts" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Index;
