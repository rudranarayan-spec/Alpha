// types/dashboard.types.ts

export interface LatestOrder {
  id: number;
  user_id: number;
  order_number: string;
  amount: string;
  mode_of_payment: string;
  order_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  user_name: string;
  due_amount: string;
  total_orders: number;
  total_order_amount: string;
  latest_orders: LatestOrder[];
}

export interface DashboardApiResponse {
  status: string;
  data: DashboardData;
}
