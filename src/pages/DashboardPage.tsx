import React, { useMemo } from 'react';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { useDatabase, InventoryItem } from '../services/db';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title,
  BarElement
);

export const DashboardPage: React.FC = () => {
  const { data: inventoryItems, loading: inventoryLoading } = useDatabase<InventoryItem>('inventory');

  const stats = useMemo(() => {
    if (inventoryLoading || !inventoryItems.length) {
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        categories: {}
      };
    }

    const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    const lowStockItems = inventoryItems.filter(
      item => item.reorderPoint && item.quantity <= item.reorderPoint
    ).length;

    const categories: Record<string, number> = {};
    inventoryItems.forEach(item => {
      if (categories[item.category]) {
        categories[item.category] += 1;
      } else {
        categories[item.category] = 1;
      }
    });

    return {
      totalItems,
      totalValue,
      lowStockItems,
      categories
    };
  }, [inventoryItems, inventoryLoading]);

  const categoryChartData = useMemo(() => {
    const labels = Object.keys(stats.categories).map(
      cat => cat.charAt(0).toUpperCase() + cat.slice(1)
    );
    const data = Object.values(stats.categories);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#EC4899',
            '#14B8A6',
            '#F97316'
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [stats.categories]);

  const valueDistributionData = useMemo(() => {
    if (inventoryLoading || !inventoryItems.length) {
      return {
        labels: [],
        datasets: [{
          label: 'Inventory Value',
          data: [],
          backgroundColor: '#3B82F6',
        }]
      };
    }

    const topItemsByValue = [...inventoryItems]
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 8);

    return {
      labels: topItemsByValue.map(item => item.name),
      datasets: [{
        label: 'Inventory Value (DH)',
        data: topItemsByValue.map(item => item.price * item.quantity),
        backgroundColor: '#3B82F6',
      }]
    };
  }, [inventoryItems, inventoryLoading]);

  const inventoryTrendData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Total Items',
        data: [65, 72, 86, 81, 90, stats.totalItems],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Inventory Trend',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top Items by Value',
      },
    },
  };

  if (inventoryLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-emerald-100 p-3">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Inventory Value</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.totalValue.toFixed(2)} DH</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-amber-100 p-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.lowStockItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Product Categories</p>
              <p className="text-3xl font-semibold text-gray-900">{Object.keys(stats.categories).length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h2>
          <div className="h-64">
            {Object.keys(stats.categories).length > 0 ? (
              <Pie data={categoryChartData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Trend</h2>
          <div className="h-64">
            <Line options={lineOptions} data={inventoryTrendData} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 col-span-1 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Items by Value</h2>
          <div className="h-72">
            {inventoryItems.length > 0 ? (
              <Bar options={barOptions} data={valueDistributionData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No item data available
              </div>
            )}
          </div>
        </div>
      </div>
      
      {stats.lowStockItems > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <span className="font-medium">Attention needed:</span> {stats.lowStockItems} items are below their reorder point.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};