import React from 'react';
import { Package, ShoppingCart, Calendar, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import { InventoryItem } from '../../services/db';
import { Button } from '../ui/Button';

interface ItemDetailsProps {
  item: InventoryItem;
  onClose: () => void;
  onViewImages: () => void;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ item, onClose, onViewImages }) => {
  // Calculate order statistics (mock data for now)
  const orderStats = {
    totalOrders: 45,
    lastOrderDate: '2024-02-15',
    averageOrderQuantity: 3,
    totalRevenue: item.price * 45,
  };

  const isLowStock = item.reorderPoint && item.quantity <= item.reorderPoint;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-200">
                  {item.category}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Main Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-300">SKU</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.sku}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Quantity</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm font-semibold ${isLowStock ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                        {item.quantity}
                      </span>
                      {isLowStock && (
                        <AlertTriangle className="ml-2 h-5 w-5 text-amber-600" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Price</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.price.toFixed(2)} DH</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Last Updated</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Order Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Statistics</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Orders</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{orderStats.totalOrders}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Order</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(orderStats.lastOrderDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Order Quantity</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {orderStats.averageOrderQuantity} units
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Revenue</div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {orderStats.totalRevenue.toFixed(2)} DH
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description and Additional Info */}
              <div className="space-y-6">
                {item.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                    <p className="text-gray-900 dark:text-white">{item.description}</p>
                  </div>
                )}

                {item.supplier && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Supplier</h4>
                    <p className="text-gray-900 dark:text-white">{item.supplier}</p>
                  </div>
                )}

                {/* Images Preview */}
                {item.imageUrls && item.imageUrls.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Images</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye size={16} />}
                        onClick={onViewImages}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {item.imageUrls.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${item.name} preview ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};