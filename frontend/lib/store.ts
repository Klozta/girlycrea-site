/**
 * Store Zustand pour la gestion d'état globale
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Cart
  cart: CartItem[];
  cartCount: number;
  
  // Actions Auth
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Actions Cart
  addToCart: (product: { id: string; title: string; price: number; image?: string }, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      cart: [],
      cartCount: 0,

      // Auth actions
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.login({ email, password });
          const { user, accessToken, refreshToken } = response;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken);
            }
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const response = await api.register({ email, password, name });
          const { user, accessToken, refreshToken } = response;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken);
            }
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
          set({ user: null, isAuthenticated: false, cart: [], cartCount: 0 });
        }
      },

      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const user = await api.getMe();
          set({ user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      },

      // Cart actions
      addToCart: (product, quantity = 1) => {
        const cart = api.addToCart(product, quantity);
        const cartCount = cart.reduce((sum: number, item) => sum + item.quantity, 0);
        set({ cart, cartCount });
      },

      removeFromCart: (productId) => {
        const cart = api.removeFromCart(productId);
        const cartCount = cart.reduce((sum: number, item) => sum + item.quantity, 0);
        set({ cart, cartCount });
      },

      updateCartQuantity: (productId, quantity) => {
        const cart = api.updateCartQuantity(productId, quantity);
        const cartCount = cart.reduce((sum: number, item) => sum + item.quantity, 0);
        set({ cart, cartCount });
      },

      clearCart: () => {
        api.clearCart();
        set({ cart: [], cartCount: 0 });
      },
    }),
    {
      name: 'girlycrea-store',
      partialize: (state) => ({
        cart: state.cart,
        cartCount: state.cartCount,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialiser le panier depuis localStorage au démarrage
if (typeof window !== 'undefined') {
  const cart = api.getCart();
  const cartCount = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  useStore.setState({ cart, cartCount });
}

