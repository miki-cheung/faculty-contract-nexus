
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, UserRole, Department } from "../types";
import { users as mockUsers, departments as mockDepartments } from "../data/mockData";
import { useAuth } from "./AuthContext";

interface UserContextType {
  users: User[];
  departments: Department[];
  loading: boolean;
  error: string | null;
  getUser: (id: string) => User | undefined;
  getDepartmentUsers: (departmentId: string) => User[];
  getUsersByRole: (role: UserRole) => User[];
  getDepartment: (id: string) => Department | undefined;
  createUser: (user: Omit<User, "id">) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // In a real app, this would fetch from an API
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter users based on permissions
        let filteredUsers = [...mockUsers];
        
        if (currentUser) {
          if (currentUser.role === UserRole.DEPT_ADMIN && currentUser.departmentId) {
            // Department admins only see users in their department
            filteredUsers = mockUsers.filter(u => 
              u.departmentId === currentUser.departmentId
            );
          }
          // HR_ADMIN sees all users, TEACHER shouldn't access this context
        }
        
        setUsers(filteredUsers);
        setDepartments(mockDepartments);
      } catch (err) {
        setError("Failed to load user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const getUser = (id: string) => {
    return users.find(u => u.id === id);
  };

  const getDepartmentUsers = (departmentId: string) => {
    return users.filter(u => u.departmentId === departmentId);
  };

  const getUsersByRole = (role: UserRole) => {
    return users.filter(u => u.role === role);
  };

  const getDepartment = (id: string) => {
    return departments.find(d => d.id === id);
  };

  const createUser = async (userData: Omit<User, "id">): Promise<User> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        ...userData,
        id: `u${users.length + 1}`
      };
      
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    id: string,
    updates: Partial<User>
  ): Promise<User> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let updatedUser: User | undefined;
      
      setUsers(prev => {
        return prev.map(user => {
          if (user.id === id) {
            updatedUser = {
              ...user,
              ...updates
            };
            return updatedUser;
          }
          return user;
        });
      });
      
      if (!updatedUser) {
        throw new Error("User not found");
      }
      
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{
      users,
      departments,
      loading,
      error,
      getUser,
      getDepartmentUsers,
      getUsersByRole,
      getDepartment,
      createUser,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
