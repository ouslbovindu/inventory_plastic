import React, { useState, useEffect } from 'react';
import { Production } from '../types/inventory';
import { X, Save, Factory } from 'lucide-react';

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (production: Omit<Production, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  production?: Production | null;
  siteLocation: string;
}

const ProductionModal: React.FC<ProductionModalProps> = ({ isOpen, onClose, onSave, production, siteLocation }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    quantityNumeric: 0,
    client: '',
    note: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (production) {
      setFormData({
        itemName: production.itemName,
        quantity: production.quantity,
        quantityNumeric: production.quantityNumeric,
        client: production.client,
        note: production.note
      });
    } else {
      setFormData({
        itemName: '',
        quantity: '',
        quantityNumeric: 0,
        client: '',
        note: ''
      });
    }
    setErrors({});
  }, [production, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Client is required';
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
      ...formData,
      siteLocation
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Factory className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {production ? 'Edit Production' : 'Add New Production'}
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
              placeholder="Enter item name"
            />
            {errors.itemName && (
              <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="text"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="e.g., 100 pieces, 50 kg, 25 units"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numeric Quantity</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.quantityNumeric}
              onChange={(e) => handleInputChange('quantityNumeric', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="0.00"
            />
            <p className="mt-1 text-xs text-gray-500">
              Numeric value for quantity adjustments
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.client ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter client name"
            />
            {errors.client && (
              <p className="mt-1 text-sm text-red-600">{errors.client}</p>
            )}
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
              {production ? 'Update' : 'Add'} Production
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionModal;