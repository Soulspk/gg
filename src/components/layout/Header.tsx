import React, { useState } from 'react';
import { Bell, Search, Sun, Moon, ShoppingCart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { CartPopover } from '../cart/CartPopover';

interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/inventory':
      return 'Inventory Management';
    case '/orders':
      return 'Orders';
    case '/clients':
      return 'Clients';
    case '/settings':
      return 'Settings';
    default:
      if (pathname.startsWith('/inventory/')) return 'Inventory Item';
      if (pathname.startsWith('/orders/')) return 'Order Details';
      if (pathname.startsWith('/clients/')) return 'Client Profile';
      return 'InvTracker';
  }
};

export const Header: React.FC<HeaderProps> = ({ title, actions, onThemeToggle, theme }) => {
  const location = useLocation();
  const pageTitle = title || getPageTitle(location.pathname);
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{pageTitle}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button
              type="button"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              onClick={onThemeToggle}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none relative"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {actions}
          </div>
        </div>
      </div>

      <CartPopover isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};