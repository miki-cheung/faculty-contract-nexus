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
import Expiry from "./pages/Expiry";
import ContractsManagement from "./pages/ContractsManagement";
import CreateContract from "./pages/CreateContract"; 
import ContractList from "./pages/ContractList";

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
                    {/* 通用重定向 */}
                    <Route path="dashboard" element={<Navigate to="/admin/contracts" replace />} />
                    
                    {/* 管理员路由 */}
                    <Route path="admin">
                      <Route path="contracts" element={<ContractsManagement />} />
                      <Route path="contracts/create" element={<CreateContract />} />
                      <Route path="contracts/list" element={<ContractList />} />
                      <Route path="contracts/:id" element={<ContractDetail />} />
                      <Route path="templates" element={<Templates />} />
                      <Route path="approvals" element={<Approvals />} />
                      <Route path="approvals/:id" element={<ContractDetail />} />
                      <Route path="expiry" element={<Expiry />} />
                      <Route path="reports" element={<Navigate to="/admin/contracts" replace />} />
                    </Route>
                    
                    {/* 部门管理员路由 */}
                    <Route path="dept">
                      <Route path="contracts" element={<DeptReports />} />
                      <Route path="approvals" element={<Approvals />} />
                      <Route path="approvals/:id" element={<ContractDetail />} />
                    </Route>
                    
                    {/* 教师路由 */}
                    <Route path="teacher">
                      <Route path="contracts" element={<MyContracts />} />
                      <Route path="contracts/:id" element={<ContractDetail />} />
                    </Route>
                    
                    {/* 兼容旧路由 - 将被重定向 */}
                    <Route path="my-contracts" element={<Navigate to="/teacher/contracts" replace />} />
                    <Route path="my-contracts/:id" element={<Navigate to="/teacher/contracts/:id" replace />} />
                    <Route path="dept-contracts" element={<Navigate to="/dept/contracts" replace />} />
                    <Route path="contracts" element={<Navigate to="/admin/contracts" replace />} />
                    <Route path="templates" element={<Navigate to="/admin/templates" replace />} />
                    <Route path="hr-approvals" element={<Navigate to="/admin/approvals" replace />} />
                    <Route path="hr-approvals/:id" element={<Navigate to="/admin/approvals/:id" replace />} />
                    <Route path="approvals" element={<Navigate to="/dept/approvals" replace />} />
                    <Route path="approvals/:id" element={<Navigate to="/dept/approvals/:id" replace />} />
                    <Route path="expiry" element={<Navigate to="/admin/expiry" replace />} />
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
