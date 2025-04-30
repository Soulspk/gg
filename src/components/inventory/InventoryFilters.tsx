import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface FilterValues {
  search: string;
  category: string;
  minQuantity: string;
  maxQuantity: string;
  minPrice: string;
  maxPrice: string;
}

interface InventoryFiltersProps {
  onFilter: (filters: FilterValues) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({ onFilter }) => {
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [filters, setFilters] = useState<FilterValues>(() => {
    const savedFilters = localStorage.getItem('inventory_filters');
    return savedFilters ? JSON.parse(savedFilters) : {
      search: '',
      category: '',
      minQuantity: '',
      maxQuantity: '',
      minPrice: '',
      maxPrice: '',
    };
  });

  // Load categories from settings
  useEffect(() => {
    const savedCategories = localStorage.getItem('db_categories');
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      setCategories([
        { value: '', label: 'All Categories' },
        ...parsedCategories.map((cat: any) => ({
          value: cat.name.toLowerCase(),
          label: cat.name
        }))
      ]);
    }
  }, []);

  // Apply saved filters on mount
  useEffect(() => {
    onFilter(filters);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    localStorage.setItem('inventory_filters', JSON.stringify(newFilters));
    onFilter(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      minQuantity: '',
      maxQuantity: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(resetFilters);
    localStorage.setItem('inventory_filters', JSON.stringify(resetFilters));
    onFilter(resetFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Input
          label="Search"
          name="search"
          placeholder="Search by name or SKU"
          value={filters.search}
          onChange={handleInputChange}
        />
        
        <Select
          label="Category"
          name="category"
          value={filters.category}
          onChange={handleInputChange}
          options={categories}
        />
        
        <Input
          label="Min Quantity"
          name="minQuantity"
          type="number"
          placeholder="Min"
          value={filters.minQuantity}
          onChange={handleInputChange}
        />
        
        <Input
          label="Max Quantity"
          name="maxQuantity"
          type="number"
          placeholder="Max"
          value={filters.maxQuantity}
          onChange={handleInputChange}
        />
        
        <Input
          label="Min Price (DH)"
          name="minPrice"
          type="number"
          placeholder="Min"
          value={filters.minPrice}
          onChange={handleInputChange}
        />
        
        <Input
          label="Max Price (DH)"
          name="maxPrice"
          type="number" 
          placeholder="Max"
          value={filters.maxPrice}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
};