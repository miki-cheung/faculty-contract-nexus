
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { ContractProvider } from "./contexts/ContractContext";
import { TemplateProvider } from "./contexts/TemplateContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { UserProvider } from "./contexts/UserContext";

import { AppLayout } from "./components/Layout/AppLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import MyContracts from "./pages/MyContracts";
import ContractDetail from "./pages/ContractDetail";
import Notifications from "./pages/Notifications";
import Templates from "./pages/Templates";
import DeptReports from "./pages/DeptReports";
import Approvals from "./pages/Approvals";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Expiry from "./pages/Expiry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserProvider>
        <ContractProvider>
          <TemplateProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Index />} />
                  
                  <Route path="/" element={<AppLayout />}>
                    {/* 教师角色: 重定向到我的合同页面 */}
                    <Route path="dashboard" element={<Navigate to="/my-contracts" replace />} />
                    
                    {/* 教师路由: 只保留My Contracts */}
                    <Route path="my-contracts" element={<MyContracts />} />
                    <Route path="my-contracts/:id" element={<ContractDetail />} />
                    
                    {/* 部门管理员路由 */}
                    <Route path="dept-contracts" element={<DeptReports />} />
                    <Route path="approvals" element={<Approvals />} />
                    <Route path="approvals/:id" element={<ContractDetail />} />
                    
                    {/* 人事管理员路由 */}
                    <Route path="contracts" element={<MyContracts />} />
                    <Route path="templates" element={<Templates />} />
                    <Route path="hr-approvals" element={<Approvals />} />
                    <Route path="hr-approvals/:id" element={<ContractDetail />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="expiry" element={<Expiry />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </TemplateProvider>
        </ContractProvider>
      </UserProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
