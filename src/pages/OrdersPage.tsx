import React, { useState, useEffect } from 'react';
import { Plus, Package, Calendar, DollarSign, User, Truck, Eye, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { OrderForm } from '../components/orders/OrderForm';
import { OrderDetails } from '../components/orders/OrderDetails';
import { OrderFilters } from '../components/orders/OrderFilters';
import { useDatabase, OrderData } from '../services/db';
import toast from 'react-hot-toast';

export const OrdersPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [filteredData, setFilteredData] = useState<OrderData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    data: orders, 
    loading, 
    add: addOrder,
  } = useDatabase<OrderData>('orders');

  useEffect(() => {
    setFilteredData(orders);
  }, [orders]);

  const handleFilter = (filters: any) => {
    let filtered = [...orders];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.clientId.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    
    if (filters.paymentStatus) {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentStatus);
    }
    
    setFilteredData(filtered);
  };

  const handleAddOrder = async (data: Omit<OrderData, 'id'>) => {
    setIsSubmitting(true);
    try {
      const newOrder = addOrder(data);
      if (newOrder) {
        toast.success('Order created successfully');
        setIsAddModalOpen(false);
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      id: 'orderInfo',
      header: 'Order Info',
      accessor: (row: OrderData) => row.id,
      sortable: true,
      cell: (row: OrderData) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
            <Package size={20} />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-white">#{row.id}</div>
            <div className="text-sm text-gray-500">{new Date(row.date).toLocaleDateString()}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'client',
      header: 'Client',
      accessor: (row: OrderData) => row.clientId,
      sortable: true,
      cell: (row: OrderData) => (
        <div className="flex items-center">
          <User size={16} className="text-gray-400 mr-2" />
          <span className="text-gray-900 dark:text-white">{row.clientId}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row: OrderData) => row.status,
      sortable: true,
      cell: (row: OrderData) => {
        const statusStyles = {
          pending: 'bg-yellow-100 text-yellow-800',
          processing: 'bg-blue-100 text-blue-800',
          shipped: 'bg-purple-100 text-purple-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.status] || 'bg-gray-100 text-gray-800'}`}>
            {row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || 'Unknown'}
          </span>
        );
      },
    },
    {
      id: 'payment',
      header: 'Payment',
      accessor: (row: OrderData) => row.paymentStatus,
      sortable: true,
      cell: (row: OrderData) => {
        const paymentStyles = {
          paid: 'bg-green-100 text-green-800',
          unpaid: 'bg-red-100 text-red-800',
          partial: 'bg-yellow-100 text-yellow-800',
        };

        const paymentStatus = row.paymentStatus || 'unknown';
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStyles[paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
            {paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1) || 'Unknown'}
          </span>
        );
      },
    },
    {
      id: 'total',
      header: 'Total',
      accessor: (row: OrderData) => row.total,
      sortable: true,
      cell: (row: OrderData) => (
        <div className="flex items-center font-medium text-gray-900 dark:text-white">
          <DollarSign size={16} className="text-gray-400 mr-1" />
          {row.total?.toFixed(2) || '0.00'} DH
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '100px',
      cell: (row: OrderData) => (
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => {
              setSelectedOrder(row);
              setIsDetailsOpen(true);
            }}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <OrderFilters onFilter={handleFilter} />

      <Table<OrderData>
        columns={columns}
        data={filteredData}
        keyField="id"
        tableId="orders"
        isLoading={loading}
        emptyMessage="No orders found. Create a new order to get started!"
        actions={
          <Button 
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Create Order
          </Button>
        }
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Order"
        size="2xl"
      >
        <OrderForm
          onSubmit={handleAddOrder}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {isDetailsOpen && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};