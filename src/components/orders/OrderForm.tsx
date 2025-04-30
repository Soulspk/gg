import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Calendar as CalendarIcon, X, Search, Plus, Package, UserPlus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useDatabase, OrderData, ClientData, InventoryItem } from '../../services/db';
import { useCart } from '../cart/CartContext';
import { Modal } from '../ui/Modal';
import { ClientForm } from '../clients/ClientForm';

interface OrderFormProps {
  onSubmit: (data: Omit<OrderData, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
];

export const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<ClientData[]>([]);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  
  const { data: clients, add: addClient } = useDatabase<ClientData>('clients');
  const { items: cartItems, clearCart } = useCart();

  const { control, handleSubmit, setValue, watch } = useForm<Omit<OrderData, 'id'>>({
    defaultValues: {
      clientId: '',
      items: [],
      status: 'pending',
      total: 0,
      date: new Date().toISOString(),
      paymentStatus: 'unpaid',
      notes: '',
    }
  });

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [searchTerm, clients]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setValue('date', date.toISOString());
    setShowCalendar(false);
  };

  const handleClientSelect = (client: ClientData) => {
    setSelectedClient(client);
    setValue('clientId', client.id);
    setSearchTerm('');
    setFilteredClients([]);
  };

  const handleNewClientSubmit = async (data: Omit<ClientData, 'id' | 'createdAt'>) => {
    const newClient = addClient(data);
    if (newClient) {
      setSelectedClient(newClient);
      setValue('clientId', newClient.id);
      setIsNewClientModalOpen(false);
    }
  };

  const clearClientSelection = () => {
    setSelectedClient(null);
    setValue('clientId', '');
  };

  const handleFormSubmit = handleSubmit((data) => {
    const orderData: Omit<OrderData, 'id'> = {
      ...data,
      items: cartItems.map(item => ({
        inventoryItemId: item.id,
        quantity: item.cartQuantity,
        price: item.price
      })),
      total: cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0),
    };
    onSubmit(orderData);
    clearCart();
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Order Information */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Information</h3>
            
            {/* Client Selection */}
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<UserPlus size={16} />}
                    onClick={() => setIsNewClientModalOpen(true)}
                  >
                    New Client
                  </Button>
                </div>
                <div className="relative">
                  {selectedClient ? (
                    <div className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-300 dark:border-gray-600">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedClient.name}</div>
                        {selectedClient.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{selectedClient.email}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={clearClientSelection}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search clients..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Client Search Results */}
                {filteredClients.length > 0 && !selectedClient && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                    <ul className="max-h-60 overflow-auto py-1">
                      {filteredClients.map((client) => (
                        <li
                          key={client.id}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => handleClientSelect(client)}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                          {client.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{client.email}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedDate ? selectedDate.toLocaleDateString() : ''}
                    readOnly
                    placeholder="Select date"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
                    onClick={() => setShowCalendar(!showCalendar)}
                  />
                  <CalendarIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(null);
                        setValue('date', new Date().toISOString());
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Calendar Popup */}
                {showCalendar && (
                  <div className="absolute z-10 mt-1 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-7 gap-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - date.getDay() + i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDateSelect(date)}
                            className={`
                              p-2 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                              ${selectedDate?.toDateString() === date.toDateString() ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Order Status"
                    options={STATUS_OPTIONS}
                    fullWidth
                    {...field}
                  />
                )}
              />

              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Payment Status"
                    options={PAYMENT_STATUS_OPTIONS}
                    fullWidth
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h3>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full min-h-[100px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter any additional notes"
                    {...field}
                  ></textarea>
                </div>
              )}
            />
          </div>
        </div>

        {/* Right Column - Order Items */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Items</h3>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No items in cart. Add some items from the inventory.
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  >
                    <div className="flex-shrink-0 w-16 h-16">
                      {item.imageUrls.length > 0 ? (
                        <img
                          src={item.imageUrls[0]}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                          <Package size={24} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.price.toFixed(2)} DH × {item.cartQuantity}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {(item.price * item.cartQuantity).toFixed(2)} DH
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-medium text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>
                      {cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0).toFixed(2)} DH
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={cartItems.length === 0 || !selectedClient}>
          Create Order
        </Button>
      </div>

      {/* New Client Modal */}
      <Modal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        title="Add New Client"
        size="2xl"
      >
        <ClientForm
          onSubmit={handleNewClientSubmit}
          onCancel={() => setIsNewClientModalOpen(false)}
        />
      </Modal>
    </form>
  );
};