import React, { useState } from 'react';
import { Save, Download, Upload, Plus, Pen, Trash2, FolderPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { exportDatabase, importDatabase } from '../services/db';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

type TabType = 'categories' | 'database';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('db_categories');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      createdAt: new Date().toISOString()
    };
    
    const updatedCategories = [...categories, category];
    setCategories(updatedCategories);
    localStorage.setItem('db_categories', JSON.stringify(updatedCategories));
    setNewCategory({ name: '', description: '' });
    setIsAddModalOpen(false);
    toast.success('Category added successfully');
  };

  const handleUpdateCategory = () => {
    if (!selectedCategory) return;
    
    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id ? selectedCategory : cat
    );
    
    setCategories(updatedCategories);
    localStorage.setItem('db_categories', JSON.stringify(updatedCategories));
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    toast.success('Category updated successfully');
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    setCategories(updatedCategories);
    localStorage.setItem('db_categories', JSON.stringify(updatedCategories));
    toast.success('Category deleted successfully');
  };

  const handleExportDb = () => {
    const success = exportDatabase();
    if (success) {
      toast.success('Database exported successfully');
    } else {
      toast.error('Failed to export database');
    }
  };

  const handleImportDb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const success = importDatabase(content);
        if (success) {
          toast.success('Database imported successfully');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error('Failed to import database');
        }
      } catch (error) {
        toast.error(`Import error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const categoryColumns = [
    {
      id: 'name',
      header: 'Name',
      accessor: (row: Category) => row.name,
      sortable: true,
      cell: (row: Category) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 font-medium text-gray-900 dark:text-white">
            {row.name}
          </div>
        </div>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      accessor: (row: Category) => row.description || '-',
      sortable: true,
      cell: (row: Category) => (
        <div className="text-gray-600 dark:text-gray-300">
          {row.description || <span className="text-gray-400">No description</span>}
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created At',
      accessor: (row: Category) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      cell: (row: Category) => (
        <div className="text-gray-600 dark:text-gray-300">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row: Category) => row.id,
      cell: (row: Category) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory(row);
              setIsEditModalOpen(true);
            }}
          >
            <Pen size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteCategory(row.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
            <button
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'database'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
              onClick={() => setActiveTab('database')}
            >
              Database
            </button>
          </nav>
        </div>

        {activeTab === 'categories' ? (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Category Management</h2>
              <Button
                leftIcon={<FolderPlus size={16} />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Category
              </Button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
              <Table
                columns={categoryColumns}
                data={categories}
                keyField="id"
                tableId="categories"
                emptyMessage="No categories found. Add some categories to get started!"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
                <h4 className="font-medium text-gray-900 dark:text-gray-300 mb-2">Export Database</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Export all your inventory data to a JSON file for backup or transfer.
                </p>
                <Button 
                  leftIcon={<Download size={16} />}
                  onClick={handleExportDb}
                >
                  Export Data
                </Button>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
                <h4 className="font-medium text-gray-900 dark:text-gray-300 mb-2">Import Database</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Import inventory data from a previously exported JSON file.
                </p>
                <input
                  type="file"
                  accept=".json"
                  id="import-db"
                  className="hidden"
                  onChange={handleImportDb}
                />
                <label htmlFor="import-db">
                  <Button 
                    leftIcon={<Upload size={16} />}
                    as="span"
                  >
                    Import Data
                  </Button>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter category name"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter category description"
              className="w-full min-h-[100px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        title="Edit Category"
        size="md"
      >
        {selectedCategory && (
          <div className="space-y-4">
            <Input
              label="Category Name"
              value={selectedCategory.name}
              onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
              placeholder="Enter category name"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={selectedCategory.description}
                onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                placeholder="Enter category description"
                className="w-full min-h-[100px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateCategory}>
                Update Category
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};