import React from 'react';
import { Production } from '../types/inventory';
import { Edit, Trash2, Factory } from 'lucide-react';
import { Settings } from 'lucide-react';

interface ProductionsTableProps {
  productions: Production[];
  onEdit?: (production: Production) => void;
  onDelete?: (id: string) => void;
  onOpenQuantityAdjustment?: (production: Production) => void;
  userType: 'regular' | 'worker';
}

const ProductionsTable: React.FC<ProductionsTableProps> = ({ productions, onEdit, onDelete, onOpenQuantityAdjustment, userType }) => {
  if (productions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Factory className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No production records</h3>
        <p className="text-gray-500">Add your first production record to get started.</p>
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
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Quick Adjust
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Client
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
            {productions.map((production, index) => (
              <tr key={production.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-gray-900">
                  {production.id}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {production.itemName}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {production.quantity || '-'}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  {onOpenQuantityAdjustment && (
                    <button
                    onClick={() => onOpenQuantityAdjustment(production)}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors flex items-center text-xs sm:text-sm"
                    title="Adjust quantity"
                    >
                    <Settings className="h-3 w-3 mr-1" />
                    Adjust
                    </button>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                  {production.client}
                </td>
                <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden xl:table-cell">
                  {production.note || '-'}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col lg:flex-row gap-1 lg:gap-2">
                    {onOpenQuantityAdjustment && (
                      <button
                      onClick={() => onOpenQuantityAdjustment(production)}
                      className="lg:hidden px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors text-xs"
                      title="Adjust quantity"
                      >
                      <Settings className="h-3 w-3" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                      onClick={() => onEdit(production)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit production"
                      >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                      onClick={() => onDelete(production.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete production"
                      >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
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

export default ProductionsTable;