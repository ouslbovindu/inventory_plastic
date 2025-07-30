export interface InventoryItem {
  id: string;
  itemName: string;
  type: 'virgin' | 'recycled' | 'master' | 'special added' | '';
  price: number;
  stock: number;
  status: 'in stock' | 'repurchase needed' | 'temporarily unavailable';
  repurchaseMargin: number;
  note: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MATERIAL_TYPES = [
  { value: '', label: 'Select Type' },
  { value: 'virgin', label: 'Virgin' },
  { value: 'recycled', label: 'Recycled' },
  { value: 'master', label: 'Master' },
  { value: 'special added', label: 'Special Added' }
];

export const STATUS_TYPES = [
  { value: 'in stock', label: 'In Stock' },
  { value: 'repurchase needed', label: 'Repurchase Needed' },
  { value: 'temporarily unavailable', label: 'Temporarily Unavailable' }
];