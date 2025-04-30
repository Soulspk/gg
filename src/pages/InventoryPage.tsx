import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle, Eye, ShoppingCart, Pen } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { InventoryForm } from '../components/inventory/InventoryForm';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { ImageGallery } from '../components/ui/ImageGallery';
import { ItemDetails } from '../components/inventory/ItemDetails';
import { useDatabase, InventoryItem } from '../services/db';
import { useCart } from '../components/cart/CartContext';

export const InventoryPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<InventoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredData, setFilteredData] = useState<InventoryItem[]>([]);
  
  const { 
    data: inventoryItems, 
    loading, 
    add: addInventoryItem,
    update: updateInventoryItem,
    remove: removeInventoryItem,
    bulkRemove,
  } = useDatabase<InventoryItem>('inventory');

  const { addToCart, items: cartItems } = useCart();

  useEffect(() => {
    setFilteredData(inventoryItems);
  }, [inventoryItems]);

  const handleFilter = (filters: any) => {
    let filtered = [...inventoryItems];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.name.toLowerCase().includes(searchTerm) || 
          item.sku.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.minQuantity) {
      filtered = filtered.filter(item => item.quantity >= Number(filters.minQuantity));
    }
    if (filters.maxQuantity) {
      filtered = filtered.filter(item => item.quantity <= Number(filters.maxQuantity));
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(item => item.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(item => item.price <= Number(filters.maxPrice));
    }
    
    setFilteredData(filtered);
  };

  const handleAddItem = async (data: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated'>) => {
    setIsSubmitting(true);
    
    try {
      const newItem = addInventoryItem(data);
      if (newItem) {
        toast.success('Product added successfully');
        setIsAddModalOpen(false);
      } else {
        toast.error('Failed to add product');
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (data: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated'>) => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    
    try {
      const success = updateInventoryItem(selectedItem.id, data);
      
      if (success) {
        toast.success('Product updated successfully');
        setIsEditModalOpen(false);
        setSelectedItem(null);
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = (items: InventoryItem[]) => {
    setItemsToDelete(items);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDeleteConfirm = () => {
    try {
      const ids = itemsToDelete.map(item => item.id);
      const success = bulkRemove(ids);
      
      if (success) {
        toast.success(`${itemsToDelete.length} products deleted successfully`);
        setIsDeleteModalOpen(false);
        setItemsToDelete([]);
      } else {
        toast.error('Failed to delete products');
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleViewImages = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsImageGalleryOpen(true);
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleAddToCart = (item: InventoryItem) => {
    addToCart(item, 1);
  };

  const isItemInCart = (itemId: string) => {
    return cartItems.some(item => item.id === itemId);
  };

  const columns = [
    {
      id: 'product',
      header: 'Product',
      accessor: (row: InventoryItem) => row.name,
      sortable: true,
      cell: (row: InventoryItem) => (
        <div className="flex items-center">
          {row.imageUrls && row.imageUrls.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewImages(row);
              }}
              className="mr-3 hover:opacity-75 transition-opacity"
            >
              <img
                src={row.imageUrls[0]}
                alt={row.name}
                className="h-10 w-10 rounded-md object-cover"
              />
            </button>
          ) : (
            <div className="h-10 w-10 mr-3 bg-gray-200 rounded-md flex items-center justify-center">
              <Package size={16} className="text-gray-500" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-gray-500 text-xs">SKU: {row.sku}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (row: InventoryItem) => row.category,
      sortable: true,
      cell: (row: InventoryItem) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.category.charAt(0).toUpperCase() + row.category.slice(1)}
        </span>
      ),
    },
    {
      id: 'quantity',
      header: 'Quantity',
      accessor: (row: InventoryItem) => row.quantity,
      sortable: true,
      cell: (row: InventoryItem) => {
        const isLowStock = row.reorderPoint && row.quantity <= row.reorderPoint;
        
        return (
          <div className="flex items-center">
            <span className={`${isLowStock ? 'text-amber-600 font-medium' : 'text-gray-900'}`}>
              {row.quantity}
            </span>
            {isLowStock && (
              <AlertTriangle size={16} className="ml-2 text-amber-600" />
            )}
          </div>
        );
      },
    },
    {
      id: 'price',
      header: 'Price',
      accessor: (row: InventoryItem) => row.price,
      sortable: true,
      cell: (row: InventoryItem) => (
        <span className="text-gray-900">
          {row.price.toFixed(2)} DH
        </span>
      ),
    },
    {
      id: 'lastUpdated',
      header: 'Last Updated',
      accessor: (row: InventoryItem) => row.lastUpdated,
      sortable: true,
      cell: (row: InventoryItem) => (
        <span className="text-gray-500">
          {new Date(row.lastUpdated).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '120px',
      cell: (row: InventoryItem) => (
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
            onClick={() => {
              setSelectedItem(row);
              setIsEditModalOpen(true);
            }}
          >
            <Pen size={16} />
          </button>
          
          <button
            type="button"
            className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => handleViewDetails(row)}
          >
            <Eye size={16} />
          </button>
          
          <button
            type="button"
            className={`p-1.5 rounded-full transition-colors ${
              isItemInCart(row.id)
                ? 'text-green-600 bg-green-50'
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
            onClick={() => handleAddToCart(row)}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <InventoryFilters onFilter={handleFilter} />
      </div>

      <Table<InventoryItem>
        columns={columns}
        data={filteredData}
        keyField="id"
        tableId="inventory"
        isLoading={loading}
        isSelectable
        onBulkDelete={handleBulkDelete}
        emptyMessage="No inventory items found. Add some products to get started!"
        actions={
          <Button 
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Product
          </Button>
        }
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
        size="2xl"
      >
        <InventoryForm
          onSubmit={handleAddItem}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        title="Edit Product"
        size="2xl"
      >
        {selectedItem && (
          <InventoryForm
            initialData={selectedItem}
            onSubmit={handleUpdateItem}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedItem(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemsToDelete([]);
        }}
        title="Confirm Deletion"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setItemsToDelete([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleBulkDeleteConfirm}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Delete {itemsToDelete.length} {itemsToDelete.length === 1 ? 'product' : 'products'}?
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                This action cannot be undone. {itemsToDelete.length === 1 ? 'This product' : 'These products'} will be permanently removed from your inventory.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {isImageGalleryOpen && selectedItem && (
        <ImageGallery
          images={selectedItem.imageUrls || []}
          onClose={() => {
            setIsImageGalleryOpen(false);
            setSelectedItem(null);
          }}
        />
      )}

      {isDetailsOpen && selectedItem && (
        <ItemDetails
          item={selectedItem}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedItem(null);
          }}
          onViewImages={() => {
            setIsDetailsOpen(false);
            setIsImageGalleryOpen(true);
          }}
        />
      )}
    </div>
  );
};