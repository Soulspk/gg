import React, { useState } from 'react';
import { Check, Settings } from 'lucide-react';
import { Button } from './Button';

interface Column {
  id: string;
  header: string;
}

interface ColumnSelectorProps {
  columns: Column[];
  visibleColumns: string[];
  onSave: (columns: string[]) => void;
  tableId: string;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  visibleColumns,
  onSave,
  tableId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(visibleColumns);

  const handleToggle = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSave = () => {
    onSave(selectedColumns);
    localStorage.setItem(`table_columns_${tableId}`, JSON.stringify(selectedColumns));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Settings size={16} />}
        onClick={() => setIsOpen(!isOpen)}
      >
        Columns
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Show/Hide Columns</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {columns.map(column => (
                <label
                  key={column.id}
                  className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.id)}
                    onChange={() => handleToggle(column.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{column.header}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                leftIcon={<Check size={16} />}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};