import React from 'react';
import { Asset } from '../types/inventory';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { Settings } from 'lucide-react';

interface AssetsTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onOpenQuantityAdjustment: (asset: Asset) => void;
}

const AssetsTable: React.FC<AssetsTableProps> = ({ assets, onEdit, onDelete, onOpenQuantityAdjustment }) => {
  const formatPrice = (price: number) => {
    return price > 0 ? `Rs.${price.toFixed(2)}` : '-';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString();
  };

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No assets recorded</h3>
        <p className="text-gray-500">Add your first asset to get started.</p>
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
                Price
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Quick Adjust
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Purchased Date
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
            {assets.map((asset, index) => (
              <tr key={asset.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-gray-900">
                  {asset.id}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {asset.itemName}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                  {formatPrice(asset.price)}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {asset.quantity || '-'}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <button
                    onClick={() => onOpenQuantityAdjustment(asset)}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors flex items-center text-xs sm:text-sm"
                    title="Adjust quantity"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Adjust
                  </button>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                  {formatDate(asset.purchasedDate)}
                </td>
                <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden xl:table-cell">
                  {asset.note || '-'}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col lg:flex-row gap-1 lg:gap-2">
                    <button
                      onClick={() => onOpenQuantityAdjustment(asset)}
                      className="lg:hidden px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors text-xs"
                      title="Adjust quantity"
                    >
                      <Settings className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onEdit(asset)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit asset"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(asset.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete asset"
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

export default AssetsTable;
