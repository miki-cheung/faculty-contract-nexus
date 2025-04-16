
import React, { createContext, useState, useContext, useEffect } from "react";
import { Contract, ContractStatus, User, UserRole } from "../types";
import { contracts as mockContracts } from "../data/mockData";
import { useAuth } from "./AuthContext";

interface ContractContextType {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  getContract: (id: string) => Contract | undefined;
  getUserContracts: (userId: string) => Contract[];
  getDepartmentContracts: (departmentId: string) => Contract[];
  getContractsByStatus: (status: ContractStatus) => Contract[];
  updateContractStatus: (contractId: string, status: ContractStatus, actionBy: string, reason?: string) => void;
  createContract: (contract: Omit<Contract, "id" | "createdAt" | "updatedAt">) => Promise<Contract>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // In a real app, this would fetch from an API
    const loadContracts = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter contracts based on user role
        let filteredContracts = [...mockContracts];
        
        if (user) {
          if (user.role === UserRole.TEACHER) {
            // Teachers only see their own contracts
            filteredContracts = mockContracts.filter(c => c.teacherId === user.id);
          } else if (user.role === UserRole.DEPT_ADMIN && user.departmentId) {
            // Department admins see contracts for their department
            const departmentTeacherIds = mockContracts
              .filter(c => {
                const teacher = c.teacherId;
                return teacher && user.departmentId === user.departmentId;
              })
              .map(c => c.teacherId);
            
            filteredContracts = mockContracts.filter(c => 
              departmentTeacherIds.includes(c.teacherId)
            );
          }
          // HR_ADMIN sees all contracts
        }
        
        setContracts(filteredContracts);
      } catch (err) {
        setError("Failed to load contracts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadContracts();
  }, [user]);

  const getContract = (id: string) => {
    return contracts.find(c => c.id === id);
  };

  const getUserContracts = (userId: string) => {
    return contracts.filter(c => c.teacherId === userId);
  };

  const getDepartmentContracts = (departmentId: string) => {
    // In a real app, you'd query by department ID
    // For this mock, we'll need to simulate this using our available data
    return contracts.filter(c => {
      // Find the user and check if they belong to the department
      const teacher = c.teacherId;
      return teacher && user?.departmentId === departmentId;
    });
  };

  const getContractsByStatus = (status: ContractStatus) => {
    return contracts.filter(c => c.status === status);
  };

  const updateContractStatus = (
    contractId: string, 
    status: ContractStatus, 
    actionBy: string, 
    reason?: string
  ) => {
    setContracts(prev => {
      return prev.map(contract => {
        if (contract.id === contractId) {
          const now = new Date().toISOString();
          
          // Update status and related fields
          const updatedContract: Contract = {
            ...contract,
            status,
            updatedAt: now
          };
          
          // Add additional fields based on status
          if (status === ContractStatus.APPROVED) {
            updatedContract.approvedAt = now;
            updatedContract.approvedBy = actionBy;
          } else if (status === ContractStatus.REJECTED) {
            updatedContract.rejectedAt = now;
            updatedContract.rejectedBy = actionBy;
            updatedContract.rejectionReason = reason;
          } else if (status === ContractStatus.PENDING_HR) {
            // This means department approved
            updatedContract.departmentApprovalStatus = "approved";
            updatedContract.departmentApprovedAt = now;
            updatedContract.departmentApprovedBy = actionBy;
          }
          
          return updatedContract;
        }
        return contract;
      });
    });
  };

  const createContract = async (
    contractData: Omit<Contract, "id" | "createdAt" | "updatedAt">
  ): Promise<Contract> => {
    // In a real app, this would be an API call
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date().toISOString();
      const newContract: Contract = {
        ...contractData,
        id: `c${contracts.length + 1}`,
        createdAt: now,
        updatedAt: now
      };
      
      setContracts(prev => [...prev, newContract]);
      return newContract;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContractContext.Provider value={{
      contracts,
      loading,
      error,
      getContract,
      getUserContracts,
      getDepartmentContracts,
      getContractsByStatus,
      updateContractStatus,
      createContract
    }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContracts() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContracts must be used within a ContractProvider");
  }
  return context;
}
