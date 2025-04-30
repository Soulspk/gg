import React from 'react';
import { Mail, Phone, MapPin, FileText, Calendar, Ban, Flag, Package } from 'lucide-react';
import { ClientData } from '../../services/db';

interface ClientDetailsProps {
  client: ClientData;
  onClose: () => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose }) => {
  // Mock order statistics for the client
  const orderStats = {
    totalOrders: 12,
    totalSpent: 4500.00,
    averageOrderValue: 375.00,
    lastOrderValue: 420.00
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
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      {client.blacklisted && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          <Ban size={12} className="mr-1" />
                          Blacklisted
                        </span>
                      )}
                      {client.flagged && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <Flag size={12} className="mr-1" />
                          Flagged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h4>
                    {client.email && (
                      <div className="flex items-center text-gray-700 dark:text-gray-300 mb-4 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-500 mr-3" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center text-gray-700 dark:text-gray-300 mb-4 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <Phone className="h-5 w-5 text-blue-500 mr-3" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                        <span>{client.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Statistics */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Orders</div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{orderStats.totalOrders}</div>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Spent</div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{orderStats.totalSpent.toFixed(2)} DH</div>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Order Value</div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{orderStats.averageOrderValue.toFixed(2)} DH</div>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Last Order Value</div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{orderStats.lastOrderValue.toFixed(2)} DH</div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section - Moved here */}
                  {client.notes && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h4>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-start text-gray-700 dark:text-gray-300">
                          <FileText className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span>{client.notes}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Status Information */}
                <div className="space-y-4">
                  {client.blacklisted && (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <Ban className="h-6 w-6 text-red-500 mr-2" />
                        <h4 className="text-lg font-semibold text-red-900 dark:text-red-100">Blacklist Information</h4>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <p className="text-red-700 dark:text-red-200">{client.blacklistReason}</p>
                      </div>
                    </div>
                  )}

                  {client.flagged && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <Flag className="h-6 w-6 text-amber-500 mr-2" />
                        <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Flag Information</h4>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <p className="text-amber-700 dark:text-amber-200">{client.flagReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h4>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                        <span>Member since {new Date(client.createdAt).toLocaleDateString()}</span>
                      </div>
                      {client.lastOrderDate && (
                        <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <Package className="h-5 w-5 text-gray-500 mr-3" />
                          <span>Last order on {new Date(client.lastOrderDate).toLocaleDateString()}</span>
                        </div>
                      )}
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