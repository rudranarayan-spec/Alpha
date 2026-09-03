import api from "@/lib/api/client";

export interface CreateOrderPayload {
  product_name: string[];
  pack_size: string[];
  qty: number[];
  cost_price: number[];
  order_amount: number;
}

export interface OrderResponse {
  status: string;
  message: string;
  data: string;
}

export interface OrderDetail {
  id: number;
  order_id: number;
  product_name: string;
  pack_size: string;
  qty: number;
  cost_price: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  amount: string;
  mode_of_payment: string;
  order_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  order_details: OrderDetail[];
}

export interface MyOrdersResponse {
  status: string;
  data: Order[];
}

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>("/create-order", payload);
    return response.data;
  },

  getMyOrders: async (): Promise<MyOrdersResponse> => {
    const response = await api.get<MyOrdersResponse>("/my-orders");
    return response.data;
  },
};
