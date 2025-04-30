import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { ClientsPage } from './pages/ClientsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CartProvider } from './components/cart/CartContext';

function App() {
  // Add seed data for demo purposes on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeededData = localStorage.getItem('hasSeededData');
      
      if (!hasSeededData) {
        // Seed inventory data
        const inventoryData = [
          // ... (existing seed data)
        ];
        
        // Save seed data to localStorage
        localStorage.setItem('db_inventory', JSON.stringify(inventoryData));
        localStorage.setItem('db_clients', JSON.stringify([]));
        localStorage.setItem('db_orders', JSON.stringify([]));
        localStorage.setItem('hasSeededData', 'true');
      }
    }
  }, []);

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;