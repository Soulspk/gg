import { useState, useEffect } from 'react';

// Define the base data structure
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  cost: number;
  imageUrls: string[];
  description?: string;
  location?: string;
  supplier?: string;
  reorderPoint?: number;
  lastUpdated: string;
  createdAt: string;
}

// Add interface for category
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  blacklisted?: boolean;
  blacklistReason?: string;
  flagged?: boolean;
  flagReason?: string;
  lastOrderDate?: string;
  createdAt: string;
}

export interface OrderData {
  id: string;
  clientId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  date: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  notes?: string;
}

export interface OrderItem {
  inventoryItemId: string;
  quantity: number;
  price: number;
}

// Collection names
export type CollectionName = 'inventory' | 'clients' | 'orders';

// Function to generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// Generate SKU
export const generateSKU = (category: string): string => {
  const prefix = category.substring(0, 2).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-2).toUpperCase();
  return `${prefix}${randomPart}${timestamp}`.substring(0, 8);
};

// Hook for accessing the database
export const useDatabase = <T>(collection: CollectionName) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(`db_${collection}`);
      if (storedData) {
        setData(JSON.parse(storedData));
      } else {
        // Initialize with empty array if not exists
        localStorage.setItem(`db_${collection}`, JSON.stringify([]));
        setData([]);
      }
      setLoading(false);
    } catch (err) {
      setError(`Failed to load ${collection} data: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  }, [collection]);

  // Save data to localStorage
  const saveData = (newData: T[]) => {
    try {
      localStorage.setItem(`db_${collection}`, JSON.stringify(newData));
      setData(newData);
      return true;
    } catch (err) {
      setError(`Failed to save ${collection} data: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  };

  // Add an item
  const add = (item: Omit<T, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const now = new Date().toISOString();
    const newItem = {
      ...item,
      id: generateId(),
      createdAt: now,
      lastUpdated: now,
    } as unknown as T;
    
    const newData = [...data, newItem];
    return saveData(newData) ? newItem : null;
  };

  // Update an item
  const update = (id: string, updates: Partial<T>) => {
    const now = new Date().toISOString();
    const itemIndex = data.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) return false;
    
    const updatedItem = {
      ...data[itemIndex],
      ...updates,
      lastUpdated: now,
    };
    
    const newData = [
      ...data.slice(0, itemIndex),
      updatedItem,
      ...data.slice(itemIndex + 1)
    ];
    
    return saveData(newData);
  };

  // Delete an item
  const remove = (id: string) => {
    const newData = data.filter((item: any) => item.id !== id);
    return saveData(newData);
  };

  // Bulk delete items
  const bulkRemove = (ids: string[]) => {
    const newData = data.filter((item: any) => !ids.includes(item.id));
    return saveData(newData);
  };

  // Get a single item by ID
  const getById = (id: string): T | undefined => {
    return data.find((item: any) => item.id === id);
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
    bulkRemove,
    getById,
    refresh: () => {
      setLoading(true);
      const storedData = localStorage.getItem(`db_${collection}`);
      if (storedData) {
        setData(JSON.parse(storedData));
      }
      setLoading(false);
    }
  };
};

// Export a function to download the database
export const exportDatabase = () => {
  try {
    const collections: CollectionName[] = ['inventory', 'clients', 'orders'];
    const exportData: Record<string, any> = {};
    
    collections.forEach(collection => {
      const data = localStorage.getItem(`db_${collection}`);
      if (data) {
        exportData[collection] = JSON.parse(data);
      } else {
        exportData[collection] = [];
      }
    });
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `inventory_database_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    return true;
  } catch (err) {
    console.error("Failed to export database:", err);
    return false;
  }
};

// Import database from a JSON file
export const importDatabase = (jsonData: string) => {
  try {
    const parsedData = JSON.parse(jsonData);
    const collections: CollectionName[] = ['inventory', 'clients', 'orders'];
    
    collections.forEach(collection => {
      if (Array.isArray(parsedData[collection])) {
        localStorage.setItem(`db_${collection}`, JSON.stringify(parsedData[collection]));
      }
    });
    
    return true;
  } catch (err) {
    console.error("Failed to import database:", err);
    return false;
  }
};