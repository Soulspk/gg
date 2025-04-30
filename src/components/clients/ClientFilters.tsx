import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface FilterValues {
  search: string;
  status: string;
  sortBy: string;
}

interface ClientFiltersProps {
  onFilter: (filters: FilterValues) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'blacklisted', label: 'Blacklisted' },
  { value: 'flagged', label: 'Flagged' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'lastOrder', label: 'Last Order' },
  { value: 'createdAt', label: 'Date Added' },
];

export const ClientFilters: React.FC<ClientFiltersProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterValues>(() => {
    const savedFilters = localStorage.getItem('client_filters');
    return savedFilters ? JSON.parse(savedFilters) : {
      search: '',
      status: '',
      sortBy: 'name',
    };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    localStorage.setItem('client_filters', JSON.stringify(newFilters));
    onFilter(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      status: '',
      sortBy: 'name',
    };
    setFilters(resetFilters);
    localStorage.setItem('client_filters', JSON.stringify(resetFilters));
    onFilter(resetFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Search"
          name="search"
          placeholder="Search by name, email, or phone"
          value={filters.search}
          onChange={handleInputChange}
        />
        
        <Select
          label="Status"
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          options={STATUS_OPTIONS}
        />
        
        <Select
          label="Sort By"
          name="sortBy"
          value={filters.sortBy}
          onChange={handleInputChange}
          options={SORT_OPTIONS}
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