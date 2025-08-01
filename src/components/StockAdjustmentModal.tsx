import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types/inventory';
import { X, Plus, Minus, Package } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (newStock: number) => void;
  item: InventoryItem | null;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdjust, 
  item 
}) => {
  const [adjustmentValue, setAdjustmentValue] = useState(1);
  const [newStock, setNewStock] = useState(0);

  useEffect(() => {
    if (item) {
      setNewStock(item.stock);
      setAdjustmentValue(1);
    }
  }, [item, isOpen]);

  const handleAdjustment = (amount: number) => {
    const updatedStock = Math.max(0, newStock + amount);
    setNewStock(updatedStock);
  };

  const handleCustomAdjustment = (isAddition: boolean) => {
    const amount = isAddition ? adjustmentValue : -adjustmentValue;
    handleAdjustment(amount);
  };

  const handleDirectStockChange = (value: number) => {
    setNewStock(Math.max(0, value));
  };

  const handleSave = () => {
    onAdjust(newStock);
    onClose();
  };

  if (!isOpen || !item) return null;

  const stockDifference = newStock - item.stock;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Adjust Stock</h2>
              <p className="text-sm text-gray-600">{item.itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Stock Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Current Stock:</span>
              <span className="text-lg font-bold text-gray-900">{item.stock} kg</span>
            </div>
          </div>

          {/* Quick Adjustment Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Adjustments
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAdjustment(-1)}
                disabled={newStock <= 0}
                className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4 mr-2" />
                Remove 1 kg
              </button>
              <button
                onClick={() => handleAdjustment(1)}
                className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add 1 kg
              </button>
            </div>
          </div>

          {/* Custom Value Adjustment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Custom Adjustment
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
              <button
                onClick={() => handleCustomAdjustment(false)}
                disabled={newStock <= 0}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCustomAdjustment(true)}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Direct Stock Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Exact Stock Amount
            </label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => handleDirectStockChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter exact stock amount"
            />
          </div>

          {/* Preview */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">New Stock:</span>
              <span className="text-lg font-bold text-blue-900">{newStock} kg</span>
            </div>
            {stockDifference !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Change:</span>
                <span className={`text-sm font-medium ${
                  stockDifference > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stockDifference > 0 ? '+' : ''}{stockDifference} kg
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Update Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;