import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types/inventory';
import InventoryTable from './InventoryTable';
import ItemModal from './ItemModal';
import { supabase } from '../lib/supabase';
import { Plus, LogOut, Package, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await loadInventory();
    } else {
      onLogout();
    }
    setLoading(false);
  };

  const loadInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading inventory:', error);
        return;
      }

      const formattedItems = data.map((item: any) => ({
        id: item.id,
        itemName: item.item_name,
        type: item.type,
        price: item.price,
        stock: item.stock,
        status: item.status,
        repurchaseMargin: item.repurchase_margin,
        note: item.note,
        userId: item.user_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const calculateStatus = (stock: number, repurchaseMargin: number): InventoryItem['status'] => {
    if (stock === 0) return 'temporarily unavailable';
    if (stock <= repurchaseMargin) return 'repurchase needed';
    return 'in stock';
  };

  const handleAddItem = async (itemData: Omit<InventoryItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const status = calculateStatus(itemData.stock, itemData.repurchaseMargin);

    try {
      const { error } = await supabase
        .from('inventory_items')
        .insert({
          item_name: itemData.itemName,
          type: itemData.type,
          price: itemData.price,
          stock: itemData.stock,
          status: status,
          repurchase_margin: itemData.repurchaseMargin,
          note: itemData.note,
          user_id: user.id
        });

      if (error) {
        console.error('Error adding item:', error);
        return;
      }

      await loadInventory();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleEditItem = async (itemData: Omit<InventoryItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingItem) return;

    const status = calculateStatus(itemData.stock, itemData.repurchaseMargin);

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          item_name: itemData.itemName,
          type: itemData.type,
          price: itemData.price,
          stock: itemData.stock,
          status: status,
          repurchase_margin: itemData.repurchaseMargin,
          note: itemData.note
        })
        .eq('id', editingItem.id);

      if (error) {
        console.error('Error updating item:', error);
        return;
      }

      await loadInventory();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const { error } = await supabase
          .from('inventory_items')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting item:', error);
          return;
        }

        await loadInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleStockAdjustment = async (id: string, newStock: number) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    const status = calculateStatus(newStock, item.repurchaseMargin);

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          stock: newStock,
          status: status
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating stock:', error);
        return;
      }

      await loadInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const getStats = () => {
    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.status === 'repurchase needed').length;
    const outOfStockItems = items.filter(item => item.status === 'temporarily unavailable').length;
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0);

    return { totalItems, lowStockItems, outOfStockItems, totalValue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Inventory Items</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>

        {/* Inventory Table */}
        <InventoryTable
          items={items}
          onEdit={openEditModal}
          onDelete={handleDeleteItem}
          onStockAdjustment={handleStockAdjustment}
        />

        {/* Item Modal */}
        <ItemModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={editingItem ? handleEditItem : handleAddItem}
          item={editingItem}
        />
      </div>
    </div>
  );
};

export default Dashboard;