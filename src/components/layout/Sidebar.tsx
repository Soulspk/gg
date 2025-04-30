import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart2, 
  Settings,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobile: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuOpen: boolean;
  theme: 'light' | 'dark';
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: <BarChart2 size={20} /> },
  { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
  { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> },
  { name: 'Clients', path: '/clients', icon: <Users size={20} /> },
  { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  setMobileMenuOpen,
  mobileMenuOpen,
  theme
}) => {
  const renderMobileMenuButton = () => {
    if (!isMobile) return null;
    
    return (
      <button
        type="button"
        className="fixed top-4 left-4 z-50 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    );
  };

  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-300 ease-in-out`
    : 'w-64 h-screen sticky top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700';

  return (
    <>
      {renderMobileMenuButton()}
      
      <div className={sidebarClasses}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600">InvTracker</h1>
        </div>
        
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-semibold">U</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};