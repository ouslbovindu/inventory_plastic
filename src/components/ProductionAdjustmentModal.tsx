import React, { useState, useEffect } from 'react';
import { Production } from '../types/inventory';
import { X, Plus, Minus, Factory } from 'lucide-react';

interface ProductionAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (newQuantity: number) => void;
  production: Production | null;
}

const ProductionAdjustmentModal: React.FC<ProductionAdjustmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdjust, 
  production 
}) => {
  const [adjustmentValue, setAdjustmentValue] = useState(1);
  const [newQuantity, setNewQuantity] = useState(0);

  useEffect(() => {
    if (production) {
      setNewQuantity(production.quantityNumeric);
      setAdjustmentValue(1);
    }
  }, [production, isOpen]);

  const handleAdjustment = (amount: number) => {
    const updatedQuantity = Math.max(0, newQuantity + amount);
    setNewQuantity(updatedQuantity);
  };

  const handleCustomAdjustment = (isAddition: boolean) => {
    const amount = isAddition ? adjustmentValue : -adjustmentValue;
    handleAdjustment(amount);
  };

  const handleDirectQuantityChange = (value: number) => {
    setNewQuantity(Math.max(0, value));
  };

  const handleSave = () => {
    onAdjust(newQuantity);
    onClose();
  };

  if (!isOpen || !production) return null;

  const quantityDifference = newQuantity - production.quantityNumeric;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Factory className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Adjust Quantity</h2>
              <p className="text-sm text-gray-600">{production.itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Quantity Display */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Current Quantity:</span>
              <span className="text-base font-bold text-gray-900">{production.quantityNumeric}</span>
            </div>
          </div>

          {/* Quick Adjustment Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Adjustments
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAdjustment(-1)}
                disabled={newQuantity <= 0}
                className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Minus className="h-4 w-4 mr-2" />
                Remove 1
              </button>
              <button
                onClick={() => handleAdjustment(1)}
                className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add 1
              </button>
            </div>
          </div>

          {/* Custom Value Adjustment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Adjustment
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                step="0.01"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(Math.max(0.01, parseFloat(e.target.value) || 1))}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Enter amount"
              />
              <button
                onClick={() => handleCustomAdjustment(false)}
                disabled={newQuantity <= 0}
                className="px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCustomAdjustment(true)}
                className="px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Direct Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Exact Quantity
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newQuantity}
              onChange={(e) => handleDirectQuantityChange(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Enter exact quantity"
            />
          </div>

          {/* Preview */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">New Quantity:</span>
              <span className="text-base font-bold text-blue-900">{newQuantity}</span>
            </div>
            {quantityDifference !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Change:</span>
                <span className={`text-sm font-medium ${
                  quantityDifference > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {quantityDifference > 0 ? '+' : ''}{quantityDifference}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors text-sm"
            >
              Update Quantity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionAdjustmentModal;