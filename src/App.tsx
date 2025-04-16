import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { ContractProvider } from "./contexts/ContractContext";
import { TemplateProvider } from "./contexts/TemplateContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { UserProvider } from "./contexts/UserContext";

import { AppLayout } from "./components/Layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyContracts from "./pages/MyContracts";
import ContractDetail from "./pages/ContractDetail";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

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
                    
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Teacher Routes */}
                      <Route path="my-contracts" element={<MyContracts />} />
                      <Route path="my-contracts/:id" element={<ContractDetail />} />
                      
                      {/* Department Admin Routes */}
                      <Route path="dept-contracts" element={<MyContracts />} />
                      <Route path="approvals/:id" element={<ContractDetail />} />
                      
                      {/* HR Admin Routes */}
                      <Route path="contracts" element={<MyContracts />} />
                      <Route path="hr-approvals/:id" element={<ContractDetail />} />
                      
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
