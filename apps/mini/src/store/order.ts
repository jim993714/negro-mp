import { create } from 'zustand';
import { get, post } from '@/utils/request';
import type { Order, OrderStatus, PaginatedResponse, CreateOrderRequest } from '@/types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  total: number;
  page: number;
  isLoading: boolean;
  
  // Actions
  fetchOrders: (params?: { status?: OrderStatus; page?: number }) => Promise<void>;
  fetchOrderDetail: (id: string) => Promise<void>;
  createOrder: (data: CreateOrderRequest) => Promise<Order>;
  acceptOrder: (id: string) => Promise<void>;
  completeOrder: (id: string) => Promise<void>;
  confirmOrder: (id: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  addProgress: (id: string, content: string, images?: string[]) => Promise<void>;
  resetOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, getState) => ({
  orders: [],
  currentOrder: null,
  total: 0,
  page: 1,
  isLoading: false,

  fetchOrders: async (params = {}) => {
    try {
      set({ isLoading: true });
      const { page = 1, status } = params;
      
      let url = `/api/orders?page=${page}&pageSize=10`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const result = await get<PaginatedResponse<Order>>(url);
      
      set({
        orders: page === 1 ? result.items : [...getState().orders, ...result.items],
        total: result.total,
        page,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('获取订单列表失败:', error);
    }
  },

  fetchOrderDetail: async (id: string) => {
    try {
      set({ isLoading: true });
      const order = await get<Order>(`/api/orders/${id}`);
      set({ currentOrder: order, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('获取订单详情失败:', error);
    }
  },

  createOrder: async (data: CreateOrderRequest) => {
    const order = await post<Order>('/api/orders', data, { showLoading: true });
    return order;
  },

  acceptOrder: async (id: string) => {
    await post(`/api/orders/${id}/accept`, undefined, { showLoading: true });
    // 刷新订单详情
    await getState().fetchOrderDetail(id);
  },

  completeOrder: async (id: string) => {
    await post(`/api/orders/${id}/complete`, undefined, { showLoading: true });
    await getState().fetchOrderDetail(id);
  },

  confirmOrder: async (id: string) => {
    await post(`/api/orders/${id}/confirm`, undefined, { showLoading: true });
    await getState().fetchOrderDetail(id);
  },

  cancelOrder: async (id: string) => {
    await post(`/api/orders/${id}/cancel`, undefined, { showLoading: true });
    await getState().fetchOrderDetail(id);
  },

  addProgress: async (id: string, content: string, images?: string[]) => {
    await post(`/api/orders/${id}/progress`, { content, images }, { showLoading: true });
    await getState().fetchOrderDetail(id);
  },

  resetOrders: () => {
    set({ orders: [], total: 0, page: 1 });
  },
}));

