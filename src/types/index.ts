export type OrderStatus = 'paid' | 'pending' | 'refunded';
export type Category = 'Software' | 'Hardware' | 'Services' | 'Training' | 'Support';
export type Device = 'Desktop' | 'Mobile' | 'Tablet';
export type RangeDays = 7 | 30 | 90;

export interface Order {
  id: string;
  customer: string;
  category: Category;
  /** ISO calendar date, YYYY-MM-DD */
  date: string;
  status: OrderStatus;
  /** Amount in USD */
  amount: number;
}

export interface DailyPoint {
  /** ISO calendar date, YYYY-MM-DD */
  date: string;
  /** Sum of non-refunded order amounts */
  revenue: number;
  /** Visitors that day, split by device in `devices` */
  users: number;
  /** Count of non-refunded orders */
  orders: number;
  devices: Record<Device, number>;
}

export interface Dataset {
  orders: Order[];
  daily: DailyPoint[];
}

export const CATEGORIES: readonly Category[] = [
  'Software',
  'Hardware',
  'Services',
  'Training',
  'Support',
];
export const DEVICES: readonly Device[] = ['Desktop', 'Mobile', 'Tablet'];
export const ORDER_STATUSES: readonly OrderStatus[] = ['paid', 'pending', 'refunded'];
export const RANGE_OPTIONS: readonly RangeDays[] = [7, 30, 90];
