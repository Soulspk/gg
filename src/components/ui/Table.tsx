import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { ColumnSelector } from './ColumnSelector';
import { Modal } from './Modal';
import { Select } from './Select';

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  cell?: (row: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  tableId: string;
  onRowClick?: (row: T) => void;
  onBulkDelete?: (selectedRows: T[]) => void;
  isSelectable?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

const PAGE_SIZE_OPTIONS = [
  { value: '15', label: '15 items' },
  { value: '35', label: '35 items' },
  { value: '55', label: '55 items' },
  { value: '100', label: '100 items' },
  { value: 'all', label: 'Show all' }
];

export function Table<T>({
  columns,
  data,
  keyField,
  tableId,
  onRowClick,
  onBulkDelete,
  isSelectable = false,
  isLoading = false,
  emptyMessage = 'No data available',
  actions
}: TableProps<T>) {
  const [sortedData, setSortedData] = useState<T[]>(data);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectAllVisible, setSelectAllVisible] = useState(false);
  const [selectAllTotal, setSelectAllTotal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem(`table_columns_${tableId}`);
    return saved ? JSON.parse(saved) : columns.map(col => col.id);
  });
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`table_column_widths_${tableId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [pageSize, setPageSize] = useState<string>(() => {
    const saved = localStorage.getItem(`table_page_size_${tableId}`);
    return saved || '15';
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  const tableRef = useRef<HTMLTableElement>(null);
  const resizingRef = useRef<{ columnId: string; startX: number; columnWidth: number } | null>(null);

  useEffect(() => {
    setSortedData(data);
    setCurrentPage(1);
    setSelectedRows([]);
    setSelectAllVisible(false);
    setSelectAllTotal(false);
  }, [data]);

  useEffect(() => {
    localStorage.setItem(`table_column_widths_${tableId}`, JSON.stringify(columnWidths));
  }, [columnWidths, tableId]);

  useEffect(() => {
    localStorage.setItem(`table_page_size_${tableId}`, pageSize);
  }, [pageSize, tableId]);

  const handleResizeStart = (columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const headerCell = e.currentTarget.parentElement as HTMLElement;
    const startX = e.pageX;
    const columnWidth = headerCell.offsetWidth;

    resizingRef.current = { columnId, startX, columnWidth };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;

      const diff = e.pageX - resizingRef.current.startX;
      const newWidth = Math.max(100, resizingRef.current.columnWidth + diff);

      setColumnWidths(prev => ({
        ...prev,
        [resizingRef.current.columnId]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleSort = (columnId: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnId) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    const sorted = [...data].sort((a, b) => {
      const column = columns.find(col => col.id === columnId);
      if (!column) return 0;
      
      const aValue = String(column.accessor(a));
      const bValue = String(column.accessor(b));
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setSortedData(sorted);
    setSortConfig({ key: columnId, direction });
  };

  const handleSelectRow = (row: T) => {
    setSelectedRows(prev => {
      if (prev.some(r => r[keyField] === row[keyField])) {
        return prev.filter(r => r[keyField] !== row[keyField]);
      } else {
        return [...prev, row];
      }
    });
  };

  const handleSelectAllVisible = () => {
    if (selectAllVisible) {
      setSelectedRows(prev => prev.filter(row => !paginatedData.some(r => r[keyField] === row[keyField])));
      setSelectAllVisible(false);
    } else {
      setSelectedRows(prev => {
        const visibleIds = new Set(paginatedData.map(row => row[keyField]));
        const remainingSelected = prev.filter(row => !visibleIds.has(row[keyField]));
        return [...remainingSelected, ...paginatedData];
      });
      setSelectAllVisible(true);
    }
  };

  const handleSelectAllTotal = () => {
    if (selectAllTotal) {
      setSelectedRows([]);
      setSelectAllTotal(false);
      setSelectAllVisible(false);
    } else {
      setSelectedRows(sortedData);
      setSelectAllTotal(true);
      setSelectAllVisible(true);
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.some(r => r[keyField] === row[keyField]);
  };

  const filteredColumns = columns.filter(col => visibleColumns.includes(col.id));

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(e.target.value);
    setCurrentPage(1);
    setSelectedRows([]);
    setSelectAllVisible(false);
    setSelectAllTotal(false);
  };

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(sortedData.length / Number(pageSize));
  const paginatedData = pageSize === 'all' 
    ? sortedData 
    : sortedData.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
    setSelectAllVisible(false);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
    setSelectAllVisible(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select
            options={PAGE_SIZE_OPTIONS}
            value={pageSize}
            onChange={handlePageSizeChange}
            className="w-32"
          />
        </div>
        <div className="flex items-center space-x-2">
          {actions}
          <ColumnSelector
            columns={columns}
            visibleColumns={visibleColumns}
            onSave={setVisibleColumns}
            tableId={tableId}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        {isSelectable && selectedRows.length > 0 && (
          <div className="bg-blue-50 p-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-700 font-medium">{selectedRows.length} selected</span>
              {selectedRows.length < sortedData.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllTotal}
                >
                  Select all {sortedData.length} items
                </Button>
              )}
            </div>
            <div className="ml-auto">
              {onBulkDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onBulkDelete(selectedRows)}
                >
                  Delete Selected
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isSelectable && (
                  <th scope="col" className="w-12 px-4 py-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectAllVisible}
                        onChange={handleSelectAllVisible}
                      />
                    </div>
                  </th>
                )}
                
                {filteredColumns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    style={{ 
                      width: columnWidths[column.id] || column.width || 'auto',
                      position: 'relative'
                    }}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {column.sortable ? (
                        <button
                          className="group inline-flex items-center space-x-1"
                          onClick={() => handleSort(column.id)}
                        >
                          <span>{column.header}</span>
                          <span className="ml-1 flex-none rounded text-gray-400">
                            {sortConfig?.key === column.id ? (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )
                            ) : (
                              <ChevronDown size={16} className="opacity-0 group-hover:opacity-100" />
                            )}
                          </span>
                        </button>
                      ) : (
                        column.header
                      )}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleResizeStart(column.id, e)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={filteredColumns.length + (isSelectable ? 1 : 0)}
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    <div className="flex justify-center items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={filteredColumns.length + (isSelectable ? 1 : 0)}
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={String(row[keyField])}
                    className={`${isRowSelected(row) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {isSelectable && (
                      <td className="px-4 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isRowSelected(row)}
                            onChange={() => handleSelectRow(row)}
                          />
                        </div>
                      </td>
                    )}
                    
                    {filteredColumns.map((column) => (
                      <td
                        key={column.id}
                        style={{ width: columnWidths[column.id] || column.width || 'auto' }}
                        className={`px-4 py-2 whitespace-nowrap text-sm ${
                          column.id === 'actions' ? 'text-right' : ''
                        }`}
                      >
                        {column.cell ? column.cell(row) : column.accessor(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pageSize !== 'all' && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * Number(pageSize)) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * Number(pageSize), sortedData.length)}
                  </span>{' '}
                  of <span className="font-medium">{sortedData.length}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}