export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  RATED = 'RATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderCustomer {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  deliveryAddress: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  status: OrderStatus;
  rating?: number;
  ratingComment?: string;
  specialInstructions?: string;
  assignedChef?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignedWaiter?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  confirmedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  deliveringAt?: string;
  deliveredAt?: string;
  ratedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  created_at: string;
  updated_at: string;
  isActive: boolean;
  statusLabel: string;
  statusStep: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  delivering: number;
  delivered: number;
  rated: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  avgRating: number;
  totalRatings: number;
  dailyStats: { _id: string; count: number; revenue: number }[];
  recentOrders: Order[];
}