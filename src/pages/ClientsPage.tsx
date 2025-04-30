import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, UserPlus, Mail, Phone, MapPin, FileText, Ban, Flag, Eye, Pen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { ClientForm } from '../components/clients/ClientForm';
import { ClientDetails } from '../components/clients/ClientDetails';
import { ClientFilters } from '../components/clients/ClientFilters';
import { useDatabase, ClientData } from '../services/db';
import toast from 'react-hot-toast';

export const ClientsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [clientsToDelete, setClientsToDelete] = useState<ClientData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredData, setFilteredData] = useState<ClientData[]>([]);

  const { 
    data: clients, 
    loading, 
    add: addClient,
    update: updateClient,
    bulkRemove,
  } = useDatabase<ClientData>('clients');

  useEffect(() => {
    setFilteredData(clients);
  }, [clients]);

  const handleFilter = (filters: any) => {
    let filtered = [...clients];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        client => 
          client.name.toLowerCase().includes(searchTerm) || 
          (client.email && client.email.toLowerCase().includes(searchTerm)) ||
          (client.phone && client.phone.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.status) {
      switch (filters.status) {
        case 'blacklisted':
          filtered = filtered.filter(client => client.blacklisted);
          break;
        case 'flagged':
          filtered = filtered.filter(client => client.flagged);
          break;
        case 'active':
          filtered = filtered.filter(client => !client.blacklisted && !client.flagged);
          break;
      }
    }
    
    // Sort the data
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastOrder':
          const dateA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
          const dateB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
          return dateB - dateA;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredData(filtered);
  };

  const handleAddClient = async (data: Omit<ClientData, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    try {
      const newClient = addClient(data);
      if (newClient) {
        toast.success('Client added successfully');
        setIsAddModalOpen(false);
      } else {
        toast.error('Failed to add client');
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async (data: Omit<ClientData, 'id' | 'createdAt'>) => {
    if (!selectedClient) return;
    
    setIsSubmitting(true);
    try {
      const success = updateClient(selectedClient.id, data);
      if (success) {
        toast.success('Client updated successfully');
        setIsEditModalOpen(false);
        setSelectedClient(null);
      } else {
        toast.error('Failed to update client');
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = (clients: ClientData[]) => {
    setClientsToDelete(clients);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDeleteConfirm = () => {
    try {
      const ids = clientsToDelete.map(client => client.id);
      const success = bulkRemove(ids);
      
      if (success) {
        toast.success(`${clientsToDelete.length} clients deleted successfully`);
        setIsDeleteModalOpen(false);
        setClientsToDelete([]);
      } else {
        toast.error('Failed to delete clients');
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const columns = [
    {
      id: 'name',
      header: 'Name',
      accessor: (row: ClientData) => row.name,
      sortable: true,
      cell: (row: ClientData) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
            <div className="flex items-center space-x-2">
              {row.blacklisted && (
                <div className="flex items-center text-xs text-red-600">
                  <Ban size={12} className="mr-1" />
                  Blacklisted
                </div>
              )}
              {row.flagged && (
                <div className="flex items-center text-xs text-amber-600">
                  <Flag size={12} className="mr-1" />
                  Flagged
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      accessor: (row: ClientData) => row.email || row.phone || '-',
      sortable: true,
      cell: (row: ClientData) => (
        <div className="space-y-1">
          {row.email && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Mail size={14} className="mr-2" />
              {row.email}
            </div>
          )}
          {row.phone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Phone size={14} className="mr-2" />
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'address',
      header: 'Address',
      accessor: (row: ClientData) => row.address || '-',
      sortable: true,
      cell: (row: ClientData) => (
        row.address ? (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPin size={14} className="mr-2 flex-shrink-0" />
            {row.address}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      id: 'notes',
      header: 'Notes',
      accessor: (row: ClientData) => row.notes || '-',
      sortable: true,
      cell: (row: ClientData) => (
        row.notes ? (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <FileText size={14} className="mr-2 flex-shrink-0" />
            {row.notes}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      id: 'lastOrder',
      header: 'Last Order',
      accessor: (row: ClientData) => row.lastOrderDate || '-',
      sortable: true,
      cell: (row: ClientData) => (
        row.lastOrderDate ? (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(row.lastOrderDate).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-gray-400">No orders yet</span>
        )
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '120px',
      cell: (row: ClientData) => (
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
            onClick={() => {
              setSelectedClient(row);
              setIsEditModalOpen(true);
            }}
          >
            <Pen size={16} />
          </button>
          
          <button
            type="button"
            className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => {
              setSelectedClient(row);
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
      <ClientFilters onFilter={handleFilter} />

      <Table<ClientData>
        columns={columns}
        data={filteredData}
        keyField="id"
        tableId="clients"
        isLoading={loading}
        isSelectable
        onBulkDelete={handleBulkDelete}
        emptyMessage="No clients found. Add some clients to get started!"
        actions={
          <Button 
            leftIcon={<UserPlus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Client
          </Button>
        }
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client"
        size="2xl"
      >
        <ClientForm
          onSubmit={handleAddClient}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        title="Edit Client"
        size="2xl"
      >
        {selectedClient && (
          <ClientForm
            initialData={selectedClient}
            onSubmit={handleUpdateClient}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedClient(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setClientsToDelete([]);
        }}
        title="Confirm Deletion"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setClientsToDelete([]);
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
              Delete {clientsToDelete.length} {clientsToDelete.length === 1 ? 'client' : 'clients'}?
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                This action cannot be undone. {clientsToDelete.length === 1 ? 'This client' : 'These clients'} will be permanently removed from your system.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {isDetailsOpen && selectedClient && (
        <ClientDetails
          client={selectedClient}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};