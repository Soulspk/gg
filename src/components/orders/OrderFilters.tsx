import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface FilterValues {
  search: string;
  status: string;
  paymentStatus: string;
}

interface OrderFiltersProps {
  onFilter: (filters: FilterValues) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payment Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
];

export const OrderFilters: React.FC<OrderFiltersProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterValues>(() => {
    const savedFilters = localStorage.getItem('order_filters');
    return savedFilters ? JSON.parse(savedFilters) : {
      search: '',
      status: '',
      paymentStatus: '',
    };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    localStorage.setItem('order_filters', JSON.stringify(newFilters));
    onFilter(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      status: '',
      paymentStatus: '',
    };
    setFilters(resetFilters);
    localStorage.setItem('order_filters', JSON.stringify(resetFilters));
    onFilter(resetFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          name="search"
          placeholder="Search orders"
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
          label="Payment Status"
          name="paymentStatus"
          value={filters.paymentStatus}
          onChange={handleInputChange}
          options={PAYMENT_STATUS_OPTIONS}
        />
        
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={handleReset} fullWidth>
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};