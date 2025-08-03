import React, { useState, useEffect } from 'react';
import { Asset } from '../types/inventory';
import { X, Save, Wrench } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  asset?: Asset | null;
}

const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, asset }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    price: 0,
    quantity: '',
    purchasedDate: null as Date | null,
    note: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (asset) {
      setFormData({
        itemName: asset.itemName,
        price: asset.price,
        quantity: asset.quantity,
        purchasedDate: asset.purchasedDate,
        note: asset.note
      });
    } else {
      setFormData({
        itemName: '',
        price: 0,
        quantity: '',
        purchasedDate: null,
        note: ''
      });
    }
    setErrors({});
  }, [asset, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (value: string) => {
    const date = value ? new Date(value) : null;
    handleInputChange('purchasedDate', date);
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {asset ? 'Edit Asset' : 'Add New Asset'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => handleInputChange('itemName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.itemName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter asset name"
            />
            {errors.itemName && (
              <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="text"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="e.g., 5 units, 10 kg, 1 piece"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purchased Date</label>
            <input
              type="date"
              value={formatDateForInput(formData.purchasedDate)}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {asset ? 'Update' : 'Add'} Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;