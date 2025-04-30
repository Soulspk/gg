import React from 'react';
import { Package, User, Calendar, DollarSign, FileText, Truck } from 'lucide-react';
import { OrderData } from '../../services/db';

interface OrderDetailsProps {
  order: OrderData;
  onClose: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const paymentColors = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return statusColors.default;
    return statusColors[status.toLowerCase()] || statusColors.default;
  };

  const getPaymentColor = (paymentStatus: string | undefined) => {
    if (!paymentStatus) return paymentColors.default;
    return paymentColors[paymentStatus.toLowerCase()] || paymentColors.default;
  };

  const formatStatus = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

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
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    <Package size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Order #{order.id}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(order.paymentStatus)}`}>
                        {formatStatus(order.paymentStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                        <span>Ordered on {new Date(order.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <User className="h-5 w-5 text-blue-500 mr-3" />
                        <span>Client: {order.clientId}</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <DollarSign className="h-5 w-5 text-blue-500 mr-3" />
                        <span>Total: {order.total.toFixed(2)} DH</span>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h4>
                      <div className="flex items-start text-gray-700 dark:text-gray-300">
                        <FileText className="h-5 w-5 text-amber-500 mr-3 mt-1" />
                        <p>{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              Item #{item.inventoryItemId}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {(item.price * item.quantity).toFixed(2)} DH
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.price.toFixed(2)} DH each
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                      <div className="flex justify-between items-center text-lg font-medium text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>{order.total.toFixed(2)} DH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};