import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from './CartContext';
import { Button } from '../ui/Button';

interface CartPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartPopover: React.FC<CartPopoverProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <ShoppingCart size={48} className="mb-4" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
                          <ShoppingCart size={24} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.price.toFixed(2)} DH
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="text-gray-700 dark:text-gray-300 w-8 text-center">
                        {item.cartQuantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Plus size={16} />
                      </button>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex justify-between text-lg font-medium text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{total.toFixed(2)} DH</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={items.length === 0}
              >
                Clear Cart
              </Button>
              
              <Button
                disabled={items.length === 0}
                onClick={() => {
                  // Order creation functionality will be added later
                  alert('Create order functionality coming soon!');
                }}
              >
                Create Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};