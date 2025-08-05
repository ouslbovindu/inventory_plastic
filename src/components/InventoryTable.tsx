import React from 'react';
import { InventoryItem } from '../types/inventory';
import { Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Settings } from 'lucide-react';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onOpenStockAdjustment: (item: InventoryItem) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onEdit, onDelete, onOpenStockAdjustment }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in stock':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'repurchase needed':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'temporarily unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    switch (status) {
      case 'in stock':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'repurchase needed':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'temporarily unavailable':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatPrice = (price: number) => {
    return price > 0 ? `Rs.${price.toFixed(2)}` : '-';
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
        <div className="text-gray-400 mb-4">
          <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No items in inventory</h3>
        <p className="text-gray-500">Add your first inventory item to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item ID
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Type
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock (kg)
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Quick Adjust
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Repurchase Margin
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Note
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-gray-900">
                  {item.id}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.itemName}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                  {item.type || '-'}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(item.price)}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.stock} kg
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <button
                    onClick={() => onOpenStockAdjustment(item)}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors flex items-center text-xs sm:text-sm"
                    title="Adjust stock"
                  >
                    <Settings className="h-3 w-3 mr-1 sm:mr-1" />
                    Adjust
                  </button>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <span className={getStatusBadge(item.status)}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden xl:table-cell">
                  {item.repurchaseMargin} kg
                </td>
                <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden xl:table-cell">
                  {item.note || '-'}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col lg:flex-row gap-1 lg:gap-2">
                    <button
                      onClick={() => onOpenStockAdjustment(item)}
                      className="lg:hidden px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors text-xs"
                      title="Adjust stock"
                    >
                      <Settings className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit item"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;