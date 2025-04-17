
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
import Dashboard from "./pages/Dashboard";
import MyContracts from "./pages/MyContracts";
import ContractDetail from "./pages/ContractDetail";
import Notifications from "./pages/Notifications";
import Templates from "./pages/Templates";
import Apply from "./pages/Apply";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import DeptReports from "./pages/DeptReports";
import DeptTeachers from "./pages/DeptTeachers";
import Approvals from "./pages/Approvals";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Expiry from "./pages/Expiry";
import NotFound from "./pages/NotFound";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <UserProvider>
          <ContractProvider>
            <TemplateProvider>
              <NotificationProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Index />} />
                    
                    <Route path="/" element={<AppLayout />}>
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Teacher Routes */}
                      <Route path="my-contracts" element={<MyContracts />} />
                      <Route path="my-contracts/:id" element={<ContractDetail />} />
                      <Route path="apply" element={<Apply />} />
                      <Route path="profile" element={<Profile />} />
                      
                      {/* Department Admin Routes */}
                      <Route path="dept-contracts" element={<MyContracts />} />
                      <Route path="approvals" element={<Approvals />} />
                      <Route path="approvals/:id" element={<ContractDetail />} />
                      <Route path="dept-teachers" element={<DeptTeachers />} />
                      <Route path="dept-reports" element={<DeptReports />} />
                      
                      {/* HR Admin Routes */}
                      <Route path="contracts" element={<MyContracts />} />
                      <Route path="templates" element={<Templates />} />
                      <Route path="hr-approvals" element={<Approvals />} />
                      <Route path="hr-approvals/:id" element={<ContractDetail />} />
                      <Route path="users" element={<Users />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="expiry" element={<Expiry />} />
                      <Route path="settings" element={<Settings />} />
                      
                      {/* Common Routes */}
                      <Route path="notifications" element={<Notifications />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </NotificationProvider>
            </TemplateProvider>
          </ContractProvider>
        </UserProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
