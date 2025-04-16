
import React, { createContext, useState, useContext, useEffect } from "react";
import { ContractTemplate } from "../types";
import { contractTemplates as mockTemplates } from "../data/mockData";

interface TemplateContextType {
  templates: ContractTemplate[];
  loading: boolean;
  error: string | null;
  getTemplate: (id: string) => ContractTemplate | undefined;
  createTemplate: (template: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">) => Promise<ContractTemplate>;
  updateTemplate: (id: string, updates: Partial<ContractTemplate>) => Promise<ContractTemplate>;
  deleteTemplate: (id: string) => Promise<boolean>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const loadTemplates = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setTemplates(mockTemplates);
      } catch (err) {
        setError("Failed to load templates");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const getTemplate = (id: string) => {
    return templates.find(t => t.id === id);
  };

  const createTemplate = async (
    templateData: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<ContractTemplate> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date().toISOString();
      const newTemplate: ContractTemplate = {
        ...templateData,
        id: `t${templates.length + 1}`,
        createdAt: now,
        updatedAt: now
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<ContractTemplate>
  ): Promise<ContractTemplate> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date().toISOString();
      
      let updatedTemplate: ContractTemplate | undefined;
      
      setTemplates(prev => {
        return prev.map(template => {
          if (template.id === id) {
            updatedTemplate = {
              ...template,
              ...updates,
              updatedAt: now
            };
            return updatedTemplate;
          }
          return template;
        });
      });
      
      if (!updatedTemplate) {
        throw new Error("Template not found");
      }
      
      return updatedTemplate;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if template exists
      const templateExists = templates.some(t => t.id === id);
      
      if (!templateExists) {
        return false;
      }
      
      setTemplates(prev => prev.filter(t => t.id !== id));
      return true;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TemplateContext.Provider value={{
      templates,
      loading,
      error,
      getTemplate,
      createTemplate,
      updateTemplate,
      deleteTemplate
    }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplates must be used within a TemplateProvider");
  }
  return context;
}
