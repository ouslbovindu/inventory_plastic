import React, { useState, useEffect } from 'react';
import { InventoryItem, Asset, Production } from '../types/inventory';
import InventoryTable from './InventoryTable';
import AssetsTable from './AssetsTable';
import ProductionsTable from './ProductionsTable';
import ItemModal from './ItemModal';
import AssetModal from './AssetModal';
import ProductionModal from './ProductionModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import AssetAdjustmentModal from './AssetAdjustmentModal';
import ProductionAdjustmentModal from './ProductionAdjustmentModal';
import { supabase } from '../lib/supabase';
import { Plus, LogOut, Package, AlertTriangle, TrendingUp, BarChart3, Wrench, Factory } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [activeTab, setActiveTab] = useState<'materials' | 'assets' | 'productions'>('materials');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAssetAdjustModalOpen, setIsAssetAdjustModalOpen] = useState(false);
  const [isProductionAdjustModalOpen, setIsProductionAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustingAsset, setAdjustingAsset] = useState<Asset | null>(null);
  const [adjustingProduction, setAdjustingProduction] = useState<Production | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedSite, setSelectedSite] = useState<string>('Site 1');

  const SITE_LOCATIONS = ['Site 1', 'Site 2'];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await loadInventory();
      await loadAssets();
      await loadProductions();
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
        .eq('site_location', selectedSite)
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
        siteLocation: item.site_location,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('site_location', selectedSite)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assets:', error);
        return;
      }

      const formattedAssets = data.map((asset: any) => ({
        id: asset.id,
        itemName: asset.item_name,
        price: asset.price,
        quantity: asset.quantity,
        quantityNumeric: asset.quantity_numeric,
        purchasedDate: asset.purchased_date ? new Date(asset.purchased_date) : null,
        note: asset.note,
        userId: asset.user_id,
        siteLocation: asset.site_location,
        createdAt: new Date(asset.created_at),
        updatedAt: new Date(asset.updated_at)
      }));

      setAssets(formattedAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const loadProductions = async () => {
    try {
      const { data, error } = await supabase
        .from('productions')
        .select('*')
        .eq('site_location', selectedSite)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading productions:', error);
        return;
      }

      const formattedProductions = data.map((production: any) => ({
        id: production.id,
        itemName: production.item_name,
        quantity: production.quantity,
        quantityNumeric: production.quantity_numeric,
        client: production.client,
        note: production.note,
        userId: production.user_id,
        siteLocation: production.site_location,
        createdAt: new Date(production.created_at),
        updatedAt: new Date(production.updated_at)
      }));

      setProductions(formattedProductions);
    } catch (error) {
      console.error('Error loading productions:', error);
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
          user_id: user.id,
          site_location: selectedSite
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

  const handleAddAsset = async (assetData: Omit<Asset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('assets')
        .insert({
          item_name: assetData.itemName,
          price: assetData.price,
          quantity: assetData.quantity,
          quantity_numeric: assetData.quantityNumeric,
          purchased_date: assetData.purchasedDate ? assetData.purchasedDate.toISOString().split('T')[0] : null,
          note: assetData.note,
          user_id: user.id,
          site_location: selectedSite
        });

      if (error) {
        console.error('Error adding asset:', error);
        return;
      }

      await loadAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleAddProduction = async (productionData: Omit<Production, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('productions')
        .insert({
          item_name: productionData.itemName,
          quantity: productionData.quantity,
          quantity_numeric: productionData.quantityNumeric,
          client: productionData.client,
          note: productionData.note,
          user_id: user.id,
          site_location: selectedSite
        });

      if (error) {
        console.error('Error adding production:', error);
        return;
      }

      await loadProductions();
    } catch (error) {
      console.error('Error adding production:', error);
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

  const handleEditAsset = async (assetData: Omit<Asset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingAsset) return;

    try {
      const { error } = await supabase
        .from('assets')
        .update({
          item_name: assetData.itemName,
          price: assetData.price,
          quantity: assetData.quantity,
          quantity_numeric: assetData.quantityNumeric,
          purchased_date: assetData.purchasedDate ? assetData.purchasedDate.toISOString().split('T')[0] : null,
          note: assetData.note
        })
        .eq('id', editingAsset.id);

      if (error) {
        console.error('Error updating asset:', error);
        return;
      }

      await loadAssets();
      setEditingAsset(null);
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const handleEditProduction = async (productionData: Omit<Production, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProduction) return;

    try {
      const { error } = await supabase
        .from('productions')
        .update({
          item_name: productionData.itemName,
          quantity: productionData.quantity,
          quantity_numeric: productionData.quantityNumeric,
          client: productionData.client,
          note: productionData.note
        })
        .eq('id', editingProduction.id);

      if (error) {
        console.error('Error updating production:', error);
        return;
      }

      await loadProductions();
      setEditingProduction(null);
    } catch (error) {
      console.error('Error updating production:', error);
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

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        const { error } = await supabase
          .from('assets')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting asset:', error);
          return;
        }

        await loadAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleDeleteProduction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this production record?')) {
      try {
        const { error } = await supabase
          .from('productions')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting production:', error);
          return;
        }

        await loadProductions();
      } catch (error) {
        console.error('Error deleting production:', error);
      }
    }
  };

  const handleStockAdjustment = async (newStock: number) => {
    if (!adjustingItem) return;
    
    const status = calculateStatus(newStock, adjustingItem.repurchaseMargin);

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          stock: newStock,
          status: status
        })
        .eq('id', adjustingItem.id);

      if (error) {
        console.error('Error updating stock:', error);
        return;
      }

      await loadInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleAssetQuantityAdjustment = async (newQuantity: number) => {
    if (!adjustingAsset) return;

    try {
      const { error } = await supabase
        .from('assets')
        .update({
          quantity_numeric: newQuantity
        })
        .eq('id', adjustingAsset.id);

      if (error) {
        console.error('Error updating asset quantity:', error);
        return;
      }

      await loadAssets();
    } catch (error) {
      console.error('Error updating asset quantity:', error);
    }
  };

  const handleProductionQuantityAdjustment = async (newQuantity: number) => {
    if (!adjustingProduction) return;

    try {
      const { error } = await supabase
        .from('productions')
        .update({
          quantity_numeric: newQuantity
        })
        .eq('id', adjustingProduction.id);

      if (error) {
        console.error('Error updating production quantity:', error);
        return;
      }

      await loadProductions();
    } catch (error) {
      console.error('Error updating production quantity:', error);
    }
  };

  const openStockAdjustmentModal = (item: InventoryItem) => {
    setAdjustingItem(item);
    setIsStockModalOpen(true);
  };

  const closeStockModal = () => {
    setIsStockModalOpen(false);
    setAdjustingItem(null);
  };

  const openAssetAdjustmentModal = (asset: Asset) => {
    setAdjustingAsset(asset);
    setIsAssetAdjustModalOpen(true);
  };

  const closeAssetAdjustModal = () => {
    setIsAssetAdjustModalOpen(false);
    setAdjustingAsset(null);
  };

  const openProductionAdjustmentModal = (production: Production) => {
    setAdjustingProduction(production);
    setIsProductionAdjustModalOpen(true);
  };

  const closeProductionAdjustModal = () => {
    setIsProductionAdjustModalOpen(false);
    setAdjustingProduction(null);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const openEditAssetModal = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const closeAssetModal = () => {
    setIsAssetModalOpen(false);
    setEditingAsset(null);
  };

  const openEditProductionModal = (production: Production) => {
    setEditingProduction(production);
    setIsProductionModalOpen(true);
  };

  const closeProductionModal = () => {
    setIsProductionModalOpen(false);
    setEditingProduction(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const getStats = () => {
    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.status === 'repurchase needed').length;
    const outOfStockItems = items.filter(item => item.status === 'temporarily unavailable').length;
    const materialsValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0);
    const assetsValue = assets.reduce((sum, asset) => sum + asset.price, 0);
    const totalAssets = assets.length;
    const totalProductions = productions.length;

    return { totalItems, lowStockItems, outOfStockItems, materialsValue, assetsValue, totalAssets, totalProductions };
  };

  const stats = getStats();

  // Reload data when site changes
  useEffect(() => {
    if (user) {
      loadInventory();
      loadAssets();
      loadProductions();
    }
  }, [selectedSite, user]);

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Business Management System</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Site:</label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[100px]"
                >
                  {SITE_LOCATIONS.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-4 sm:gap-8">
            <button
              onClick={() => setActiveTab('materials')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'materials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
              Materials
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'assets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wrench className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
              Assets
            </button>
            <button
              onClick={() => setActiveTab('productions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'productions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Factory className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
              Productions
            </button>
          </nav>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {activeTab === 'materials' && (
            <>
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Materials</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.lowStockItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Materials Value</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">Rs.{stats.materialsValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'assets' && (
            <>
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Assets</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Assets Value</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">Rs.{stats.assetsValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'productions' && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Factory className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Productions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalProductions}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {activeTab === 'materials' && 'Materials'}
              {activeTab === 'assets' && 'Assets'}
              {activeTab === 'productions' && 'Productions'}
            </h2>
            <p className="text-sm text-gray-600">{selectedSite}</p>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'materials') setIsModalOpen(true);
              else if (activeTab === 'assets') setIsAssetModalOpen(true);
              else if (activeTab === 'productions') setIsProductionModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Add {activeTab === 'materials' ? 'Material' : activeTab === 'assets' ? 'Asset' : 'Production'}
          </button>
        </div>

        {/* Tables */}
        {activeTab === 'materials' && (
          <InventoryTable
            items={items}
            onEdit={openEditModal}
            onDelete={handleDeleteItem}
            onOpenStockAdjustment={openStockAdjustmentModal}
          />
        )}

        {activeTab === 'assets' && (
          <AssetsTable
            assets={assets}
            onEdit={openEditAssetModal}
            onDelete={handleDeleteAsset}
            onOpenQuantityAdjustment={openAssetAdjustmentModal}
          />
        )}

        {activeTab === 'productions' && (
          <ProductionsTable
            productions={productions}
            onEdit={openEditProductionModal}
            onDelete={handleDeleteProduction}
            onOpenQuantityAdjustment={openProductionAdjustmentModal}
          />
        )}

        {/* Modals */}
        <ItemModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={editingItem ? handleEditItem : handleAddItem}
          item={editingItem}
          siteLocation={selectedSite}
        />

        <AssetModal
          isOpen={isAssetModalOpen}
          onClose={closeAssetModal}
          onSave={editingAsset ? handleEditAsset : handleAddAsset}
          asset={editingAsset}
          siteLocation={selectedSite}
        />

        <ProductionModal
          isOpen={isProductionModalOpen}
          onClose={closeProductionModal}
          onSave={editingProduction ? handleEditProduction : handleAddProduction}
          production={editingProduction}
          siteLocation={selectedSite}
        />

        {/* Stock Adjustment Modal */}
        <StockAdjustmentModal
          isOpen={isStockModalOpen}
          onClose={closeStockModal}
          onAdjust={handleStockAdjustment}
          item={adjustingItem}
        />

        {/* Asset Adjustment Modal */}
        <AssetAdjustmentModal
          isOpen={isAssetAdjustModalOpen}
          onClose={closeAssetAdjustModal}
          onAdjust={handleAssetQuantityAdjustment}
          asset={adjustingAsset}
        />

        {/* Production Adjustment Modal */}
        <ProductionAdjustmentModal
          isOpen={isProductionAdjustModalOpen}
          onClose={closeProductionAdjustModal}
          onAdjust={handleProductionQuantityAdjustment}
          production={adjustingProduction}
        />
      </div>
    </div>
  );
};

export default Dashboard;